import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Cruxly',
  description: 'Frequently asked questions about media bias, news coverage comparison, and how Cruxly helps you understand different perspectives on current events.',
  openGraph: {
    title: 'FAQ — Cruxly',
    description: 'Frequently asked questions about media bias, news coverage comparison, and how Cruxly helps you understand different perspectives.',
    type: 'website',
    url: 'https://cruxly.dev/faq',
  },
  alternates: {
    canonical: 'https://cruxly.dev/faq',
  },
};

const faqSections = [
  {
    title: 'About Media Bias & Coverage',
    color: 'emerald',
    questions: [
      {
        q: 'What is media bias?',
        a: 'Media bias is when news outlets present information in ways that favor certain perspectives, political ideologies, or narratives over others. This can happen through story selection (what they cover), emphasis (how much coverage), framing (how they describe it), or omission (what they leave out). At Cruxly, we help you see these biases by comparing how different outlets cover the same story.',
      },
      {
        q: 'Why do news outlets have different takes on the same story?',
        a: 'News outlets differ based on their editorial perspective, target audience, and business model. Left-leaning outlets may emphasize different facts than right-leaning ones. Center outlets try to remain neutral. Each outlet also makes choices about which stories matter most and how much detail to provide. Cruxly reveals these differences so you can form your own informed opinion.',
      },
      {
        q: 'Is it true that all media outlets are biased?',
        a: 'Yes, all outlets have some perspective based on their editors, owners, and audience. The goal isn\'t to find a "perfectly objective" source—that doesn\'t exist. Instead, you can recognize each outlet\'s perspective and balance multiple sources to see the full picture. Reading left, center, and right perspectives together gives you a more complete understanding of any story.',
      },
      {
        q: 'Can I find factual common ground across different media?',
        a: 'Absolutely. When different outlets—especially those from different sides of the spectrum—report the same fact, that\'s a strong signal it\'s likely true. Cruxly helps you identify these consensus facts and see where genuine disagreement begins. This is more reliable than trusting any single source.',
      },
    ],
  },
  {
    title: 'How Cruxly Works',
    color: 'blue',
    questions: [
      {
        q: 'How does Cruxly compare news outlets?',
        a: 'Search any topic or enter a news story. Cruxly scans 30+ major outlets across the political spectrum and shows you their coverage side by side. You\'ll see headlines, key facts, and how each outlet frames the story. This lets you compare what different perspectives emphasize.',
      },
      {
        q: 'Which news outlets does Cruxly include?',
        a: 'Cruxly covers 30+ outlets including left-leaning sources (MSNBC, CNN, NPR), center sources (AP, Reuters, Wall Street Journal), and right-leaning sources (Fox News, National Review, Washington Examiner). We\'re constantly expanding our coverage to include more diverse voices.',
      },
      {
        q: 'Do you edit or filter the articles?',
        a: 'No. Cruxly shows you the actual articles and headlines from each outlet as they published them. We don\'t editorialize or change the reporting. Our job is to make comparison easy, not to decide what\'s "right." You analyze the differences yourself.',
      },
      {
        q: 'Is Cruxly a tool to debunk false information?',
        a: 'Not directly. Cruxly helps you see how different outlets frame the same story and identify consensus facts. This gives you better tools to evaluate information yourself. For fact-checking specific claims, check sources like Snopes, FactCheck.org, or PolitiFact.',
      },
      {
        q: 'Can I trust Cruxly to be unbiased?',
        a: 'We try. Cruxly\'s goal is to show you multiple perspectives and let you decide. We include outlets from left, center, and right so you can judge for yourself. We don\'t take political positions or promote any ideology. If you think we\'re missing an important outlet or covering something unfairly, let us know.',
      },
    ],
  },
  {
    title: 'Using Cruxly',
    color: 'purple',
    questions: [
      {
        q: 'How do I search on Cruxly?',
        a: 'Enter any topic in the search bar—a person, event, policy, or current issue. Examples: "Trump tariffs," "Gaza ceasefire," "AI regulation," "Fed interest rates." Cruxly finds relevant coverage from multiple outlets and displays them side by side.',
      },
      {
        q: 'Can I search for old stories?',
        a: 'Yes. Cruxly can find coverage of past events. Search for the topic or person and you\'ll see recent and archived articles. Historical events with significant coverage may have hundreds of articles available.',
      },
      {
        q: 'What should I look for when comparing outlets?',
        a: 'Look for: (1) Headline differences—which facts does each outlet emphasize first? (2) What\'s included/excluded—what details does one outlet cover that others skip? (3) Word choice—do outlets use neutral or charged language? (4) Sources cited—which voices do they quote? (5) Consensus facts—what do all outlets agree on?',
      },
      {
        q: 'Can I save or share articles from Cruxly?',
        a: 'Yes. You can share links to any comparison on Cruxly. When you search for a topic, the URL changes to reflect your search, so you can copy and share it with others.',
      },
    ],
  },
  {
    title: 'Cruxly Categories',
    color: 'rose',
    questions: [
      {
        q: 'What are the main categories on Cruxly?',
        a: 'Cruxly covers six major categories: Politics (elections, government, policy), Economy (markets, inflation, trade), Technology (AI, innovation, big tech), World (international affairs, global conflicts), and Health (medical news, healthcare policy). Each category has curated popular topics you can explore.',
      },
      {
        q: 'Why are topics organized by category?',
        a: 'Categories help you focus on news areas that matter to you and explore trending topics within each. They also make it easier to see bias patterns within a specific subject area. For example, you can compare how outlets cover AI policy versus AI business news differently.',
      },
      {
        q: 'Can I find trending topics in each category?',
        a: 'Yes. Each category page shows popular topics currently trending. These are updated regularly based on what people are searching and what outlets are covering most. This helps you stay informed on what\'s happening right now.',
      },
    ],
  },
  {
    title: 'Data & Sources',
    color: 'amber',
    questions: [
      {
        q: 'Where does Cruxly get its articles?',
        a: 'Cruxly uses major news aggregation APIs and direct feeds from news outlets. We pull articles as they\'re published so you see current, real coverage. All articles link back to the original source on the outlet\'s website.',
      },
      {
        q: 'How often is Cruxly updated?',
        a: 'Trending topics and searches are updated in real time as new articles are published. Popular category topics are refreshed multiple times daily. This ensures you\'re always seeing the latest coverage.',
      },
      {
        q: 'Is my search data private?',
        a: 'We take privacy seriously. Search queries are used to improve Cruxly and identify trending topics, but are not connected to personal accounts unless you create one. Read our Privacy Policy for full details.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="container mx-auto px-4 py-12 border-b border-white/[0.06]">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-zinc-400">
            Learn about media bias, how Cruxly works, and how to use it to understand different perspectives on news.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          {faqSections.map((section) => (
            <div key={section.title} className="mb-12">
              {/* Section Title */}
              <h2 className="text-2xl font-bold text-zinc-100 mb-6">{section.title}</h2>

              {/* Questions */}
              <div className="space-y-6">
                {section.questions.map((item, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-lg border-l-4 bg-${section.color}-500/5 border-${section.color}-500/30`}
                  >
                    <h3 className={`text-lg font-semibold text-${section.color}-300 mb-3`}>
                      {item.q}
                    </h3>
                    <p className={`text-${section.color}-300/90 leading-relaxed`}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Final CTA */}
          <div className="mt-16 p-8 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/30 text-center">
            <h3 className="text-xl font-bold text-zinc-100 mb-3">Still have questions?</h3>
            <p className="text-zinc-400 mb-6">
              If you can&#x2019;t find an answer here, we&#x2019;d love to hear from you.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold rounded-lg transition-colors"
            >
              Start Comparing Coverage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
