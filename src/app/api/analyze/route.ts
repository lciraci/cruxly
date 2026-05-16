import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { EnrichedArticle } from '@/types/news';
import { StoryAnalysis, SourceAnalysis, FactClaim, BiasIndicator, StorySnapshot } from '@/types/analysis';
import { normalizeStoryId, getSnapshots, saveSnapshot, computeDrift } from '@/lib/story-store';
import { trackEvent } from '@/lib/analytics';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { getSupabaseAuthClient } = await import('@/lib/supabase');
  const supabase = getSupabaseAuthClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function POST(request: NextRequest) {
  // Auth check
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Login required to use Cruxly Analysis.' }, { status: 401 });
  }

  try {
    const { articles, topic } = await request.json() as {
      articles: EnrichedArticle[];
      topic: string;
    };

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: 'No articles provided' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Prepare article summaries for Claude
    const articleSummaries = articles.map((article, idx) => ({
      index: idx,
      source: article.source.name,
      bias: article.sourceBias || 'unknown',
      title: article.title,
      description: article.description,
      content: article.content?.substring(0, 2000), // RSS gives full text, use more for better analysis
      url: article.url,
    }));

    const systemInstructions = `You are a news bias analyst. When given articles covering a topic, analyze them and return a JSON object with this exact structure:
{
  "consensusFacts": [
    {
      "claim": "string",
      "sourceCount": number,
      "sources": ["source names — plain name only, e.g. 'BBC News', never add index numbers"],
      "confidence": "high" | "medium" | "low"
    }
  ],
  "disputedClaims": [
    {
      "claim": "string",
      "sourceCount": number,
      "sources": ["source names — plain name only, e.g. 'The Guardian', never add index numbers"],
      "confidence": "high" | "medium" | "low"
    }
  ],
  "sourceAnalyses": [
    {
      "sourceId": number,
      "sourceName": "string — use ONLY the source field value, never append article topic or index",
      "factualClaims": ["string"],
      "biasIndicators": [
        {
          "type": "emotional-language" | "omission" | "framing" | "source-selection",
          "description": "string",
          "examples": ["string"],
          "severity": "high" | "medium" | "low"
        }
      ],
      "emotionalTone": "neutral" | "positive" | "negative" | "mixed",
      "keyOmissions": ["string"],
      "score": number
    }
  ],
  "summary": "string",
  "perspectives": {
    "left": "string or null — 2-3 sentences on how left/center-left sources frame this story: their emphasis, narrative, and tone. null if no such sources.",
    "center": "string or null — same for center sources. null if none.",
    "right": "string or null — same for right/center-right sources. null if none."
  },
  "keyOmissions": {
    "left": ["specific fact or context left-leaning sources omit but others cover"],
    "center": ["specific fact or context center sources omit but others cover"],
    "right": ["specific fact or context right-leaning sources omit but others cover"]
  }
}

Analysis rules:
1. CONSENSUS FACTS: Factual claims that appear in multiple sources (especially across different biases). List which sources by plain name only (no numbers).
2. DISPUTED CLAIMS: Claims that only appear in some sources or are framed very differently. Source names only — never append article indices.
3. SOURCE-BY-SOURCE ANALYSIS: For each article provide key factual claims, bias indicators, emotional tone, omissions, and a score (0-100). Use ONLY the provided "source" field value as sourceName.
4. SUMMARY: A neutral, fact-based summary synthesizing what we can confidently know.
5. PERSPECTIVES: Group as left-leaning (bias: left or center-left), center (bias: center), right-leaning (bias: center-right or right). Write 2-3 sentences on how each group frames the story — their emphasis, angle, and what they stress. null if that group has no articles.
6. KEY OMISSIONS BY BIAS: For each group, list 2-4 SPECIFIC facts or context points they leave out while other groups cover them. Be concrete — not vague phrases like "nuance" but actual missing information.

Return ONLY valid JSON — no markdown, no explanation.`;

    const userMessage = `Analyze news coverage of: "${topic}"

${articles.length} articles from sources with different political leanings:
${articleSummaries.map(a => `${a.index}. ${a.source} (${a.bias}): ${a.title}`).join('\n')}

Full article details:
${JSON.stringify(articleSummaries, null, 2)}`;

    // Call Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      temperature: 0.3,
      system: [
        {
          type: 'text',
          text: systemInstructions,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract the text response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse Claude's JSON response
    let analysisData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) ||
                       responseText.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
      analysisData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI analysis', rawResponse: responseText },
        { status: 500 }
      );
    }

    // Strip any "(N)" suffixes Claude appends to source names in claims
    const cleanSources = (sources: any[]) =>
      (sources ?? []).map((s: string) => String(s).replace(/\s*\(\d+\)\s*$/, '').trim()).filter(Boolean);

    // Map sourceId back to article data; override sourceName with the real publisher name
    const sourceAnalyses: SourceAnalysis[] = analysisData.sourceAnalyses.map((sa: any) => {
      const article = articles[sa.sourceId];
      return {
        ...sa,
        sourceName: article.source.name,
        sourceId: article.source.id || article.source.name,
        articleUrl: article.url,
      };
    });

    // Clean source lists in consensus / disputed claims
    const consensusFacts = (analysisData.consensusFacts ?? []).map((f: any) => ({
      ...f,
      sources: cleanSources(f.sources),
    }));
    const disputedClaims = (analysisData.disputedClaims ?? []).map((c: any) => ({
      ...c,
      sources: cleanSources(c.sources),
    }));

    const now = new Date().toISOString();
    const storyId = normalizeStoryId(topic);

    // Load existing snapshots for this story (before saving the new one)
    const existingSnapshots = await getSnapshots(topic);

    // Build and persist the new snapshot
    const snapshot: StorySnapshot = {
      storyId,
      topic,
      timestamp: now,
      consensusFacts: analysisData.consensusFacts,
      disputedClaims: analysisData.disputedClaims,
      summary: analysisData.summary,
      sourceCount: articles.length,
    };
    await saveSnapshot(snapshot);

    // Compute narrative drift when there's at least one prior snapshot
    const drift = existingSnapshots.length > 0
      ? computeDrift(snapshot, existingSnapshots)
      : undefined;

    const analysis: StoryAnalysis = {
      topic,
      consensusFacts,
      disputedClaims,
      sourceAnalyses,
      summary: analysisData.summary,
      timestamp: now,
      drift,
      snapshotCount: existingSnapshots.length + 1,
      perspectives: analysisData.perspectives ?? undefined,
      keyOmissions: analysisData.keyOmissions ?? undefined,
    };

    trackEvent('analysis', {
      topic,
      articleCount: articles.length,
      snapshotCount: analysis.snapshotCount,
      hasDrift: !!analysis.drift,
    }, user.id).catch(() => {});

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
