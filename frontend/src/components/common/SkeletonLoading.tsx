'use client';

export const AnalysisCardSkeleton = () => (
  <div className="glass-card p-8 animate-pulse">
    <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-4 mb-6 h-16"></div>
    <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gray-700"></div>
    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
  </div>
);

export const AnalysisGridSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <AnalysisCardSkeleton key={i} />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-700 rounded w-48"></div>
      <div className="h-8 bg-gray-700 rounded w-24"></div>
    </div>
    <div className="h-64 bg-gray-700 rounded"></div>
  </div>
);

export const HistoryCardSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="w-20 h-20 rounded-xl bg-gray-700"></div>
    </div>
    <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
  </div>
);

export const ProfileFormSkeleton = () => (
  <div className="glass-card p-8 animate-pulse">
    <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 bg-gray-700 rounded w-24"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
    <div className="h-12 bg-gray-700 rounded w-full"></div>
  </div>
);