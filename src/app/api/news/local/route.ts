import { NextRequest, NextResponse } from 'next/server';
import RSSParser from 'rss-parser';

const rssParser = new RSSParser();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json(
      { error: 'location parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Google News geo-targeted RSS feed
    const geoQuery = encodeURIComponent(location);
    const feedUrl = `https://news.google.com/rss/search?q=${geoQuery}&hl=en&gl=US&ceid=US:en`;

    const feed = await rssParser.parseURL(feedUrl);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const articles = (feed.items || [])
      .filter((item) => {
        const dateStr = item.pubDate || item.isoDate;
        if (!dateStr) return false;
        const ts = new Date(dateStr).getTime();
        return !isNaN(ts) && ts >= sevenDaysAgo;
      })
      .slice(0, 8)
      .map((item) => {
        // Google News titles often end with " - Source Name"
        const titleParts = (item.title || '').split(' - ');
        const sourceName = titleParts.length > 1 ? titleParts.pop()!.trim() : 'Unknown';
        const title = titleParts.join(' - ').trim();

        return {
          title,
          url: item.link || '',
          publishedAt: item.pubDate || item.isoDate || '',
          source: { name: sourceName, id: null },
          description: item.contentSnippet || item.content || null,
          urlToImage: null,
          author: null,
          content: null,
        };
      });

    return NextResponse.json({ articles, location });
  } catch (err) {
    console.error('Local news fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to fetch local news' },
      { status: 500 }
    );
  }
}
