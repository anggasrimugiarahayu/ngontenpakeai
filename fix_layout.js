const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix Timeline
const oldTimeline = `
  const renderTimeline = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Langkah {step} dari 3</span>
          <span className="text-sm font-bold text-rn-accent">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-rn-accent h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: \`\${(step / 3) * 100}%\` }}
          ></div>
        </div>
      </div>
    );
  };`;

const newTimeline = `
  const renderTimeline = () => {
    return (
      <>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400">
            Langkah {step}/3
          </div>
        </div>
        <div className="shrink-0 w-full h-1.5 rounded-full mb-6 bg-gray-200 dark:bg-white/10">
          <div 
            className="h-1.5 rounded-full bg-orange-500 transition-all duration-500 ease-out"
            style={{ width: \`\${(step / 3) * 100}%\` }}
          />
        </div>
      </>
    );
  };`;

code = code.replace(oldTimeline, newTimeline);

// 2. Fix Layout (add flex-col and overflow-y-auto)
const oldPanelStart = `<div className="p-5 md:p-8 rounded-3xl border shadow-sm bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10">`;
const newPanelStart = `<div className="p-5 md:p-8 rounded-3xl border shadow-sm bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10 flex flex-col h-[750px]">\n            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">`;

code = code.replace(oldPanelStart, newPanelStart);

const oldNavButtons = `{/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">`;
const newNavButtons = `</div>\n            {/* Navigation Buttons */}
            <div className="mt-4 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">`;

code = code.replace(oldNavButtons, newNavButtons);

fs.writeFileSync(file, code);
