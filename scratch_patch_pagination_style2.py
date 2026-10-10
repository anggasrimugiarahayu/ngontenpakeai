import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

start_str = "              {/* Pagination UI */}"
end_str = "              )}\n            </div>"

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    target = content[start_idx:end_idx + len("              )}")]

    replacement = """              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#121214] shrink-0">
                  <span className="text-[15px] text-gray-900 dark:text-gray-100 hidden sm:block">
                    Showing {((orderPage - 1) * itemsPerPage) + 1} to {Math.min(orderPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    
                    <button 
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-colors border ${
                        orderPage === 1
                          ? 'bg-gray-200 border-gray-200 text-gray-400 dark:bg-white/5 dark:border-white/5 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#121214] dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center">
                      {(() => {
                        const total = totalPages;
                        const current = orderPage;
                        let pages = [];
                        if (total <= 5) {
                          pages = Array.from({ length: total }).map((_, i) => i + 1);
                        } else if (current <= 3) {
                          pages = [1, 2, 3, 4, 5, '...', total];
                        } else if (current >= total - 2) {
                          pages = [1, '...', total - 4, total - 3, total - 2, total - 1, total];
                        } else {
                          pages = [1, '...', current - 1, current, current + 1, '...', total];
                        }
                        return pages.map((page, idx) => (
                          <button
                            key={idx}
                            onClick={() => typeof page === 'number' && setOrderPage(page)}
                            disabled={page === '...'}
                            className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-[15px] font-semibold transition-colors border ${
                              orderPage === page 
                                ? 'bg-white border-orange-500 text-orange-500 dark:bg-[#121214] dark:border-orange-500 dark:text-orange-500 border-2' 
                                : page === '...'
                                  ? 'border-transparent text-gray-500 dark:text-gray-400 bg-transparent'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-[#121214] dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'
                            }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                    </div>

                    <button 
                      onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                      disabled={orderPage === totalPages}
                      className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-colors border ${
                        orderPage === totalPages
                          ? 'bg-gray-200 border-gray-200 text-gray-400 dark:bg-white/5 dark:border-white/5 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#121214] dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>

                  </div>
                </div>
              )"""

    content = content.replace(target, replacement)
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Successfully patched exact block!")
else:
    print("Failed to find exact bounds")

