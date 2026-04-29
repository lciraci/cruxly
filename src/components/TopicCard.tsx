import { EnrichedArticle } from '@/types/news';
import ArticlePreview from './ArticlePreview';
import { getColorConfig, getColorClasses } from '@/utils/categoryColors';
import { useRouter } from 'next/navigation';

interface TopicCardProps {
  category: string;
  articles: EnrichedArticle[];
  biasDistribution?: Record<string, number>;
  isLoading?: boolean;
  onViewAll: (query: string) => void;
}

export default function TopicCard({
  category,
  articles,
  biasDistribution,
  isLoading,
  onViewAll,
}: TopicCardProps) {
  const { emoji, color } = getColorConfig(category);
  const { card } = getColorClasses(color);

  const getBiasDotColor = (bias?: string) => {
    switch (bias) {
      case 'left': return 'bg-blue-500';
      case 'center-left': return 'bg-blue-400';
      case 'center': return 'bg-zinc-500';
      case 'center-right': return 'bg-rose-400';
      case 'right': return 'bg-rose-500';
      default: return 'bg-zinc-700';
    }
  };

  return (
    <div className={`rounded-xl border border-l-4 p-5 transition-all ${card}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-zinc-100">{category}</h3>
          {biasDistribution && (
            <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mt-2">
              {biasDistribution['left'] && (
                <div className="bg-blue-600 rounded-l-full" style={{ flex: biasDistribution['left'] }} />
              )}
              {biasDistribution['center-left'] && (
                <div className="bg-blue-400" style={{ flex: biasDistribution['center-left'] }} />
              )}
              {biasDistribution['center'] && (
                <div className="bg-zinc-500" style={{ flex: biasDistribution['center'] }} />
              )}
              {biasDistribution['center-right'] && (
                <div className="bg-rose-400" style={{ flex: biasDistribution['center-right'] }} />
              )}
              {biasDistribution['right'] && (
                <div className="bg-rose-600 rounded-r-full" style={{ flex: biasDistribution['right'] }} />
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/[0.05] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="space-y-2 mb-4">
          {articles.slice(0, 4).map((article, idx) => (
            <ArticlePreview
              key={idx}
              title={article.title}
              source={article.source.name}
              url={article.url}
              publishedAt={article.publishedAt}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 italic mb-4">No articles found for this topic.</p>
      )}

      <button
        onClick={() => {
          // Find the query string from CATEGORIES
          const categoryQueries: Record<string, string> = {
            Politics: 'US politics Congress',
            Economy: 'global economy markets',
            Technology: 'technology AI innovation',
            World: 'international world news',
            Environment: 'climate environment',
            Health: 'health medicine',
            Science: 'science research discovery',
            Culture: 'culture society arts',
          };
          onViewAll(categoryQueries[category] || category);
        }}
        className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
      >
        See all {category.toLowerCase()} articles →
      </button>
    </div>
  );
}
