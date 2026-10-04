const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add orderPage state
if (!code.includes('const [orderPage, setOrderPage]')) {
  code = code.replace(/const \[orderStatus, setOrderStatus\] = useState\('all'\);/, "const [orderStatus, setOrderStatus] = useState('all');\n  const [orderPage, setOrderPage] = useState(1);");
}

// 2. Change grid items-start to items-stretch
code = code.replace(/className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"/, 'className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"');

// 3. Update Left Column Card
code = code.replace(/className="bg-white dark:bg-\[\#121214\] rounded-2xl border border-gray-100 dark:border-white\/10 shadow-sm overflow-hidden flex flex-col h-\[calc\(100vh-180px\)\]"/, 'className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col h-full"');

// 4. Update Right Column Card
code = code.replace(/className="bg-white dark:bg-\[\#121214\] rounded-2xl border border-gray-100 dark:border-white\/10 shadow-sm sticky top-\[100px\] overflow-hidden"/, 'className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden h-full"');

// 5. Add Pagination Logic to renderOrdersTab
// Find the end of filteredOrders calculation
const filterEndRegex = /return matches;\n\s*\}\);\n/m;
const paginationCode = `return matches;
    });

    // Pagination logic
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);
`;
code = code.replace(filterEndRegex, paginationCode);

// Replace mapped array
code = code.replace(/filteredOrders\.map\(\(order: any\) => \{/, 'paginatedOrders.map((order: any) => {');

// 6. Add Pagination UI at the bottom of left column
const leftListEndRegex = /<\/div>\s*<\/div>\s*\{\/\* Right Column: Order Details \(Desktop\) \*\/\}/m;
const paginationUI = `
              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-black/20 shrink-0">
                  <span className="text-sm text-gray-500 hidden sm:block">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{((orderPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(orderPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredOrders.length}</span>
                  </span>
                  <div className="flex gap-1 w-full sm:w-auto justify-between sm:justify-end">
                    <button 
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setOrderPage(idx + 1)}
                          className={\`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-bold \${
                            orderPage === idx + 1 
                              ? 'bg-orange-500 border-orange-500 text-white' 
                              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                          }\`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setOrderPage(p => Math.min(totalPages, p + 1))}
                      disabled={orderPage === totalPages}
                      className="px-3 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Details (Desktop) */}`;

code = code.replace(leftListEndRegex, paginationUI);

fs.writeFileSync(file, code);
