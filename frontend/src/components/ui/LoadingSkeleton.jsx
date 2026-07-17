export function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton w-24 h-3 mb-2" />
          <div className="skeleton w-16 h-5" />
        </div>
      </div>
      <div className="skeleton w-full h-2 rounded-full" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton w-32 h-4 mb-4" />
      <div className="skeleton w-full h-48 rounded-xl" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-card p-5">
      <div className="skeleton w-40 h-4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div className="flex-1">
              <div className="skeleton w-full h-3 mb-2" />
              <div className="skeleton w-2/3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
