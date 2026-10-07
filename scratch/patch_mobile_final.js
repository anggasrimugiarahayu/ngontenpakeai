const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the price text wrapping
content = content.replace(
  /<span className="text-xs sm:text-\[13px\] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">/g,
  '<span className="text-[11px] sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1 whitespace-nowrap">'
);
content = content.replace(
  /<span className="text-\[17px\] font-black text-gray-900 dark:text-white leading-none">/g,
  '<span className="text-[15px] sm:text-[17px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">'
);

// 2. Fix the gallery grids
const oldGridStart = /<div className="grid grid-cols-3 gap-2">/g;
content = content.replace(oldGridStart, '<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">');

// 3. Fix the individual file inputs
const blockRegex = /<div className="space-y-1 bg-gray-50 dark:bg-white\/5 p-2 rounded-lg border border-gray-200 dark:border-white\/10 relative">\s*<span id="label-([^"]+)" className="([^"]+)">([^<]+)<\/span>\s*<img id="preview-([^"]+)" src=\{([^}]+)\}\s+className=\{?`([^`]*)`(?: \+ "([^"]*)")?\}?\s*\/>\s*<input type="file" accept="image\/\*" onChange=\{([^}]+)\}\s*className="([^"]+)" \/>\s*<input type="hidden" name="([^"]+)" id="([^"]+)"(?: defaultValue=\{([^}]+)\})?\s*\/>\s*<\/div>/g;

content = content.replace(blockRegex, (match, id1, spanClass, labelText, id2, imgSrc, imgClass1, imgClass2, onChange, inputClass, hiddenName, hiddenId, hiddenDefault) => {
    // Keep the ternary hide logic if it exists
    let hiddenLogic = '';
    const hiddenLogicMatch = match.match(/\$\{[^}]*\}/);
    if (hiddenLogicMatch) {
        hiddenLogic = hiddenLogicMatch[0];
    }
    
    const defaultValAttr = hiddenDefault ? ` defaultValue={${hiddenDefault}}` : '';

    return `<div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-${id1}" className="${spanClass}">${labelText}</span>
        <input type="file" accept="image/*" onChange={${onChange}} className="${inputClass}" />
        <input type="hidden" name="${hiddenName}" id="${hiddenId}"${defaultValAttr} />
      </div>
      <img id="preview-${id2}" src={${imgSrc}} className="${hiddenLogic} w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300" />
    </div>`;
});

// Since the regex might have missed the non-template-literal classes if any, let's also do a fallback just in case
const blockRegexFallback = /<div className="space-y-1 bg-gray-50 dark:bg-white\/5 p-2 rounded-lg border border-gray-200 dark:border-white\/10 relative">\s*<span id="label-([^"]+)" className="([^"]+)">([^<]+)<\/span>\s*<img id="preview-([^"]+)" src=\{([^}]+)\}\s+className="([^"]+)"\s*\/>\s*<input type="file" accept="image\/\*" onChange=\{([^}]+)\}\s*className="([^"]+)" \/>\s*<input type="hidden" name="([^"]+)" id="([^"]+)"(?: defaultValue=\{([^}]+)\})?\s*\/>\s*<\/div>/g;

content = content.replace(blockRegexFallback, (match, id1, spanClass, labelText, id2, imgSrc, imgClass, onChange, inputClass, hiddenName, hiddenId, hiddenDefault) => {
    
    const defaultValAttr = hiddenDefault ? ` defaultValue={${hiddenDefault}}` : '';
    const hiddenLogic = imgClass.includes('hidden') ? 'hidden ' : '';

    return `<div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">
      <div className="flex flex-col min-w-0 flex-1 z-10 gap-1">
        <span id="label-${id1}" className="${spanClass}">${labelText}</span>
        <input type="file" accept="image/*" onChange={${onChange}} className="${inputClass}" />
        <input type="hidden" name="${hiddenName}" id="${hiddenId}"${defaultValAttr} />
      </div>
      <img id="preview-${id2}" src={${imgSrc}} className="${hiddenLogic}w-10 h-12 sm:w-8 sm:h-10 object-cover relative shrink-0 ml-auto z-0 rounded shadow opacity-50 transition-all duration-300" />
    </div>`;
});

fs.writeFileSync(path, content);
console.log("Patched!");
