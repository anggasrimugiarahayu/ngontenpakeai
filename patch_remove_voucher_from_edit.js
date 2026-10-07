const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PENGATURAN VOUCHER</label>
                  <button type="button" onClick={() => setManagingVouchers(editingProduct)} className="text-xs font-bold text-rn-accent bg-rn-accent/10 hover:bg-rn-accent/20 px-3 py-1.5 rounded-lg transition-colors">
                    Kelola Voucher ({editingProduct.vouchers?.length || 0})
                  </button>
                </div>
              </div>`;

content = content.replace(target, '');

fs.writeFileSync(path, content);
console.log("Removed voucher from edit");
