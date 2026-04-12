export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-slate-200 dark:bg-slate-700" />

      <div className="p-4 space-y-3">
        {/* Source + bias badge */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-5 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Description lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-3/5 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Link */}
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonBiasBar() {
  return (
    <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
      <div className="flex gap-1 h-3 rounded-full overflow-hidden">
        <div className="bg-slate-200 dark:bg-slate-700 flex-1" />
        <div className="bg-slate-200 dark:bg-slate-700 flex-1" />
        <div className="bg-slate-200 dark:bg-slate-700 flex-1" />
      </div>
      <div className="flex gap-4 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
    </div>
  );
}
