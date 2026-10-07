const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Import createVoucher, deleteVoucher
content = content.replace(
  /deleteProduct/,
  'deleteProduct,\n  createVoucher,\n  deleteVoucher'
);

// Add state
content = content.replace(
  /const \[editingProduct, setEditingProduct\] = useState<any>\(null\);/,
  'const [editingProduct, setEditingProduct] = useState<any>(null);\n  const [managingVouchers, setManagingVouchers] = useState<any>(null);\n  const [newVoucher, setNewVoucher] = useState({ code: "", discountType: "PERCENTAGE", discountValue: 0 });'
);

// Add Voucher Button to Edit Product form
const beforeSubmitBtn = /<div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white\/5">/;

const voucherBtn = `
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PENGATURAN VOUCHER</label>
                  <button type="button" onClick={() => setManagingVouchers(editingProduct)} className="text-xs font-bold text-rn-accent bg-rn-accent/10 hover:bg-rn-accent/20 px-3 py-1.5 rounded-lg transition-colors">
                    Kelola Voucher ({editingProduct.vouchers?.length || 0})
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-white/5">`;

content = content.replace(beforeSubmitBtn, voucherBtn);

// Add Voucher Modal
const voucherModalUI = `
      {managingVouchers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">Kelola Voucher</h3>
              <button onClick={() => setManagingVouchers(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 mb-4 space-y-3 custom-scrollbar pr-2">
              {managingVouchers.vouchers?.length > 0 ? managingVouchers.vouchers.map((v: any) => (
                <div key={v.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{v.code}</div>
                    <div className="text-xs font-medium text-rn-accent">Diskon: {v.discountType === "PERCENTAGE" ? v.discountValue + "%" : "Rp " + v.discountValue.toLocaleString('id-ID')}</div>
                  </div>
                  <button 
                    onClick={async () => { 
                      setLoading(true); 
                      await deleteVoucher(v.id); 
                      alert('Voucher dihapus, harap refresh halaman.'); 
                      setLoading(false); 
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada voucher untuk ebook ini.</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 shrink-0">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru</h4>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Kode Promo (ex: PROMO50)" 
                  value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                />
                <div className="flex gap-2">
                  <select 
                    value={newVoucher.discountType} onChange={e => setNewVoucher({...newVoucher, discountType: e.target.value})}
                    className="w-1/3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                  >
                    <option value="PERCENTAGE">Persen (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                  </select>
                  <input 
                    type="number" placeholder="Nilai Diskon" 
                    value={newVoucher.discountValue || ""} onChange={e => setNewVoucher({...newVoucher, discountValue: Number(e.target.value)})}
                    className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                  />
                </div>
                <button 
                  onClick={async () => {
                    if (!newVoucher.code || !newVoucher.discountValue) return alert("Lengkapi data!");
                    setLoading(true);
                    await createVoucher({ ...newVoucher, code: newVoucher.code.toUpperCase(), digitalProductId: managingVouchers.id });
                    setNewVoucher({ code: "", discountType: "PERCENTAGE", discountValue: 0 });
                    alert('Voucher dibuat! Harap refresh halaman.');
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full bg-rn-accent text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Simpan Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/\{editingProduct && \(/, voucherModalUI + '\n      {editingProduct && (');

fs.writeFileSync(path, content);
console.log("Patched Admin UI");
