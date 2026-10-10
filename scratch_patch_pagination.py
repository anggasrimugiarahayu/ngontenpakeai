import sys
import re

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

target = """                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setOrderPage(idx + 1)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-bold ${
                            orderPage === idx + 1 
                              ? 'bg-orange-500 border-orange-500 text-white' 
                              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>"""

replacement = """                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
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
                            className={`w-8 h-8 shrink-0 flex items-center justify-center border rounded-lg text-sm font-bold ${
                              orderPage === page 
                                ? 'bg-orange-500 border-orange-500 text-white' 
                                : page === '...'
                                  ? 'border-transparent text-gray-500 dark:text-gray-400 bg-transparent'
                                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                    </div>"""

if target in content:
    content = content.replace(target, replacement)
    print("Successfully patched pagination!")
else:
    print("Could not find exact target block. I will use regex.")
    
    # regex fallback
    pattern = re.compile(
        r'<div className="flex gap-1">\s*\{Array\.from\(\{ length: totalPages \}\)\.map\(\(_, idx\) => \(.*?</button>\s*\)\)\}\s*</div>',
        re.DOTALL
    )
    if pattern.search(content):
        content = pattern.sub(replacement, content)
        print("Successfully patched via regex!")
    else:
        print("Failed completely.")

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)
