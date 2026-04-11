import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { EnrichedArticle } from '@/types/news';
import { StoryAnalysis, SourceAnalysis, FactClaim, BiasIndicator } from '@/types/analysis';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
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

    const prompt = `You are analyzing news coverage of: "${topic}"

You have ${articles.length} articles from sources with different political leanings:
${articleSummaries.map(a => `${a.index}. ${a.source} (${a.bias}): ${a.title}`).join('\n')}

Full article details:
${JSON.stringify(articleSummaries, null, 2)}

Please analyze these articles and provide:

1. CONSENSUS FACTS: Factual claims that appear in multiple sources (especially across different biases). For each fact, list which sources mention it and your confidence level.

2. DISPUTED CLAIMS: Claims that only appear in some sources or are framed very differently across sources.

3. SOURCE-BY-SOURCE ANALYSIS: For each article:
   - Key factual claims it makes
   - Bias indicators (emotional language, framing, omissions, source selection)
   - Emotional tone
   - Facts it omits that other sources include
   - A score (0-100) for factual accuracy and completeness on THIS specific story

4. SUMMARY: A neutral, fact-based summary synthesizing what we can confidently know about this topic from these sources.

Return your analysis as valid JSON matching this structure:
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
}`;

    // Call Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more factual analysis
      messages: [
        {
          role: 'user',
          content: prompt,
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

    const analysis: StoryAnalysis = {
      topic,
      consensusFacts: analysisData.consensusFacts,
      disputedClaims: analysisData.disputedClaims,
      sourceAnalyses,
      summary: analysisData.summary,
      timestamp: new Date().toISOString(),
    };

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
