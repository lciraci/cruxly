export const metadata = {
  title: 'Privacy Policy — Cruxly',
  description: 'How Cruxly handles your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-3xl">

        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-amber-400/70 uppercase mb-4">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-100 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-600">Last updated: April 28, 2026</p>
        </div>

        <div className="h-px bg-white/[0.06] mb-14" />

        <div className="space-y-12 text-zinc-400">

          <section>
            <h2 className="text-lg font-bold text-zinc-200 mb-4">What we collect</h2>
            <p className="leading-relaxed mb-4">
              Cruxly is built to collect as little as possible:
            </p>
            <ul className="space-y-3">
              {[
                { label: 'Search queries', desc: 'The topics you type in, sent to news APIs and our AI to generate analysis.' },
                { label: 'Email address', desc: 'Only if you voluntarily join the Pro waitlist. Never required to use the site.' },
                { label: 'Anonymous analytics', desc: 'Page views and usage patterns — no personally identifiable information.' },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                  <span><span className="font-semibold text-zinc-300">{item.label}</span> — {item.desc}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed">
              We do not collect passwords, payment information, or any personal identification data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-200 mb-4">How we use your data</h2>
            <ul className="space-y-3">
              {[
                'Search queries are passed to news APIs and AI services solely to generate the analysis you requested.',
                'Waitlist emails are used only to notify you when Cruxly Pro launches. Nothing else.',
                'We never sell, rent, or share your data with third parties for marketing purposes.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-200 mb-4">Third-party services</h2>
            <p className="leading-relaxed mb-4">
              Cruxly relies on the following external services to function. Each has its own privacy policy.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'NewsAPI.org', desc: 'Fetches news articles from publishers worldwide.' },
                { name: 'Anthropic (Claude AI)', desc: 'Analyzes articles for bias, facts, and framing.' },
                { name: 'Vercel', desc: 'Hosts and serves the application.' },
                { name: 'Supabase', desc: 'Stores waitlist emails securely.' },
                { name: 'Google AdSense', desc: 'Displays ads on the site (if enabled).' },
              ].map((s) => (
                <div key={s.name} className="p-4 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                  <p className="text-sm font-semibold text-zinc-300 mb-1">{s.name}</p>
                  <p className="text-sm text-zinc-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-200 mb-4">Cookies &amp; advertising</h2>
            <p className="leading-relaxed mb-3">
              We use minimal cookies for basic site functionality (e.g. remembering your local news city preference in your browser).
            </p>
            <p className="leading-relaxed">
              If Google AdSense is active, Google may use cookies to serve ads based on your browsing history. You can opt out at{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 transition-colors"
              >
                Google Ad Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-200 mb-4">Your rights</h2>
            <p className="leading-relaxed">
              You can request deletion of your data — including your waitlist email — at any time. We will delete it within 30 days. Just reach out at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-200 mb-4">Changes to this policy</h2>
            <p className="leading-relaxed">
              If we make material changes we will update the date at the top of this page. Continued use of Cruxly after changes constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>

        <div className="h-px bg-white/[0.06] mt-14 mb-10" />

        <p className="text-sm text-zinc-500">
          Privacy questions?{' '}
          <a href="mailto:privacy@cruxly.com" className="text-amber-400 hover:text-amber-300 transition-colors">
            privacy@cruxly.com
          </a>
        </p>

      </div>
    </div>
  );
}
