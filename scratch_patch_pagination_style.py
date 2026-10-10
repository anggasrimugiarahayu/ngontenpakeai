import sys
import re

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

pattern = re.compile(
    r'\{/\* Pagination UI \*/\}.*?(?=\s*</div>\s*\{/\* Detail Modal \*/\})',
    re.DOTALL
)

replacement = """{/* Pagination UI */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#121214] shrink-0">
                  <span className="text-[15px] text-gray-900 dark:text-gray-100 hidden sm:block">
                    Showing {((orderPage - 1) * itemsPerPage) + 1} to {Math.min(orderPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    
                    {/* Prev Button */}
                    <button 
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                        orderPage === 1
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
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
                            className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                              orderPage === page 
                                ? 'bg-white dark:bg-[#121214] border-2 border-orange-500 text-orange-500' 
                                : page === '...'
                                  ? 'text-gray-500 dark:text-gray-400 bg-transparent'
                                  : 'bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                    </div>

                    {/* Next Button */}
                    <button 
                      onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                      disabled={orderPage === totalPages}
                      className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                        orderPage === totalPages
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>

                  </div>
                </div>
              )"""

if pattern.search(content):
    content = pattern.sub(replacement, content)
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Successfully patched via regex!")
else:
    print("Failed to find target block via regex.")

