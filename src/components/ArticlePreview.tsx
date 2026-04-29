interface ArticlePreviewProps {
  title: string;
  source: string;
  url: string;
  publishedAt?: string;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  if (isNaN(date)) return '';
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ArticlePreview({
  title,
  source,
  url,
  publishedAt,
}: ArticlePreviewProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-amber-400/80 truncate">{source}</span>
        {publishedAt && (
          <span className="text-xs text-zinc-600 shrink-0 ml-auto">
            {timeAgo(publishedAt)}
          </span>
        )}
      </div>
      <h4 className="text-sm text-zinc-300 group-hover:text-zinc-100 line-clamp-2 leading-snug transition-colors">
        {title}
      </h4>
    </a>
  );
}
