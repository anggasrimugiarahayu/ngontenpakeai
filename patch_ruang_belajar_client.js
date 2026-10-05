const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add preload import
if (!content.includes('preload } from "swr"')) {
    content = content.replace('import useSWR from "swr";', 'import useSWR, { preload } from "swr";');
}
if (!content.includes('getEbookDetailAction')) {
    content = content.replace('import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";', 'import { getRuangBelajarDataAction, getEbookDetailAction } from "@/app/actions/ruangBelajar";');
}

// Add onMouseEnter
content = content.replace(
    /<Link href=\{\`\/ruang-belajar\/\$\{ebook.slug\}\`\}/g,
    `<Link 
                  href={\`/ruang-belajar/\${ebook.slug}\`} 
                  onMouseEnter={() => preload(["ebookDetail", ebook.slug], () => getEbookDetailAction(ebook.slug))}
                  onTouchStart={() => preload(["ebookDetail", ebook.slug], () => getEbookDetailAction(ebook.slug))}`
);

fs.writeFileSync(path, content);
console.log("Patched RuangBelajarClient");
