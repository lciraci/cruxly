export type CategoryColor = 'blue' | 'emerald' | 'purple' | 'slate' | 'green' | 'rose' | 'cyan' | 'pink';

export interface CategoryConfig {
  emoji: string;
  color: CategoryColor;
  hex: string;
}

export const categoryColors: Record<string, CategoryConfig> = {
  Politics: {
    emoji: '🏛️',
    color: 'blue',
    hex: '#3b82f6',
  },
  Economy: {
    emoji: '💰',
    color: 'emerald',
    hex: '#059669',
  },
  Technology: {
    emoji: '🚀',
    color: 'purple',
    hex: '#9333ea',
  },
  World: {
    emoji: '🌍',
    color: 'slate',
    hex: '#64748b',
  },
  Environment: {
    emoji: '🌱',
    color: 'green',
    hex: '#16a34a',
  },
  Health: {
    emoji: '⚕️',
    color: 'rose',
    hex: '#e11d48',
  },
  Science: {
    emoji: '🔬',
    color: 'cyan',
    hex: '#0891b2',
  },
  Culture: {
    emoji: '🎨',
    color: 'pink',
    hex: '#ec4899',
  },
};

export const getColorConfig = (category: string): CategoryConfig => {
  return categoryColors[category] || categoryColors.Politics;
};

export const getColorClasses = (color: CategoryColor) => {
  const bgMap: Record<CategoryColor, string> = {
    blue: 'bg-blue-600/10 border-blue-600/30 border-l-blue-600 hover:bg-blue-600/15 hover:border-blue-600/50',
    emerald: 'bg-emerald-600/10 border-emerald-600/30 border-l-emerald-600 hover:bg-emerald-600/15 hover:border-emerald-600/50',
    purple: 'bg-purple-600/10 border-purple-600/30 border-l-purple-600 hover:bg-purple-600/15 hover:border-purple-600/50',
    slate: 'bg-slate-600/10 border-slate-600/30 border-l-slate-600 hover:bg-slate-600/15 hover:border-slate-600/50',
    green: 'bg-green-600/10 border-green-600/30 border-l-green-600 hover:bg-green-600/15 hover:border-green-600/50',
    rose: 'bg-rose-600/10 border-rose-600/30 border-l-rose-600 hover:bg-rose-600/15 hover:border-rose-600/50',
    cyan: 'bg-cyan-600/10 border-cyan-600/30 border-l-cyan-600 hover:bg-cyan-600/15 hover:border-cyan-600/50',
    pink: 'bg-pink-600/10 border-pink-600/30 border-l-pink-600 hover:bg-pink-600/15 hover:border-pink-600/50',
  };

  const textMap: Record<CategoryColor, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    slate: 'text-slate-400',
    green: 'text-green-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
  };

  return {
    card: bgMap[color],
    text: textMap[color],
  };
};
