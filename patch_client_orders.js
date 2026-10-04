const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add Download, Printer, UserCircle icons
code = code.replace(
  /Search, Image as ImageIcon\n} from 'lucide-react';/,
  `Search, Image as ImageIcon, Download, Printer, ArrowLeft, ArrowRight, X\n} from 'lucide-react';`
);

// We need to inject the renderOrdersTab function and state inside DashboardClient component.
// First, find the beginning of the component.
const compStartStr = `export default function DashboardClient({ data, user }: DashboardClientProps) {`;

const compStateAdditions = `export default function DashboardClient({ data, user }: DashboardClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Initialize selected order on mount if there are fullOrders
  React.useEffect(() => {
    if (data.fullOrders && data.fullOrders.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSelectedOrder(data.fullOrders[0]);
    }
  }, [data.fullOrders]);

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10';
      case 'PENDING': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10';
      case 'FAILED': return 'text-red-600 bg-red-50 dark:bg-red-500/10';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-500/10';
    }
  };
`;
code = code.replace(compStartStr, compStateAdditions);

// Add 'orders' to activeTab state. Wait, activeTab state is already defined.
// Add the 'Orders' tab to the UI
const tabHtml = `<button
            onClick={() => setActiveTab('statistics')}
            className={\`px-6 py-2.5 text-sm font-semibold rounded-full transition-all \${
              activeTab === 'statistics' 
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }\`}
          >
            Statistics
          </button>`;

const newTabHtml = tabHtml + `
          <button
            onClick={() => setActiveTab('orders')}
            className={\`px-6 py-2.5 text-sm font-semibold rounded-full transition-all \${
              activeTab === 'orders' 
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }\`}
          >
            Orders
          </button>`;
code = code.replace(tabHtml, newTabHtml);

// Create renderOrdersTab function
const renderOrdersTabFunc = `
  const renderOrdersTab = () => {
    const ordersList = data.fullOrders || [];
    const filteredOrders = ordersList.filter((o: any) => {
      let matches = true;
      if (orderStatus !== 'all' && o.status !== orderStatus) matches = false;
      const searchStr = orderSearch.toLowerCase();
      if (searchStr) {
        const customerName = (o.user?.name || '').toLowerCase();
        const customerEmail = (o.user?.email || '').toLowerCase();
        if (!customerName.includes(searchStr) && !customerEmail.includes(searchStr)) {
          matches = false;
        }
      }
      return matches;
    });

    const OrderDetailsContent = ({ order }: { order: any }) => {
      if (!order) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
          <p>Pilih transaksi untuk melihat detail</p>
        </div>
      );
      
      const orderDate = new Date(order.createdAt);
      return (
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Order Details</h3>
              <p className="text-sm text-gray-500">ID: {order.id}</p>
            </div>
            <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Printer className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a1c] rounded-xl p-4 border border-gray-100 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold">
                  {(order.user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">{order.user?.email || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a1c] rounded-xl p-4 border border-gray-100 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Product</h4>
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 shrink-0">
                  {order.product?.coverUrl ? (
                    <img src={order.product.coverUrl} className="w-full h-full object-cover" alt="Product" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{order.product?.title || 'Unknown Product'}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded-md text-gray-700 dark:text-gray-300">
                      {order.product?.isProOnly ? 'PRO' : 'BASIC'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a1c] rounded-xl p-4 border border-gray-100 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Payment Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-900 dark:text-white font-medium">{format(orderDate, 'dd MMM yyyy, HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={\`font-bold px-2 py-0.5 rounded-md \${getStatusColor(order.status)}\`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Midtrans ID</span>
                  <span className="text-gray-900 dark:text-white">{order.midtransId || '-'}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-xl font-black text-orange-500">{formatIDR(order.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Order List */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
              {/* Header & Filters */}
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Product Orders</h2>
                  <button className="flex items-center justify-center p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Cari nama atau email..." 
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white"
                    />
                  </div>
                  <select 
                    value={orderStatus} 
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="py-2 px-3 bg-gray-50 dark:bg-[#1a1a1c] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white"
                  >
                    <option value="all">Semua Status</option>
                    <option value="SUCCESS">Success</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    Belum ada data transaksi yang sesuai filter.
                  </div>
                ) : (
                  filteredOrders.map((order: any) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <div 
                        key={order.id} 
                        onClick={() => handleOrderSelect(order)}
                        className={\`cursor-pointer border rounded-xl overflow-hidden transition-all duration-200 \${
                          isSelected 
                            ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50/50 dark:bg-orange-500/5' 
                            : 'border-gray-200 dark:border-white/10 hover:border-orange-500/50 bg-white dark:bg-[#1a1a1c]'
                        }\`}
                      >
                        <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
                          </span>
                          <span className={\`text-xs px-2 py-0.5 rounded-md font-bold \${getStatusColor(order.status)}\`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col sm:flex-row gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-white/10">
                            {order.product?.coverUrl ? (
                              <img src={order.product.coverUrl} className="w-full h-full object-cover" alt="Product" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-tight mb-1">{order.product?.title || 'Unknown Product'}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <User className="w-3 h-3" /> {order.user?.email || '-'}
                              </p>
                            </div>
                            <div className="mt-3 flex justify-between items-end">
                              <span className="text-xs text-gray-500 font-medium">Total:</span>
                              <span className="font-black text-orange-500">{formatIDR(order.amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Details (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm sticky top-[100px] overflow-hidden">
              <OrderDetailsContent order={selectedOrder} />
            </div>
          </div>

          {/* Mobile Modal for Order Details */}
          {isMobileModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileModalOpen(false)}></div>
              <div className="relative bg-white dark:bg-[#121214] w-full sm:w-[90%] sm:max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
                <div className="sticky top-0 right-0 p-4 flex justify-end bg-gradient-to-b from-white dark:from-[#121214] to-transparent z-10 pointer-events-none">
                  <button 
                    onClick={() => setIsMobileModalOpen(false)}
                    className="p-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors pointer-events-auto shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="-mt-14">
                  <OrderDetailsContent order={selectedOrder} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  };
`;

code = code.replace(/const renderContent = \(\) => {/, renderOrdersTabFunc + `\n  const renderContent = () => {`);

code = code.replace(
  /case 'statistics':\n        return renderStatisticsTab\(\);/,
  `case 'statistics':\n        return renderStatisticsTab();\n      case 'orders':\n        return renderOrdersTab();`
);

fs.writeFileSync(file, code);
