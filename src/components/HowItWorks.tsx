import type { ReactNode } from 'react';
import { Search, BarChart2, BrainCircuit, Dna, LucideIcon } from 'lucide-react';

interface HowItWorksStep {
  step: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  /** Miniature of the real product output for this step — decorative, so it's aria-hidden. */
  Visual: () => ReactNode;
}

/* ── Step miniatures ──────────────────────────────────────────────────
   Built from the same primitives as the live UI (SpectrumBar's gradient
   rail, the analysis claim chips, the Story DNA markers) so the section
   shows what Cruxly returns instead of describing it.
   ------------------------------------------------------------------ */

function SearchVisual() {
  return (
    <div className="w-full flex items-center gap-2 rounded-full border border-white/[0.10] bg-zinc-900/80 px-3 py-2">
      <Search size={11} className="text-zinc-500 shrink-0" />
      <span className="text-[11px] text-zinc-300 truncate">Iran sanctions</span>
      <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider text-amber-400/70">
        30+
      </span>
    </div>
  );
}

function SpectrumVisual() {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1.5 text-[8px] font-bold uppercase tracking-wider">
        <span className="text-blue-400">Liberal</span>
        <span className="text-zinc-500">Balanced</span>
        <span className="text-red-400">Cons.</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-zinc-500 to-red-500">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 border border-zinc-900" />
        <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-300 border border-zinc-900" />
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 border border-zinc-900" />
      </div>
      <div className="flex justify-between mt-2 text-[8px] text-zinc-400">
        {['NYT', 'BBC', 'Fox'].map(name => (
          <span key={name} className="rounded-full border border-white/[0.07] bg-white/[0.04] px-1.5 py-0.5">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function CruxVisual() {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/[0.07] px-2 py-1.5">
        <span className="text-[10px] font-black text-emerald-400">✓</span>
        <span className="text-[10px] text-zinc-300 truncate">All 9 sources agree</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/[0.07] px-2 py-1.5">
        <span className="text-[10px] font-black text-amber-400">!</span>
        <span className="text-[10px] text-zinc-300 truncate">Disputed by 2</span>
      </div>
    </div>
  );
}

function DnaVisual() {
  const markers = [
    { symbol: '+', className: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/[0.07]' },
    { symbol: '−', className: 'text-rose-400 border-rose-500/25 bg-rose-500/[0.07]' },
    { symbol: '!', className: 'text-amber-400 border-amber-500/25 bg-amber-500/[0.07]' },
  ];

  return (
    <div className="w-full px-0.5">
      <div className="flex justify-between mb-2">
        {markers.map(({ symbol, className }) => (
          <span
            key={symbol}
            className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] font-black ${className}`}
          >
            {symbol}
          </span>
        ))}
      </div>
      <div className="relative h-px bg-white/[0.12]">
        <span className="absolute left-0 -top-[3px] w-1.5 h-1.5 rounded-full bg-zinc-600" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-1.5 h-1.5 rounded-full bg-zinc-600" />
        <span className="absolute right-0 -top-[3px] w-1.5 h-1.5 rounded-full bg-zinc-600" />
      </div>
      <div className="flex justify-between mt-1.5 text-[8px] uppercase tracking-wider text-zinc-500">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
      </div>
    </div>
  );
}

const defaultSteps: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Search any story',
    desc: 'Type a topic. Cruxly pulls live coverage from 30+ outlets across the full political spectrum in one search.',
    Icon: Search,
    Visual: SearchVisual,
  },
  {
    step: '02',
    title: "See who's covering it",
    desc: 'Every outlet placed left to right by leaning. You see the spread before you read a word.',
    Icon: BarChart2,
    Visual: SpectrumVisual,
  },
  {
    step: '03',
    title: 'Get the Crux',
    desc: "AI reads all sides at once and separates what every outlet agrees on from what only one side is claiming.",
    Icon: BrainCircuit,
    Visual: CruxVisual,
  },
  {
    step: '04',
    title: 'Track how it shifts',
    desc: "Run it again later. Story DNA shows what became consensus, what got quietly dropped, and what's newly disputed.",
    Icon: Dna,
    Visual: DnaVisual,
  },
];

export default function HowItWorks() {
  return (
    <div className="border-t border-white/[0.06]">
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-widest text-amber-400/60 uppercase mb-3">
            How it works
          </p>
          <h2 className="text-2xl font-bold text-zinc-100">Four steps to the full picture</h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14 max-w-5xl mx-auto">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

          {defaultSteps.map(({ step, title, desc, Icon, Visual }) => (
            <div key={step} className="group flex flex-col items-center text-center">
              {/* Icon circle */}
              <div className="relative z-10 mb-6 w-12 h-12 rounded-full border border-amber-400/30 bg-zinc-900 flex items-center justify-center group-hover:border-amber-400/70 group-hover:bg-amber-400/5 transition-all duration-300">
                <Icon size={20} className="text-amber-400/70 group-hover:text-amber-400 transition-colors duration-300" />
              </div>

              {/* What this step actually produces */}
              <div
                aria-hidden="true"
                className="w-full max-w-[260px] h-[92px] mb-5 px-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center group-hover:border-white/[0.12] transition-colors duration-300"
              >
                <Visual />
              </div>

              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-[11px] font-bold tracking-widest text-amber-400/50">{step}</span>
                <h3 className="text-base font-bold text-zinc-100">{title}</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Story DNA spotlight */}
        <div className="mt-20 max-w-3xl mx-auto rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-8 sm:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Dna size={18} className="text-amber-400/80" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-amber-400/60 uppercase mb-1">Unique to Cruxly</p>
              <h3 className="text-xl font-bold text-zinc-100">Story DNA — track how narratives evolve</h3>
            </div>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Run Cruxly Analysis on the same topic more than once and we build a timeline of how the story changes over time.
            Which facts moved from disputed to consensus? What did sources quietly drop? What&apos;s suddenly being challenged?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { symbol: '+', color: 'text-emerald-400', bg: 'bg-emerald-500/[0.07] border-emerald-500/20', label: 'New consensus', desc: 'Claims now agreed by multiple sources' },
              { symbol: '−', color: 'text-rose-400',    bg: 'bg-rose-500/[0.07] border-rose-500/20',    label: 'Dropped',        desc: 'Facts sources quietly stopped reporting' },
              { symbol: '!', color: 'text-amber-400',   bg: 'bg-amber-500/[0.07] border-amber-500/20',  label: 'Newly disputed', desc: 'Claims now being questioned' },
              { symbol: '✓', color: 'text-blue-400',    bg: 'bg-blue-500/[0.07] border-blue-500/20',    label: 'Resolved',       desc: 'Disputes sources now agree on' },
            ].map(({ symbol, color, bg, label, desc }) => (
              <div key={label} className={`rounded-lg border ${bg} p-3`}>
                <span className={`text-base font-black ${color}`}>{symbol}</span>
                <p className={`font-semibold mt-1 mb-0.5 ${color}`}>{label}</p>
                <p className="text-zinc-500 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
