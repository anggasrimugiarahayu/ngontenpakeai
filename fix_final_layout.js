const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Replace the outer container to be h-screen
code = code.replace(
  `<div className="w-full max-w-7xl mx-auto p-4 md:p-6 py-8 md:py-12 animate-in fade-in duration-300">`,
  `<div className="w-full max-w-7xl mx-auto p-4 md:p-6 md:py-8 h-[100dvh] md:h-screen flex flex-col animate-in fade-in duration-300">`
);

// 2. Remove the old header
const oldHeaderStart = code.indexOf('{/* Header */}');
const oldHeaderEnd = code.indexOf('<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">');
code = code.substring(0, oldHeaderStart) + code.substring(oldHeaderEnd);

// 3. Make the main columns flex-1
code = code.replace(
  `<div className="flex flex-col lg:flex-row gap-8 lg:gap-12">`,
  `<div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 min-h-0">`
);

// 4. Inject the new Header inside the left panel, and fix the left panel container
const leftPanelStart = `<div className="flex-1 flex flex-col min-w-0">`;
const newHeader = `
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-start">
              <div>
                <div className="flex items-center gap-2 md:gap-3 mb-1">
                  <h1 className="text-xl md:text-3xl font-bold font-heading whitespace-nowrap text-gray-900 dark:text-white">
                    Bio Builder
                  </h1>
                  <div className="w-7 h-7 md:w-8 md:h-8 shrink-0 rounded-full flex items-center justify-center bg-orange-50 text-orange-500 dark:bg-[#27272a]">
                    <UserCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  Rakit profil Instagram yang optimasi konversi dari Master Blueprint.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDeleteModalOpen(true)} className="px-3 py-2 bg-gray-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap">
                <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Reset Bio</span>
              </button>
            </div>
          </div>
`;
code = code.replace(leftPanelStart, leftPanelStart + newHeader);

// 5. Fix Left panel fixed height
code = code.replace(
  `<div className="p-5 md:p-8 rounded-3xl border shadow-sm bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10 flex flex-col h-[750px]">`,
  `<div className="p-5 md:p-8 rounded-3xl border shadow-sm bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10 flex-1 flex flex-col min-h-0">`
);

// 6. Fix Mockup constraints so it fits properly without overflowing the screen
code = code.replace(
  `<div className="w-full max-w-[350px] mx-auto rounded-[12px] border border-gray-300 dark:border-white/20 overflow-hidden flex flex-col aspect-[9/19] bg-white dark:bg-black font-sans relative shadow-xl">`,
  `<div className="w-full max-w-[350px] h-full max-h-[80vh] mx-auto rounded-[12px] border border-gray-300 dark:border-white/20 overflow-hidden flex flex-col aspect-[9/19] bg-white dark:bg-black font-sans relative shadow-xl">`
);

fs.writeFileSync(file, code);
