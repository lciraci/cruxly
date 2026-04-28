import { NextResponse } from 'next/server';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

const CATEGORIES = [
  { id: 'general',    label: 'Top Story' },
  { id: 'business',   label: 'Economy'   },
  { id: 'technology', label: 'Tech'      },
  { id: 'science',    label: 'Science'   },
  { id: 'health',     label: 'Health'    },
];

export async function GET() {
  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: 'NEWS_API_KEY not configured' }, { status: 500 });
  }

  const results = await Promise.allSettled(
    CATEGORIES.map(cat =>
      axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
        params: { country: 'us', category: cat.id, pageSize: 3, apiKey: NEWS_API_KEY },
        timeout: 8000,
      }).then(res => ({ category: cat.label, articles: res.data.articles || [] }))
    )
  );

  const trending = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<{ category: string; articles: any[] }>).value)
    .filter(r => r.articles.length > 0)
    .map(r => ({
      topic: r.articles[0].title as string,
      category: r.category,
      url: r.articles[0].url as string,
    }))
    .slice(0, 5);

  return NextResponse.json(
    { trending },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800' } }
  );
}
