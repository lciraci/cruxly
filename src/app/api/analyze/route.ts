import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { EnrichedArticle } from '@/types/news';
import { StoryAnalysis, SourceAnalysis, FactClaim, BiasIndicator, StorySnapshot } from '@/types/analysis';
import { normalizeStoryId, getSnapshots, saveSnapshot, computeDrift } from '@/lib/story-store';

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

  // Credit check
  const { getSupabaseClient } = await import('@/lib/supabase');
  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });

  const { data: creditRow } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('user_id', user.id)
    .single();

  const credits = creditRow?.credits ?? 0;
  if (credits < 1) {
    return NextResponse.json({ error: 'No credits remaining. Purchase more to continue.' }, { status: 402 });
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
      "sources": ["source names"],
      "confidence": "high" | "medium" | "low"
    }
  ],
  "disputedClaims": [
    {
      "claim": "string",
      "sourceCount": number,
      "sources": ["source names"],
      "confidence": "high" | "medium" | "low"
    }
  ],
  "sourceAnalyses": [
    {
      "sourceId": number,
      "sourceName": "string",
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
  "summary": "string"
}

Analysis rules:
1. CONSENSUS FACTS: Factual claims that appear in multiple sources (especially across different biases). List which sources mention each fact and your confidence level.
2. DISPUTED CLAIMS: Claims that only appear in some sources or are framed very differently across sources.
3. SOURCE-BY-SOURCE ANALYSIS: For each article provide key factual claims, bias indicators (emotional language, framing, omissions, source selection), emotional tone, facts it omits that other sources include, and a score (0-100) for factual accuracy and completeness on this specific story.
4. SUMMARY: A neutral, fact-based summary synthesizing what we can confidently know from these sources.

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

    // Map sourceId back to article data
    const sourceAnalyses: SourceAnalysis[] = analysisData.sourceAnalyses.map((sa: any) => ({
      ...sa,
      sourceId: articles[sa.sourceId].source.id || articles[sa.sourceId].source.name,
      articleUrl: articles[sa.sourceId].url,
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
      consensusFacts: analysisData.consensusFacts,
      disputedClaims: analysisData.disputedClaims,
      sourceAnalyses,
      summary: analysisData.summary,
      timestamp: now,
      drift,
      snapshotCount: existingSnapshots.length + 1,
    };

    // Deduct 1 credit after successful analysis
    await supabase
      .from('user_credits')
      .update({ credits: credits - 1, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

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
