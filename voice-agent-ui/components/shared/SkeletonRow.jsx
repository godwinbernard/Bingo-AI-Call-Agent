'use client';

export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton rounded-md ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <SkeletonLine width={40} height={40} className="rounded-xl" />
        <SkeletonLine width={60} height={20} />
      </div>
      <SkeletonLine width="60%" height={32} className="mb-2" />
      <SkeletonLine width="80%" height={14} />
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <SkeletonLine width={`${60 + Math.random() * 40}%`} height={14} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
