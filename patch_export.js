const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Inject handleExportExcel function
const hookTarget = `const renderOrdersTab = () => {
    const ordersList = data.fullOrders || [];
    const filteredOrders = ordersList.filter((o: any) => {`;

const exportFn = `const renderOrdersTab = () => {
    const ordersList = data.fullOrders || [];
    const filteredOrders = ordersList.filter((o: any) => {`;

const fullExportFn = `const renderOrdersTab = () => {
    const ordersList = data.fullOrders || [];
    
    const handleExportExcel = () => {
      const headers = [
        'Judul Barang', 'Varian', 'Harga', 'qty', 'sub total', 'Voucher', 'shipping fee',
        'Total Addon', 'Notif fee', 'Affiliate fee', 'Affiliator email', 'Public Affiliate fee',
        'Convenience Fee', 'Total', 'Tanggal', 'Status', 'Buyer Email', 'Buyer Name (opsional)',
        'Buyer Phone (Opsional)', 'Notes (Opsional)', 'Addon Detail', 'Voucher Code',
        'Shipping Address', 'Shipping Method', 'Appointment info', 'Ref', 'PayPal Ref'
      ];

      const rows = filteredOrders.map((o: any) => {
        const rowData = [
          o.product?.title || '',
          '',
          o.amount || 0,
          1,
          o.amount || 0,
          0,
          0,
          0,
          0,
          0,
          '',
          0,
          0,
          o.amount || 0,
          format(new Date(o.createdAt), 'dd-MM-yyyy HH:mm'),
          o.status || '',
          o.user?.email || '',
          o.user?.name || '',
          o.user?.phone || '',
          o.note || '',
          '',
          '',
          '',
          '',
          '',
          o.id || '',
          ''
        ];

        return rowData.map(field => {
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
            return \`"\${str.replace(/"/g, '""')}"\`;
          }
          return str;
        }).join(',');
      });

      // Add BOM for Excel UTF-8 recognition
      const csvContent = '\\uFEFF' + [headers.join(','), ...rows].join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', \`Orders_Export_\${format(new Date(), 'yyyyMMdd_HHmmss')}.csv\`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const filteredOrders = ordersList.filter((o: any) => {`;

code = code.replace(hookTarget, fullExportFn);

// 2. Attach to button
const buttonTarget = `<button className="flex items-center justify-center p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                  </button>`;
const newButton = `<button onClick={handleExportExcel} className="flex items-center justify-center p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors" title="Export to Excel">
                    <Download className="w-4 h-4" />
                  </button>`;

code = code.replace(buttonTarget, newButton);

fs.writeFileSync(file, code);
console.log("Patched export button!");
