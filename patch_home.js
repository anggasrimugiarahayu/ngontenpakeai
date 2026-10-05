const fs = require('fs');
const path = './src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const importStr = `import { preload } from "swr";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";`;

if (!content.includes('import { preload }')) {
  content = content.replace('import Link from "next/link";', 'import Link from "next/link";\n' + importStr);
}

// Ruang Belajar Link
content = content.replace(
  /<Link\n\s*href="\/ruang-belajar"/g,
  '<Link\n                  href="/ruang-belajar"\n                  onMouseEnter={() => preload("ruangBelajar", getRuangBelajarDataAction)}\n                  onTouchStart={() => preload("ruangBelajar", getRuangBelajarDataAction)}'
);

// Checkout links
content = content.replace(
  /<Link href="\/checkout\?type=PRO_BASIC"/g,
  '<Link prefetch={true} href="/checkout?type=PRO_BASIC"'
);
content = content.replace(
  /<Link href="\/checkout\?type=PRO_TOOLS"/g,
  '<Link prefetch={true} href="/checkout?type=PRO_TOOLS"'
);
content = content.replace(
  /<Link href="\/checkout\?type=PRO_LENGKAP"/g,
  '<Link prefetch={true} href="/checkout?type=PRO_LENGKAP"'
);


fs.writeFileSync(path, content);
console.log("Patched page.tsx for prefetching");
