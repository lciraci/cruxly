import type { Metadata } from 'next';
import { Suspense } from 'react';
import StoryContent, { StoryLoading } from '@/app/story/StoryClient';
import type { EnrichedArticle } from '@/types/news';

// Convert slug to readable topic name
// Example: 'trump-tariffs' → 'Trump Tariffs'
function slugToQuery(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const query = slugToQuery(slug);

  // Keyword-rich title targeting "[topic] media bias" / "[topic] news coverage" searches
  const title = `${query} News Coverage — Compare Left, Center & Right Media Bias`;
  const description = `How do CNN, Fox News, NYT, WSJ and MSNBC cover ${query}? Compare 30+ outlets side by side. See what facts they share, what they emphasize, and what they leave out.`;
  const ogImage = `/api/og?q=${encodeURIComponent(query)}`;
  const canonicalUrl = `https://cruxly.dev/topic/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${query} news`,
      `${query} media bias`,
      `${query} news coverage`,
      `${query} media coverage comparison`,
      `${query} left vs right`,
      `${query} CNN Fox News`,
      `how outlets cover ${query}`,
      `${query} bias`,
      'media bias comparison',
      'news coverage analysis',
    ],
    metadataBase: new URL('https://cruxly.dev'),
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      siteName: 'Cruxly',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@cruxly',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/trending`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch trending');
    }

    const data = await res.json();
    const searches: string[] = data.searches || [];

    return searches.slice(0, 10).map((q: string) => ({
      slug: q
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export const revalidate = 86400;

// Static fallback related topics (used when trending API fails)
const FALLBACK_RELATED = [
  'Trump tariffs',
  'Gaza ceasefire',
  'AI jobs impact',
  'Fed interest rates',
  'Ukraine NATO',
  'Climate summit',
];

function queryToSlug(q: string): string {
  return q
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

type TopicHeadline = { title: string; source: string; url: string };
type TopicCoverage = { left: TopicHeadline[]; center: TopicHeadline[]; right: TopicHeadline[] };

// Fetch the real headlines currently covering this topic, grouped into the three
// spectrum buckets. Server-side, ISR-cached 24h, short timeout + safe fallback.
// The real titles make every topic page UNIQUE content (not templated boilerplate),
// which is what gets thin/duplicate pages indexed. If anything fails the page falls
// back to its static copy and is unaffected.
async function fetchTopicCoverage(query: string): Promise<TopicCoverage | null> {
  try {
    const res = await fetch(
      `https://cruxly.dev/api/news/search?q=${encodeURIComponent(query)}&pageSize=12`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const articles: EnrichedArticle[] = data.articles ?? [];
    if (articles.length === 0) return null;
    const pick = (biases: string[]): TopicHeadline[] =>
      articles
        .filter((a) => a.sourceBias && biases.includes(a.sourceBias) && a.title && a.url)
        .map((a) => ({ title: a.title, source: a.source.name, url: a.url }));
    return {
      left: pick(['left', 'center-left']),
      center: pick(['center']),
      right: pick(['center-right', 'right']),
    };
  } catch {
    return null;
  }
}

function HeadlinesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 h-40 animate-pulse" />
      ))}
    </div>
  );
}

