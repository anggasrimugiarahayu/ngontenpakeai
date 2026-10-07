const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="space-y-1 bg-gray-50 dark:bg-white\/5 p-2 rounded-lg border border-gray-200 dark:border-white\/10 relative">([\s\S]*?)<\/div>/g;

content = content.replace(regex, (match, inner) => {
    // If it doesn't look like our file input, skip
    if (!inner.includes('type="file"')) return match;

    let spanMatch = inner.match(/<span id="label-([^"]+)" className="([^"]+)">([^<]+)<\/span>/);
    let imgMatch = inner.match(/<img id="preview-([^"]+)" src=\{([^}]+)\} className="([^"]+)" \/>/);
    let fileMatch = inner.match(/<input type="file" accept="image\/\*" onChange=\{([^}]+)\} className="([^"]+)" \/>/);
    let hiddenMatch = inner.match(/<input type="hidden" name="([^"]+)" id="([^"]+)"(.*?)\/>/);

    if (!spanMatch || !imgMatch || !fileMatch || !hiddenMatch) {
        console.log("Failed to match parts in:\n", inner);
        return match;
    }

    const [_, id1, spanClass, labelText] = spanMatch;
    const [__, id2, imgSrc, imgClass] = imgMatch;
    const [___, onChange, inputClass] = fileMatch;
    const [____, hiddenName, hiddenId, hiddenDefault] = hiddenMatch;

    let newImgClass = "w-10 h-12 sm:w-8 sm:h-10 object-cover rounded shadow opacity-50 transition-all duration-300 shrink-0";
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
});

fs.writeFileSync(path, content);
console.log("Patched file inputs");
