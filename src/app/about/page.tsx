import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Cruxly
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-6">
          About Cruxly
        </h1>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              The Problem
            </h2>
            <p>
              Modern news is optimized for clicks, not truth. Political bias, selective
              reporting, and emotional framing make it difficult to understand what's
              actually happening. Manually cross-referencing multiple sources takes
              45+ minutes per topic.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Our Approach
            </h2>
            <p className="mb-4">
              Cruxly aggregates news from 30+ trusted sources across the full political
              spectrum — from left to right, across multiple countries and languages.
              We then use AI to extract what's fact, what's opinion, and what's missing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Consensus Facts</h3>
                <p className="text-sm">Facts that multiple sources across biases agree on</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Disputed Claims</h3>
                <p className="text-sm">Claims only some sources report — with attribution</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">Bias Scoring</h3>
                <p className="text-sm">Each source scored for tone, framing, and omissions</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Methodology
            </h2>
            <p className="mb-3">
              Our bias ratings are based on publicly available research from media
              bias organizations. Trust scores reflect factual reporting history.
              We are transparent about our methodology:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Sources rated on a 5-point scale: Left, Center-Left, Center, Center-Right, Right</li>
              <li>Trust scores (0-100) based on factual accuracy track record</li>
              <li>AI analysis uses Claude by Anthropic with low temperature for factual output</li>
              <li>Results always show the raw sources so you can verify yourself</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
              Who It's For
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Policy analysts and researchers who need verified multi-source intelligence</li>
              <li>Journalists fact-checking coverage from other outlets</li>
              <li>International expats comparing home country vs. local reporting</li>
              <li>Educators teaching media literacy with real examples</li>
              <li>Anyone who wants to understand the news, not just consume it</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Cruxly
          </Link>
        </div>
      </div>
    </div>
  );
}
