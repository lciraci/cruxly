import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { EnrichedArticle } from '@/types/news';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ArticleCluster {
  storyId: string;
  title: string;
  articles: Array<{
    index: number;
    source: string;
    url: string;
  }>;
  commonTheme: string;
  framingDifference: string;
  keyDifferences: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { articles, query } = await request.json() as {
      articles: EnrichedArticle[];
      query: string;
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

    const systemInstructions = `You are a news analyst grouping articles by the underlying story they cover.

Group articles by STORY (the underlying event/topic, not just keywords). For each cluster identify:
1. What is the core story?
2. How do different sources FRAME or EMPHASIZE different aspects?
3. What are the key differences in coverage (emphasis/angle, not just wording)?

Return ONLY this JSON structure, no other text:
{
  "clusters": [
    {
      "storyId": "story-1",
      "title": "Short name for this story",
      "articleIndices": [0, 1, 3],
      "commonTheme": "What all these articles have in common",
      "framingDifference": "How sources differ in framing (e.g., 'positive economic impact' vs 'job losses')",
      "keyDifferences": [
        "Left outlets emphasize X, right outlets emphasize Y",
        "Center sources mention Z which partisan sources omit"
      ]
    }
  ]
}`;

    const userMessage = `Search query: "${query}"

Articles to cluster:
${articles.map((a, i) => `
${i}. [${a.source.name}] ${a.title}
   Description: ${a.description || 'N/A'}
`).join('\n')}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
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

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(responseText);

    // Map back to full articles
    const clustersWithArticles: ArticleCluster[] = parsed.clusters.map((c: any) => ({
      storyId: c.storyId,
      title: c.title,
      articles: c.articleIndices.map((idx: number) => ({
        index: idx,
        source: articles[idx].source.name,
        url: articles[idx].url,
      })),
      commonTheme: c.commonTheme,
      framingDifference: c.framingDifference,
      keyDifferences: c.keyDifferences,
    }));

    return NextResponse.json({ clusters: clustersWithArticles });
  } catch (error) {
    console.error('Clustering error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cluster articles',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
