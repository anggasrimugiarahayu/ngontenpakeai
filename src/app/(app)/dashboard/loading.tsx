export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-[#0f0f11] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-44 bg-gray-200 dark:bg-white/10 rounded-xl" />
          <div className="h-9 w-60 bg-gray-200 dark:bg-white/10 rounded-xl" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="h-4 w-28 bg-gray-100 dark:bg-white/5 rounded-md" />
              <div className="h-7 w-36 bg-gray-200 dark:bg-white/10 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-72 bg-white dark:bg-[#121214] border border-gray-200/80 dark:border-white/5 rounded-2xl p-6" />
      </div>
    </div>
  );
}
