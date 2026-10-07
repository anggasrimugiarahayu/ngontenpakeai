const fs = require('fs');
const path = './src/app/(app)/pengaturan/PricingConfigSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Patch 1: Header layout
const oldHeader = `<div className="border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#121214] flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>`;

const newHeader = `<div className="border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#121214] flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Manajemen Pricing Paket</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kelola pricing paket untuk setiap paket langanan member anda.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 w-full xl:w-auto">
          <button onClick={() => setEditingPackage("PRO_BASIC")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
            <BookOpen className="w-4 h-4" /> Paket Ebook
          </button>
          <button onClick={() => setEditingPackage("PRO_TOOLS")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
            <Wrench className="w-4 h-4" /> Paket Tools
          </button>
          <button onClick={() => setEditingPackage("PRO_LENGKAP")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-rn-accent hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-rn-accent/20 whitespace-nowrap">
            <Gem className="w-4 h-4" /> Paket Lengkap
          </button>
        </div>
      </div>`;

content = content.replace(oldHeader, newHeader);

// Patch 2: Title change
const oldTitle = `<h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview (Miniatur Halaman Depan)</h2>`;
const newTitle = `<h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h2>`;

content = content.replace(oldTitle, newTitle);

fs.writeFileSync(path, content);
