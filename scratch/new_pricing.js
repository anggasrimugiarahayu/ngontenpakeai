const fs = require('fs');
const path = './src/app/(app)/pengaturan/PricingConfigSection.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace the Modal Footer
const oldModalFooter = `<div className="sticky bottom-0 bg-gray-50 dark:bg-[#18181b] p-5 border-t border-gray-200 dark:border-white/10 flex justify-end">
             <button onClick={() => setEditingPackage(null)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-black dark:hover:bg-gray-200 transition-colors">
               Selesai & Tutup
             </button>
          </div>`;

const newModalFooter = `<div className="sticky bottom-0 bg-gray-50 dark:bg-[#18181b] p-5 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3">
             <button onClick={() => setEditingPackage(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
               Batal
             </button>
             <button onClick={async () => { await handleSaveAll(); setEditingPackage(null); }} disabled={loading} className="flex items-center gap-2 bg-rn-accent text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rn-accent/20 hover:bg-orange-600 transition-colors disabled:opacity-50">
               {loading ? <LoadingSpinnerSmall /> : <Save className="w-4 h-4" />}
               Simpan Perubahan
             </button>
          </div>`;

content = content.replace(oldModalFooter, newModalFooter);

// Replace the Header layout
const oldHeaderRegex = /\{\/\* Header & Control Panel \*\/\}([\s\S]*?)<div className="mt-10">/g;

const newHeader = `{/* Header & Control Panel */}
      <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#121214] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Pricing Paket</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola pricing paket untuk setiap paket langanan member anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={() => setEditingPackage("PRO_BASIC")} className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl font-bold text-sm transition-colors">
            <BookOpen className="w-4 h-4" /> Paket Ebook
          </button>
          <button onClick={() => setEditingPackage("PRO_TOOLS")} className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl font-bold text-sm transition-colors">
            <Wrench className="w-4 h-4" /> Paket Tools
          </button>
          <button onClick={() => setEditingPackage("PRO_LENGKAP")} className="flex items-center gap-2 px-4 py-2 bg-rn-accent hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rn-accent/20">
            <Gem className="w-4 h-4" /> Paket Lengkap
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Live Preview Section */}
      <div className="mt-10">`;

content = content.replace(oldHeaderRegex, newHeader);

fs.writeFileSync(path, content);
