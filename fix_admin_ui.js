const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const wrongVoucherBtn = `              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PENGATURAN VOUCHER</label>
                  <button type="button" onClick={() => setManagingVouchers(editingProduct)} className="text-xs font-bold text-rn-accent bg-rn-accent/10 hover:bg-rn-accent/20 px-3 py-1.5 rounded-lg transition-colors">
                    Kelola Voucher ({editingProduct.vouchers?.length || 0})
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">`;

// Remove from everywhere it shouldn't be
content = content.replace(wrongVoucherBtn, `<div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">`);

// Now let's find the ACTUAL Edit Product form.
// It ends with:
// <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Batal</button>
// <button type="submit" disabled={loading} className="bg-rn-accent hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-105 transition-transform">Simpan Perubahan</button>

const correctLocation = `<div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setEditingProduct(null)}`;

const correctVoucherBtn = `              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PENGATURAN VOUCHER</label>
                  <button type="button" onClick={() => setManagingVouchers(editingProduct)} className="text-xs font-bold text-rn-accent bg-rn-accent/10 hover:bg-rn-accent/20 px-3 py-1.5 rounded-lg transition-colors">
                    Kelola Voucher ({editingProduct.vouchers?.length || 0})
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setEditingProduct(null)}`;

if (content.includes(correctLocation) && !content.includes('setManagingVouchers(editingProduct)')) {
  content = content.replace(correctLocation, correctVoucherBtn);
} else {
  console.log("Could not find correct location or already patched");
}

fs.writeFileSync(path, content);
console.log("Fixed Admin UI voucher button location");
