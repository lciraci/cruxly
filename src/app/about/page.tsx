export const metadata = {
  title: 'About — Cruxly',
  description: 'How Cruxly works and why we built it.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-3xl">

        {/* Hero */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-amber-400/70 uppercase mb-4">About</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-100 leading-tight mb-4">
            One story.<br />Every side.
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            Cruxly cross-references 30+ news sources across the political spectrum and uses AI to show you what they agree on, where they diverge, and what none of them are saying.
          </p>
        </div>

        <div className="h-px bg-white/[0.06] mb-14" />

        {/* The Problem */}
        <section className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">The problem</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">News is optimized for clicks, not truth.</h2>
          <p className="text-zinc-400 leading-relaxed mb-4">
            Political bias, selective reporting, and emotional framing make it nearly impossible to understand what's actually happening. To do it right manually — opening tabs, reading multiple outlets, comparing coverage — takes 45+ minutes per topic.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Most people don't bother. They read one source, absorb one frame, and carry one narrative. Cruxly fixes that in seconds.
          </p>
        </section>

        {/* How it works */}
        <section className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">How it works</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Three layers of analysis.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-200 mb-2">Consensus Facts</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Facts that multiple outlets across the political spectrum independently confirm.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-200 mb-2">Disputed Claims</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Claims only certain sources report — surfaced with attribution so you can judge for yourself.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="font-semibold text-zinc-200 mb-2">Bias Scoring</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Each source scored for tone, framing, and notable omissions — from Left to Right.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">Methodology</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">Transparent by design.</h2>
          <p className="text-zinc-400 leading-relaxed mb-5">
            We don't hide how the sausage is made. Every analysis shows you the raw sources so you can verify everything yourself.
          </p>
          <ul className="space-y-3">
            {[
              'Sources rated on a 5-point scale: Left, Center-Left, Center, Center-Right, Right — based on publicly available media bias research.',
              'Trust scores (0–100) reflect each outlet\'s factual accuracy track record.',
              'AI analysis powered by Claude (Anthropic) with low temperature settings to minimize hallucination.',
              'We never suppress or exclude sources based on political lean — the whole point is showing all sides.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm leading-relaxed">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Who it's for */}
        <section className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">Who it&apos;s for</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Built for anyone who wants to actually understand the news.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Policy analysts & researchers', desc: 'Multi-source intelligence in seconds, not hours.' },
              { title: 'Journalists', desc: 'Fact-check how other outlets covered the same story.' },
              { title: 'International readers', desc: 'Compare home-country reporting vs. local coverage.' },
              { title: 'Educators', desc: 'Real-world media literacy examples for the classroom.' },
              { title: 'Curious citizens', desc: 'Anyone tired of consuming a single narrative.' },
              { title: 'Professionals', desc: 'Stay briefed without spending hours on news.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-300">{item.title}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-white/[0.06] mb-10" />

        <p className="text-sm text-zinc-500">
          Questions?{' '}
          <a href="mailto:hello@cruxly.com" className="text-amber-400 hover:text-amber-300 transition-colors">
            hello@cruxly.com
          </a>
        </p>
      </div>
    </div>
  );
}
