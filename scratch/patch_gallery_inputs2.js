const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="space-y-1 bg-gray-50 dark:bg-white\/5 p-2 rounded-lg border border-gray-200 dark:border-white\/10 relative">([\s\S]*?)<\/div>/g;

content = content.replace(regex, (match, inner) => {
    if (!inner.includes('type="file"')) return match;

    let spanMatch = inner.match(/<span id="label-([^"]+)" className="([^"]+)">([^<]+)<\/span>/);
    let imgMatch = inner.match(/<img id="preview-([^"]+)" src=\{([^}]+)\}\s+className=\{?`([^`]*)`(?: \+ "([^"]*)")?\}?\s*\/>/);
    if (!imgMatch) {
       imgMatch = inner.match(/<img id="preview-([^"]+)" src=\{([^}]+)\}\s+className=\{?`([^`]+)`\}?\s*\/>/);
    }
    if (!imgMatch) {
       imgMatch = inner.match(/<img id="preview-([^"]+)" src=\{([^}]+)\}\s+className=[\{`"']([^`"'\n]+)[`"']\}?\s*\/>/);
    }
    
    // Actually let's just use string replacement on `match` since the structure is so predictable!
    
    // We want to change the wrapper:
    let newMatch = match.replace(
      '<div className="space-y-1 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative">',
      '<div className="flex flex-row items-center justify-between gap-2 bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-gray-200 dark:border-white/10 relative overflow-hidden">'
    );
    
    // We want to wrap the span, input file, and input hidden in a div
    newMatch = newMatch.replace(
      /(<span id="label-[^"]+"[\s\S]*?)<img id="preview-[^"]+"[\s\S]*?\/>/,
      (m, spanPart) => `<div className="flex flex-col min-w-0 flex-1 z-10">\n${spanPart}\n</div>\n` + m.replace(spanPart, '')
    );
    
    // And move the img to the end, removing absolute classes
    newMatch = newMatch.replace(/absolute top-2 right-2/, 'relative shrink-0 ml-auto z-0');
    
    return newMatch;
});

fs.writeFileSync(path, content);
console.log("Patched via simple replace");
