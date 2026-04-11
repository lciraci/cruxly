import Link from 'next/link';

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: April 11, 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              What we collect
            </h2>
            <p>
              Cruxly collects minimal data to provide its service:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Search queries</strong> you enter to find news topics</li>
              <li><strong>Email address</strong> if you join the Pro waitlist (optional)</li>
              <li><strong>Basic analytics</strong> (page views, anonymous usage patterns)</li>
            </ul>
            <p>
              We do not collect passwords, payment information, or personal identification data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              How we use your data
            </h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Search queries are sent to news APIs and AI services to generate analysis results</li>
              <li>Waitlist emails are used only to notify you about Cruxly Pro launch</li>
              <li>We never sell your data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Third-party services
            </h2>
            <p>Cruxly uses the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>NewsAPI.org</strong> — to fetch news articles</li>
              <li><strong>Anthropic (Claude AI)</strong> — to analyze articles for bias and facts</li>
              <li><strong>Vercel</strong> — hosting and infrastructure</li>
              <li><strong>Google AdSense</strong> — advertising (displays ads on the site)</li>
            </ul>
            <p>
              Each service has its own privacy policy. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Cookies and advertising
            </h2>
            <p>
              We use cookies for basic site functionality. Third-party advertising partners
              (including Google AdSense) may use cookies to serve ads based on your
              browsing history. You can opt out of personalized advertising at{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Google Ad Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Your rights
            </h2>
            <p>
              You can request deletion of your data (including waitlist email) at any time
              by contacting us. We will delete your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Contact
            </h2>
            <p>
              For privacy questions, contact us at privacy@cruxly.com
            </p>
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
