import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache for 24 hours

function queryToSlug(query: string): string {
  return query
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function GET() {
  try {
    // Fetch trending topics from the same app
    // Use absolute URL since this runs on server
    const trendingUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trending`
      : 'http://localhost:3000/api/trending';

    let trendingSearches: string[] = [];
    try {
      const res = await fetch(trendingUrl, {
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        trendingSearches = data.searches || [];
      }
    } catch (error) {
      console.error('Failed to fetch trending searches:', error);
      // Fallback to hardcoded list if API fails
      trendingSearches = [
        'Trump tariffs',
        'Gaza ceasefire',
        'AI jobs impact',
        'Fed interest rates',
        'Ukraine NATO',
        'Climate summit',
      ];
    }

    const baseUrl = 'https://cruxly.dev';
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.7', changefreq: 'monthly' },
      { url: '/topics', priority: '0.9', changefreq: 'daily' },
    ];

    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic topic pages (top 20)
    const topicPages = trendingSearches.slice(0, 20);
    for (const topic of topicPages) {
      const slug = queryToSlug(topic);
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/topic/${slug}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += '</urlset>';

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return a minimal valid sitemap on error
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cruxly.dev/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=43200',
      },
    });
  }
}
