const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add preload import
if (!content.includes('preload } from "swr"')) {
    content = content.replace('import useSWR from "swr";', 'import useSWR, { preload } from "swr";');
}
if (!content.includes('getCheckoutDetailsAction')) {
    content = content.replace('import { getEbookDetailAction } from "@/app/actions/ruangBelajar";', 'import { getEbookDetailAction } from "@/app/actions/ruangBelajar";\nimport { getCheckoutDetailsAction } from "@/app/actions/checkout";');
}

// Add onMouseEnter
content = content.replace(
    /<Link href=\{\`\/checkout\?type=EBOOK&productId=\$\{ebook.id\}\`\} /g,
    `<Link 
                                 href={\`/checkout?type=EBOOK&productId=\${ebook.id}\`} 
                                 onMouseEnter={() => preload(["checkout", "EBOOK", ebook.id], () => getCheckoutDetailsAction("EBOOK", ebook.id))}
                                 onTouchStart={() => preload(["checkout", "EBOOK", ebook.id], () => getCheckoutDetailsAction("EBOOK", ebook.id))}
                                 `
);

fs.writeFileSync(path, content);
console.log("Patched ReadEbookClient");
