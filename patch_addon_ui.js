const fs = require('fs');
const path = './src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('showAddonModal')) {
  content = content.replace(
    /const \[selectedAddons, setSelectedAddons\] = useState<string\[\]>\(\[\]\);/,
    'const [selectedAddons, setSelectedAddons] = useState<string[]>([]);\n  const [showAddonModal, setShowAddonModal] = useState(false);'
  );
}

const oldAddonSectionRegex = /\{\/\* Addons Section \*\/\}[\s\S]*?\{availableAddons && availableAddons\.length > 0 && \([\s\S]*?<\h3 className="text-\[11px\] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">ADD-ON PRODUK LAIN<\/h3>[\s\S]*?<div className="space-y-3">[\s\S]*?\{availableAddons\.map\(addon => \([\s\S]*?<\/div>\n                  \)\)\}\n                <\/div>\n              <\/div>\n            \)\}/;

const newAddonSection = `{/* Addons Section */}
            {availableAddons && availableAddons.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">ADD-ON PRODUK LAIN</h3>
                <div className="space-y-3">
                  {selectedAddons.map(addonId => {
                    const addon = availableAddons.find(a => a.id === addonId);
                    if (!addon) return null;
                    return (
                      <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-[#18181b] rounded-lg p-0.5 border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                            {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-4 h-4 text-gray-300" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                            <p className="text-xs font-medium text-rn-accent">+ Rp {formatRupiah(addon.price || 0)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedAddons(prev => prev.filter(id => id !== addon.id))}
                          disabled={isPending}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                        >
                          Batal
                        </button>
                      </div>
                    );
                  })}
                  
                  <button 
                    onClick={() => setShowAddonModal(true)}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-rn-accent/50 text-rn-accent text-sm font-bold hover:bg-rn-accent/5 dark:hover:bg-rn-accent/10 transition-colors disabled:opacity-50"
                  >
                    + Tambah Add-on
                  </button>
                </div>
              </div>
            )}`;

content = content.replace(oldAddonSectionRegex, newAddonSection);

const addonModalUI = `
      {showAddonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Pilih Add-on</h3>
              <button onClick={() => setShowAddonModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-3">
              {availableAddons && availableAddons.filter(a => !selectedAddons.includes(a.id)).map(addon => (
                <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-[#18181b] rounded-lg p-0.5 border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                      {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                      <p className="text-xs font-medium text-rn-accent">+ Rp {formatRupiah(addon.price || 0)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedAddons(prev => [...prev, addon.id]);
                      setShowAddonModal(false);
                    }}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-rn-accent text-white hover:bg-rn-accent/90"
                  >
                    + Tambah
                  </button>
                </div>
              ))}
              
              {availableAddons && availableAddons.filter(a => !selectedAddons.includes(a.id)).length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Semua produk sudah ada di keranjang Anda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/\{showPaymentModal && \(/, addonModalUI + '\n      {showPaymentModal && (');

fs.writeFileSync(path, content);
console.log("Patched popup logic");
