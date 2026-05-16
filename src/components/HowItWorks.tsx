import { MapPin, Search, BarChart2, BrainCircuit, Dna, LucideIcon } from 'lucide-react';

interface HowItWorksStep {
  step: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
}

const defaultSteps: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Discover',
    desc: "Set your location for local news, or browse what's trending right now across different topics.",
    Icon: MapPin,
  },
  {
    step: '02',
    title: 'Search All Sides',
    desc: 'Search any topic. Cruxly scans 30+ outlets across the full political spectrum—liberal, balanced, and conservative.',
    Icon: Search,
  },
  {
    step: '03',
    title: 'See the Spectrum',
    desc: 'Instantly see which outlets cover it and from what angle. Understand the full spread at a glance.',
    Icon: BarChart2,
  },
  {
    step: '04',
    title: 'Understand the Facts',
    desc: "Get AI analysis: what all sides agree on, what's disputed, and how the story is changing.",
    Icon: BrainCircuit,
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
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

          {defaultSteps.map(({ step, title, desc, Icon }) => (
            <div key={step} className="group flex flex-col items-center text-center">
              {/* Icon circle */}
              <div className="relative z-10 mb-6 w-12 h-12 rounded-full border border-amber-400/30 bg-zinc-900 flex items-center justify-center group-hover:border-amber-400/70 group-hover:bg-amber-400/5 transition-all duration-300">
                <Icon size={20} className="text-amber-400/70 group-hover:text-amber-400 transition-colors duration-300" />
              </div>

              {/* Large decorative number */}
              <span className="text-[4rem] font-black leading-none text-zinc-800 group-hover:text-zinc-700 transition-colors duration-300 mb-3 select-none">
                {step}
              </span>

              <h3 className="text-base font-bold text-zinc-100 mb-2">{title}</h3>
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
