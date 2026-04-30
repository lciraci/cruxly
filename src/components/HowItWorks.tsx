interface HowItWorksStep {
  step: string;
  title: string;
  desc: string;
  icon: string;
  image?: string; // Optional: ChatGPT-generated image path
}

interface HowItWorksProps {
  steps?: HowItWorksStep[];
}

export default function HowItWorks({ steps }: HowItWorksProps) {
  const defaultSteps: HowItWorksStep[] = [
    {
      step: '01',
      title: 'Discover',
      desc: 'Set your location for local news, or browse what\'s trending right now across different topics.',
      icon: '📍',
      image: '/images/how-it-works/discover.png',
    },
    {
      step: '02',
      title: 'Search All Sides',
      desc: 'Search any topic. Cruxly scans 30+ outlets across the full political spectrum—left, center, and right.',
      icon: '🔍',
      image: '/images/how-it-works/search.png',
    },
    {
      step: '03',
      title: 'See the Spectrum',
      desc: 'Instantly see which outlets are covering it and from what angle. Understand the full spread of coverage at a glance.',
      icon: '📊',
      image: '/images/how-it-works/spectrum.png',
    },
    {
      step: '04',
      title: 'Understand the Facts',
      desc: 'Get AI analysis: what all sides agree on, what\'s disputed, and how the story is changing. See the full picture.',
      icon: '🧠',
      image: '/images/how-it-works/facts.png',
    },
  ];

  const displaySteps = steps || defaultSteps;

  return (
    <div className="border-t border-white/[0.06]">
      <div className="container mx-auto px-4 py-14 sm:py-16">
        <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-10">
          How it works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {displaySteps.map(({ step, title, desc, icon, image }) => (
            <div key={step} className="group">
              {/* Icon/Image Placeholder */}
              <div className="mb-6 h-24 bg-gradient-to-br from-amber-400/10 to-amber-400/5 rounded-xl border border-amber-400/20 flex items-center justify-center overflow-hidden relative group-hover:border-amber-400/40 transition-all">
                {image ? (
                  <img
                    src={image}
                    alt={title}
                    className="w-16 h-16 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('span');
                        fallback.className = 'text-6xl opacity-80 group-hover:opacity-100 transition-opacity';
                        fallback.textContent = icon;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <span className="text-6xl opacity-80 group-hover:opacity-100 transition-opacity">
                    {icon}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Step Info */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-amber-400/60 tracking-widest">{step}</span>
                <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
