const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const OrderDetailsContent = \(\{ order \}: \{ order: any \}\) => \{[\s\S]*?^\s*\};\n/m;

const newOrderDetailsContent = `const OrderDetailsContent = ({ order }: { order: any }) => {
      if (!order) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
          <p>Pilih transaksi untuk melihat detail</p>
        </div>
      );
      
      const orderDate = new Date(order.createdAt);
      // Dummy date for payment, just adding 2 minutes to order date for realism
      const paymentDate = new Date(orderDate.getTime() + 2 * 60000);

      return (
        <div className="p-0 sm:p-4 text-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Details</h3>
            <button className="flex items-center gap-2 px-4 py-1.5 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg font-bold transition-colors text-xs tracking-wide">
              <Printer className="w-4 h-4" />
              PRINT
            </button>
          </div>
          
          <div className="space-y-4">
            
            {/* Box 1: Status & Item */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
                <div className="space-y-1 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  <p>Order time: <span className="font-semibold text-gray-900 dark:text-gray-200">{format(orderDate, 'dd MMM yyyy HH:mm')}</span></p>
                  <p>Payment: <span className="font-semibold text-gray-900 dark:text-gray-200">{format(paymentDate, 'dd MMM yyyy HH:mm')}</span></p>
                </div>
                <span className={\`font-bold text-xs uppercase tracking-wide px-2 py-1 rounded \${
                  order.status === 'SUCCESS' ? 'text-orange-500' : 
                  order.status === 'FAILED' ? 'text-red-500' : 'text-gray-500'
                }\`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex gap-4 items-start mb-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#121214] rounded-md overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                  {order.product?.coverUrl ? (
                    <img src={order.product.coverUrl} className="w-full h-full object-cover" alt="Product" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex gap-1 items-start">
                    <span className="font-bold text-gray-900 dark:text-white">1x</span>
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">{order.product?.title || 'Unknown Product'}</p>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 border border-gray-200 dark:border-white/20 rounded-full text-gray-500 dark:text-gray-400">
                    digital
                  </span>
                  <p className="text-gray-900 dark:text-gray-300 mt-1 font-medium">1 x {formatIDR(order.amount)}</p>
                </div>
              </div>
              
              <div className="bg-[#f8fafc] dark:bg-[#121214] rounded-lg p-3 border border-gray-100 dark:border-white/5">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Notes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">No notes provided</p>
              </div>
            </div>

            {/* Box 2: Transaction Detail */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Transaction Detail</h4>
              
              <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                <p className="text-xs break-all mb-4">TRX ID: {order.midtransId || '-'}</p>
                
                <div className="flex justify-between">
                  <span>Total item (1 items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatIDR(order.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Addon</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rp. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Total shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">Rp. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-500">- Rp. 0</span>
                </div>
                <div className="flex justify-between">
                  <span>Affiliate</span>
                  <span className="font-medium text-emerald-500">- Rp. 0</span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-gray-900 dark:text-white text-base">{formatIDR(order.amount)}</span>
                </div>
              </div>
            </div>

            {/* Box 3: Customer */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Customer</h4>
              <div className="space-y-1.5 text-sm text-gray-800 dark:text-gray-300">
                <p>{order.user?.name || 'Unknown User'}</p>
                <p>{order.user?.email || '-'}</p>
                <a href="#" className="inline-block text-emerald-500 font-medium hover:underline mt-1">085156339329</a>
              </div>
            </div>

            {/* Box 4: Email Delivery Tracking */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <h4 className="font-bold text-gray-400 dark:text-gray-500 uppercase text-xs tracking-wider mb-5">Email Delivery Tracking</h4>
              
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="absolute left-[-29px] w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                  <span className="font-medium text-emerald-500">Opened</span>
                  <span className="text-gray-400 text-xs">{format(new Date(orderDate.getTime() + 4 * 60000), 'dd MMM - HH:mm')}</span>
                </div>
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="absolute left-[-29px] w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-gray-500 dark:text-gray-400 text-xs font-medium">Delivered</span>
                  <span className="text-gray-400 text-xs">{format(new Date(orderDate.getTime() + 2 * 60000), 'dd MMM - HH:mm')}</span>
                </div>
                
                <div className="relative flex justify-between items-center text-sm">
                  <div className="absolute left-[-29px] w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-[#1a1a1c] z-10"></div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-gray-500 dark:text-gray-400 text-xs font-medium">Processed</span>
                  <span className="text-gray-400 text-xs">{format(orderDate, 'dd MMM - HH:mm')}</span>
                </div>
                
              </div>
            </div>

            {/* Box 5: Follow Up Text */}
            <div className="bg-white dark:bg-[#1a1a1c] sm:rounded-xl p-5 border-y sm:border border-gray-200 dark:border-white/10 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Follow Up Text</h4>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              
              <button className="w-full py-3 mb-6 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-colors">
                Send Follow Up Text via WhatsApp
              </button>
              
              <div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Sending History</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No history yet</p>
              </div>
            </div>

          </div>
        </div>
      );
    };
`;

code = code.replace(regex, newOrderDetailsContent);
fs.writeFileSync(file, code);
