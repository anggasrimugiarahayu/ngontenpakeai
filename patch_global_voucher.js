const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import Ticket icon
if (!content.includes('Ticket')) {
  content = content.replace('Plus, Trash2, Edit, BookOpen, Tag, X, Star', 'Plus, Trash2, Edit, BookOpen, Tag, X, Star, Ticket');
}

// 2. Add state
const stateMarker = 'const [showAddCategory, setShowAddCategory] = useState(false);';
const newState = `const [showAddCategory, setShowAddCategory] = useState(false);
  const [showGlobalVoucherModal, setShowGlobalVoucherModal] = useState(false);
  
  // Aggregate all vouchers for the global view
  const allVouchers = products?.flatMap((p: any) => 
    (p.vouchers || []).map((v: any) => ({ ...v, productTitle: p.title }))
  ) || [];`;

content = content.replace(stateMarker, newState);

// 3. Replace header buttons
const headerButtonsRegex = /<div className="flex items-stretch md:items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">[\s\S]*?<Plus className="w-3\.5 h-3\.5 sm:w-4 sm:h-4" \/> Tambah E-Book\n              <\/button>\n            <\/div>/;

const newHeaderButtons = `<div className="grid grid-cols-2 md:flex md:items-center gap-2 mt-3 md:mt-0 w-full md:w-auto">
              <button 
                onClick={() => setShowAddCategory(true)}
                className="justify-center bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Tag className="w-4 h-4" /> Kategori
              </button>
              <button 
                onClick={() => setShowGlobalVoucherModal(true)}
                className="justify-center border border-rn-accent/30 hover:border-rn-accent/60 bg-white dark:bg-transparent text-rn-accent px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Ticket className="w-4 h-4" /> Voucher
              </button>
              <button 
                onClick={() => setShowAddProduct(true)}
                className="col-span-2 md:col-span-1 justify-center bg-rn-accent hover:opacity-90 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-opacity flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Tambah E-Book
              </button>
            </div>`;

content = content.replace(headerButtonsRegex, newHeaderButtons);

// 4. Add Global Voucher Modal
const globalVoucherModal = `
      {showGlobalVoucherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/10 w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Ticket className="text-rn-accent" size={20} /> Bank Voucher Global
              </h3>
              <button onClick={() => setShowGlobalVoucherModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 mb-4 space-y-3 custom-scrollbar pr-2 min-h-[150px]">
              {allVouchers.length > 0 ? allVouchers.map((v: any) => (
                <div key={v.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 dark:text-white uppercase">{v.code}</span>
                      <span className="bg-rn-accent/10 text-rn-accent text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {v.discountType === "PERCENTAGE" ? v.discountValue + "%" : "Rp " + v.discountValue.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      Berlaku untuk: <span className="font-medium">{v.productTitle}</span>
                    </div>
                  </div>
                  <button 
                    onClick={async () => { 
                      if(!confirm('Hapus voucher ini?')) return;
                      setLoading(true); 
                      await deleteVoucher(v.id); 
                      alert('Voucher dihapus, harap refresh halaman.'); 
                      setLoading(false); 
                    }}
                    disabled={loading}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Ticket className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Belum ada voucher aktif.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 shrink-0 bg-white dark:bg-[#121214]">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru</h4>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Kode Promo (ex: PROMO50)" 
                  value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.replace(/\\s/g, '').toUpperCase()})} 
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
                
                {/* Target E-Book Dropdown */}
                <select
                  value={(newVoucher as any).digitalProductId || ""}
                  onChange={e => setNewVoucher({...newVoucher, digitalProductId: e.target.value} as any)}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rn-accent focus:ring-1 focus:ring-rn-accent"
                >
                  <option value="" disabled>-- Pilih E-Book Tujuan --</option>
                  {products?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                <button 
                  onClick={async () => {
                    if (!newVoucher.code || !newVoucher.discountValue || !(newVoucher as any).digitalProductId) return alert("Lengkapi data dan pilih E-Book!");
                    setLoading(true);
                    await createVoucher({ 
                      code: newVoucher.code.toUpperCase(), 
                      discountType: newVoucher.discountType,
                      discountValue: newVoucher.discountValue,
                      digitalProductId: (newVoucher as any).digitalProductId 
                    });
                    setNewVoucher({ code: "", discountType: "PERCENTAGE", discountValue: 0, digitalProductId: "" } as any);
                    alert('Voucher dibuat! Harap refresh halaman.');
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="w-full bg-rn-accent text-white font-bold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Simpan Voucher Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

const insertPoint = `{showAddProduct && (`;
content = content.replace(insertPoint, globalVoucherModal + '\n      ' + insertPoint);

fs.writeFileSync(path, content);
console.log("Patched Global Voucher Modal");
