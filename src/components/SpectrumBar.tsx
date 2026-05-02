const LEFT_OUTLETS = ['CNN', 'NPR', 'NYT', 'WaPo', 'MSNBC'];
const CENTER_OUTLETS = ['AP', 'Reuters', 'BBC', 'Axios', 'The Hill'];
const RIGHT_OUTLETS = ['Fox News', 'WSJ', 'NY Post', 'Newsmax', 'Daily Wire'];

function OutletList({ outlets }: { outlets: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {outlets.map(name => (
        <span key={name} className="text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.07] px-2.5 py-1 rounded-full">
          {name}
        </span>
      ))}
    </div>
  );
}

export default function SpectrumBar() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Labels */}
      <div className="grid grid-cols-3 mb-3 text-center">
        <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">Left</span>
        <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Center</span>
        <span className="text-xs font-bold text-red-400 tracking-widest uppercase">Right</span>
      </div>

      {/* Gradient bar */}
      <div className="relative h-2 rounded-full bg-gradient-to-r from-blue-500 via-zinc-500 to-red-500 mb-6">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-400 border-2 border-zinc-900" />
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-300 border-2 border-zinc-900" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-400 border-2 border-zinc-900" />
      </div>

      {/* Outlets */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <OutletList outlets={LEFT_OUTLETS} />
        <OutletList outlets={CENTER_OUTLETS} />
        <OutletList outlets={RIGHT_OUTLETS} />
      </div>
    </div>
  );
}
