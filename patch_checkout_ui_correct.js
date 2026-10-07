const fs = require('fs');
const path = './src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-100 dark:border-white/10">
            <span className="font-bold text-gray-900 dark:text-gray-100">TOTAL</span><span className="text-lg font-black text-gray-900 dark:text-white">Rp {formatRupiah(grossAmount)}</span>
          </div>`;

const replacement = `<div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-100 dark:border-white/10">
            <span className="font-bold text-gray-900 dark:text-gray-100">TOTAL</span><span className="text-lg font-black text-gray-900 dark:text-white">Rp {formatRupiah(grossAmount)}</span>
          </div>

          {appliedVoucher ? (
            <div className="flex justify-between text-rn-accent text-sm items-center mb-4 p-3 bg-rn-accent/10 rounded-xl border border-rn-accent/20">
              <div className="flex items-center gap-2 font-bold">
                <span className="uppercase">{appliedVoucher.code}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black">- Rp {formatRupiah(appliedVoucher.amount)}</span>
                <button onClick={() => setAppliedVoucher(null)} className="p-1 hover:bg-rn-accent/20 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowVoucherModal(true)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 text-sm font-bold hover:border-rn-accent hover:text-rn-accent transition-colors disabled:opacity-50"
            >
              + Add Voucher
            </button>
          )}`;

if (content.includes(targetStr) && !content.includes('+ Add Voucher')) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync(path, content);
  console.log("Patched voucher button");
} else {
  console.log("Could not find target string or already patched");
}
