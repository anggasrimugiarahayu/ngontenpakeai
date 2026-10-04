const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetBlock = `      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#121214] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/10 text-center flex flex-col items-center justify-center min-h-[300px] animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Orders History</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Daftar riwayat transaksi dan pembelian akan tampil di sini.</p>
        </div>
      )}`;

const replacementBlock = `      {activeTab === 'orders' && renderOrdersTab()}`;

if(code.includes(targetBlock)) {
  code = code.replace(targetBlock, replacementBlock);
  fs.writeFileSync(file, code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target block.");
}

