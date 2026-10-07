const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the price text wrapping and size
content = content.replace(
  /<span className="text-xs sm:text-\[13px\] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">/g,
  '<span className="text-[11px] sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1 whitespace-nowrap">'
);
content = content.replace(
  /<span className="text-\[17px\] font-black text-gray-900 dark:text-white leading-none">/g,
  '<span className="text-[15px] sm:text-[17px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">'
);

// 2. Fix the gallery grids
// There are two identical galleries (Create and Edit). We'll replace them both.
// Let's replace the grid container and the inner divs.

const oldGridStart = /<div className="grid grid-cols-3 gap-2">/g;
content = content.replace(oldGridStart, '<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">');

// For the image inputs, we need to change the structure from:
/*
<div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">
  <span id="label-coverUrlInput" className="text-[10px] font-bold text-gray-400 block mb-1">1. COVER UTAMA</span>
  <img id="preview-coverUrlInput" src={...} className={`${...} w-8 h-10 object-cover absolute top-2 right-2 rounded shadow opacity-50 transition-all duration-300`} />
  <input type="file" ... className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-rn-accent/10 file:text-rn-accent hover:file:bg-rn-accent/20 cursor-pointer" />
  <input type="hidden" ... />
</div>
*/
// To a flex container. Since there are 6 of these (3 in Add, 3 in Edit), I'll just write a regex.

content = content.replace(
  /<div className="space-y-1 bg-gray-50 dark:bg-white\/5 p-2 rounded-lg border border-gray-200 dark:border-white\/10 relative">\n\s*<span id="label-(.*?)" className="(.*?)">(.*?)<\/span>\n\s*<img id="preview-(.*?)" src=\{(.*?)\} className="(.*?)" \/>\n\s*<input type="file" accept="image\/\*" onChange=\{(.*?)\} className="(.*?)" \/>\n\s*<input type="hidden" name="(.*?)" id="(.*?)"(.*?)?\/>\n\s*<\/div>/g,
  (match, id1, spanClass, labelText, id2, imgSrc, imgClass, onChange, inputClass, hiddenName, hiddenId, hiddenDefault) => {
    // Simplify the imgClass to remove absolute positioning
    let newImgClass = "w-10 h-12 sm:w-8 sm:h-10 object-cover rounded shadow opacity-50 transition-all duration-300 shrink-0";
    // Keep the ternary hide logic if it exists
    if (imgClass.includes('hidden')) {
        const hiddenLogicMatch = imgClass.match(/\$\{[^}]*\}/);
        if (hiddenLogicMatch) {
            newImgClass = `${hiddenLogicMatch[0]} ${newImgClass}`;
        }
    }

    return `<div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10">
      <div className="flex flex-col min-w-0 flex-1">
        <span id="label-${id1}" className="${spanClass}">${labelText}</span>
        <input type="file" accept="image/*" onChange={${onChange}} className="${inputClass}" />
        <input type="hidden" name="${hiddenName}" id="${hiddenId}" ${hiddenDefault ? hiddenDefault.trim() : ''} />
      </div>
      <img id="preview-${id2}" src={${imgSrc}} className="${newImgClass}" />
    </div>`;
  }
);

fs.writeFileSync(path, content);
console.log("Patched mobile issues");
