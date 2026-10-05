export default function Loading() {
  return (
    <div className="w-full h-full min-h-[50vh] flex flex-col p-4 md:p-6 animate-pulse">
      <div className="w-full max-w-7xl mx-auto space-y-6 opacity-20">
         <div className="h-8 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
         <div className="h-64 w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl"></div>
      </div>
    </div>
  );
}
