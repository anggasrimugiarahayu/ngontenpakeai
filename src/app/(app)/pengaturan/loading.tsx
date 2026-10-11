export default function PengaturanLoading() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-6 py-10 md:py-16 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-white/10 rounded-xl mb-8 md:mb-10" />
      
      {/* Tabs Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-white/10 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Content Card Skeleton */}
      <div className="mt-4 h-96 bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6" />
    </div>
  );
}
