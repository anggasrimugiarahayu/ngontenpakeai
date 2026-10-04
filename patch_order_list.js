const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-white\/5 bg-gray-50 dark:bg-black\/20">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\;\s*\}\)/m;

const newItemLayout = `<div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" onClick={(e) => e.stopPropagation()} />
                            {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
                          </span>
                          <span className={\`text-xs px-2 py-0.5 font-bold uppercase tracking-wide \${
                            order.status === 'SUCCESS' ? 'text-orange-500' : 
                            order.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'
                          }\`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                            <User className="w-3.5 h-3.5" />
                            Customer: <span className="font-bold">{order.user?.email || '-'}</span>
                          </div>
                          
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                              {order.product?.coverUrl ? (
                                <img src={order.product.coverUrl} className="w-full h-full object-cover" alt="Product" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-start">
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1">{order.product?.title || 'Unknown Product'}</h3>
                              <div>
                                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-400">
                                  digital
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-gray-500 font-medium mb-0.5">Total Transaction</p>
                              <p className="font-black text-gray-900 dark:text-white text-sm">{formatIDR(order.amount)}</p>
                            </div>
                            <button className="px-5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })`;

code = code.replace(regex, newItemLayout);
fs.writeFileSync(file, code);
