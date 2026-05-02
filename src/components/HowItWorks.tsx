import { MapPin, Search, BarChart2, BrainCircuit, LucideIcon } from 'lucide-react';

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
    desc: 'Search any topic. Cruxly scans 30+ outlets across the full political spectrum—left, center, and right.',
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
      </div>
    </div>
  );
}
