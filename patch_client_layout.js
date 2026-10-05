const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

const imports = `import { preload } from "swr";
import { getDashboardDataAction } from "@/app/actions/dashboard";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";

const handleHoverPrefetch = (href: string) => {
  if (href === '/dashboard') {
    preload("dashboard", getDashboardDataAction);
  } else if (href === '/pengaturan') {
    preload("pengaturan", getPengaturanDataAction);
  } else if (href === '/ruang-belajar') {
    preload("ruangBelajar", getRuangBelajarDataAction);
  }
};
`;

if (!content.includes('handleHoverPrefetch')) {
  content = content.replace('import { Compass', imports + '\nimport { Compass');
}

// Mobile drawer links
content = content.replace(
  /<Link prefetch=\{true\}\n(\s*)key=\{tool.href\}\n(\s*)href=\{tool.href\}/g,
  '<Link prefetch={true}\n$1key={tool.href}\n$2href={tool.href}\n$2onMouseEnter={() => handleHoverPrefetch(tool.href)}\n$2onTouchStart={() => handleHoverPrefetch(tool.href)}'
);

// Desktop floating dock links
content = content.replace(
  /<Link prefetch=\{true\}\n(\s*)key=\{tool.href\}\n(\s*)href=\{tool.href\}\n(\s*)title/g,
  '<Link prefetch={true}\n$1key={tool.href}\n$2href={tool.href}\n$3onMouseEnter={() => handleHoverPrefetch(tool.href)}\n$3onTouchStart={() => handleHoverPrefetch(tool.href)}\n$3title'
);

fs.writeFileSync(path, content);
console.log("Patched ClientLayout for prefetch on hover");
