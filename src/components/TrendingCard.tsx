import { getColorConfig, getColorClasses } from '@/utils/categoryColors';

interface TrendingCardProps {
  topic: string;
  category: string;
  sourceCount: number;
  trendingDirection: 'up' | 'stable' | 'down';
  onClick: () => void;
}

export default function TrendingCard({
  topic,
  category,
  sourceCount,
  trendingDirection,
  onClick,
}: TrendingCardProps) {
  const { emoji, color } = getColorConfig(category);
  const { card, text } = getColorClasses(color);

  const trendingIcon = {
    up: '↑',
    stable: '→',
    down: '↓',
  }[trendingDirection];

  const trendingLabel = {
    up: 'Trending',
    stable: 'Stable',
    down: 'Cooling',
  }[trendingDirection];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-5 px-4 rounded-lg border border-l-4 transition-all duration-300 ${card} group hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{emoji}</span>
        <span className={`text-xs font-semibold tracking-widest uppercase ${text}`}>
          {category}
        </span>
      </div>

      <p className="text-base sm:text-lg font-semibold text-zinc-200 group-hover:text-zinc-100 transition-colors mb-3 leading-snug">
        {topic}
      </p>

      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <span>📌</span>
          {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
        </span>
        <span className="flex items-center gap-1">
          <span>{trendingIcon}</span>
          {trendingLabel}
        </span>
      </div>
    </button>
  );
}