// Async — rendered inside <Suspense> so the cold page streams its shell
// immediately and fills the headlines in once the news fetch resolves.
async function TopicHeadlines({ query }: { query: string }) {
  const coverage = await fetchTopicCoverage(query);
  if (
    !coverage ||
    (coverage.left.length === 0 && coverage.center.length === 0 && coverage.right.length === 0)
  ) {
    return null;
  }
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-zinc-100 mb-1">
        What each side is reporting on {query} right now
      </h2>
      <p className="text-xs text-zinc-600 mb-4">
        Live headlines pulled from across the spectrum — updated daily.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'left', label: 'Liberal', items: coverage.left, dot: 'bg-blue-700', text: 'text-blue-400' },
          { key: 'center', label: 'Balanced', items: coverage.center, dot: 'bg-zinc-400', text: 'text-zinc-400' },
          { key: 'right', label: 'Conservative', items: coverage.right, dot: 'bg-red-600', text: 'text-red-400' },
        ].map((col) => (
          <div key={col.key} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${col.text}`}>{col.label}</span>
            </div>
            {col.items.length > 0 ? (
              <ul className="space-y-3">
                {col.items.slice(0, 4).map((h, i) => (
                  <li key={i}>
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-300 hover:text-amber-400 leading-snug transition-colors"
                    >
                      {h.title}
                    </a>
                    <div className="text-xs text-zinc-600 mt-0.5">{h.source}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-600 italic">No recent coverage from this side.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const query = slugToQuery(slug);
  const canonicalUrl = `https://cruxly.dev/topic/${slug}`;

  // Related topics (excluding current one)
  const relatedTopics = FALLBACK_RELATED.filter(
    (t) => queryToSlug(t) !== slug
  ).slice(0, 5);

  // FAQs — will generate rich snippets via FAQPage schema
  const faqs = [
    {
      q: `How do different news outlets cover ${query}?`,
      a: `Coverage of ${query} varies significantly across the political spectrum. Left-leaning outlets like MSNBC, CNN, and NPR often emphasize certain angles, while right-leaning outlets like Fox News, National Review, and the Washington Examiner highlight different details. Center outlets like AP, Reuters, and the Wall Street Journal aim for more neutral reporting. Cruxly compares all 30+ outlets side by side so you can see the differences yourself.`,
    },
    {
      q: `Is there media bias in ${query} coverage?`,
      a: `Yes — every news outlet has some perspective shaped by its editors, audience, and business model. This doesn't mean any outlet is "lying" — it means each one chooses what to emphasize, what to omit, and how to frame the story. By comparing left, center, and right coverage of ${query} together, you can identify consensus facts (likely true) and areas of genuine disagreement.`,
    },
    {
      q: `What's the best way to get unbiased news about ${query}?`,
      a: `Rather than searching for a single "unbiased" source (which doesn't really exist), read multiple outlets across the spectrum. Cruxly makes this easy: search "${query}" and see how 30+ liberal, centrist, and conservative outlets cover the same story. Look for: facts all outlets agree on, differences in word choice, and what each side leaves out.`,
    },
    {
      q: `Which outlets does Cruxly include in its ${query} comparison?`,
      a: `Cruxly tracks 30+ major news outlets including MSNBC, CNN, NPR, NYT, Washington Post (left-leaning); AP, Reuters, BBC, Wall Street Journal (center); and Fox News, National Review, Washington Examiner, NY Post (right-leaning). All comparisons of ${query} include real headlines and articles from these outlets.`,
    },
  ];

  // JSON-LD structured data: Article + FAQPage + BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${query} News Coverage Comparison`,
        description: `Compare how left, center, and right media outlets cover ${query}. See what facts they share and what they leave out across 30+ news sources.`,
        url: canonicalUrl,
        author: { '@type': 'Organization', name: 'Cruxly', url: 'https://cruxly.dev' },
        publisher: {
          '@type': 'Organization',
          name: 'Cruxly',
          url: 'https://cruxly.dev',
        },
        about: query,
        mainEntityOfPage: canonicalUrl,
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Cruxly',
            item: 'https://cruxly.dev',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Topics',
            item: 'https://cruxly.dev/topics',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: query,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <div>
      {/* Structured data for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Interactive comparison first — the live results lead the page */}
      <Suspense fallback={<StoryLoading />}>
        <StoryContent initialQuery={query} />
      </Suspense>

      {/* Static SEO content — server-rendered for Google, below the results */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-6">
          <a href="/" className="hover:text-amber-400">Cruxly</a>
          <span className="mx-2">/</span>
          <a href="/topics" className="hover:text-amber-400">Topics</a>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">{query}</span>
        </nav>

        {/* H1 with target keywords */}
        <h1 className="text-4xl font-bold text-zinc-100 mb-4">
          {query} News Coverage Comparison
        </h1>
        <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
          See how liberal, centrist, and conservative media outlets cover{' '}
          <strong className="text-zinc-300">{query}</strong>. Compare 30+ news
          sources side by side, identify media bias patterns, and find consensus
          facts that all outlets agree on.
        </p>

        {/* Perspective overview boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-sm font-semibold text-emerald-400 mb-2">
              Left-Leaning Coverage
            </div>
            <p className="text-sm text-emerald-300/90 leading-relaxed">
              How MSNBC, CNN, NPR, and the New York Times frame {query}.
            </p>
          </div>
          <div className="p-5 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-sm font-semibold text-blue-400 mb-2">
              Center Coverage
            </div>
            <p className="text-sm text-blue-300/90 leading-relaxed">
              How AP, Reuters, BBC, and the Wall Street Journal report {query}.
            </p>
          </div>
          <div className="p-5 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <div className="text-sm font-semibold text-rose-400 mb-2">
              Conservative Coverage
            </div>
            <p className="text-sm text-rose-300/90 leading-relaxed">
              How Fox News, National Review, NY Post, and Washington Examiner cover {query}.
            </p>
          </div>
        </div>

        {/* Real headlines — streamed via Suspense so the cold render isn't
            blocked on the server-side news fetch. The resolved content still
            lands in the ISR-cached HTML, so SEO is unaffected. */}
        <Suspense fallback={<HeadlinesSkeleton />}>
          <TopicHeadlines query={query} />
        </Suspense>

        {/* Main content sections targeting keyword variants */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            How {query} Is Covered Across the Media Spectrum
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            News coverage of {query} varies significantly depending on the
            outlet&#x2019;s editorial perspective. Different outlets choose
            which facts to emphasize, which sources to quote, and which angles
            to highlight first. These differences shape how millions of readers
            understand the story — often without realizing it.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            By comparing coverage of {query} from across the political spectrum,
            you can spot the patterns: which facts every outlet reports (likely
            true), which details get emphasized by only one side (revealing
            framing), and what each side leaves out (revealing bias by
            omission).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Left-Leaning Outlets on {query}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Liberal-leaning outlets like MSNBC, CNN, NPR, the New York Times,
            and the Washington Post typically frame {query} through a
            progressive lens — emphasizing equity, social impact, regulatory
            implications, and historical context. Their headlines and lead
            paragraphs often highlight the perspectives of affected communities,
            policy experts, and Democratic officials.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Conservative Outlets on {query}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Right-leaning outlets like Fox News, National Review, the Washington
            Examiner, and the New York Post typically frame {query} through a
            conservative lens — emphasizing economic implications, individual
            responsibility, government overreach concerns, and reactions from
            Republican officials. Their coverage often highlights different
            sources, statistics, and angles than left-leaning outlets, even on
            the exact same story.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Center Outlets on {query}
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Center and wire-service outlets like AP, Reuters, the BBC, and the
            Wall Street Journal aim to report {query} with minimal editorial
            framing. These outlets typically lead with verifiable facts, quote
            sources from multiple perspectives, and avoid charged language. They
            often serve as a useful baseline when comparing coverage — though no
            outlet is perfectly neutral.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            What to Look For When Comparing {query} Coverage
          </h2>
          <ul className="list-disc list-inside text-zinc-400 leading-relaxed space-y-2">
            <li>
              <strong className="text-zinc-300">Consensus facts:</strong> Details
              all outlets report on {query} are likely well-verified.
            </li>
            <li>
              <strong className="text-zinc-300">Headline framing:</strong> Note
              which facts each outlet leads with — that reveals their priorities.
            </li>
            <li>
              <strong className="text-zinc-300">Word choice:</strong> Compare
              neutral vs. charged language about the same {query} events.
            </li>
            <li>
              <strong className="text-zinc-300">Source selection:</strong> Which
              experts and officials does each outlet quote?
            </li>
            <li>
              <strong className="text-zinc-300">Omissions:</strong> What does one
              side cover about {query} that the other ignores?
            </li>
          </ul>
        </section>

        {/* FAQ section — eligible for FAQ rich snippets in Google */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">
            Frequently Asked Questions About {query} News Coverage
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-lg bg-zinc-900/50 border border-zinc-800"
              >
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">
                  {faq.q}
                </h3>
                <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal linking — related topics */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Compare Coverage of Other Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedTopics.map((topic) => (
              <a
                key={topic}
                href={`/topic/${queryToSlug(topic)}`}
                className="p-3 rounded-lg border border-amber-400/20 bg-amber-400/5 hover:bg-amber-400/10 transition-colors"
              >
                <span className="text-amber-400 mr-2">→</span>
                <span className="text-zinc-300">{topic} news coverage</span>
              </a>
            ))}
          </div>
        </section>

        {/* Category navigation */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="/category/politics"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              🏛️ Politics
            </a>
            <a
              href="/category/economy"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              📈 Economy
            </a>
            <a
              href="/category/technology"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              💻 Technology
            </a>
            <a
              href="/category/world"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              🌍 World
            </a>
            <a
              href="/category/health"
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              ⚕️ Health
            </a>
          </div>
        </section>
      </article>
    </div>
  );
}
