const fs = require('fs');
let file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Basic
code = code.replace(
  /<form action=\{async \(\) => \{[\s\S]*?Pilih Paket Basic[\s\S]*?<\/button>\s*<\/form>/g,
  `<Link href="/checkout?type=PRO_BASIC" className="w-full mt-6 block text-center font-bold py-3 rounded-xl transition-all bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white">Pilih Paket Basic</Link>`
);

// Tools
code = code.replace(
  /<form action=\{async \(\) => \{[\s\S]*?Pilih Sistem Tools[\s\S]*?<\/button>\s*<\/form>/g,
  `<Link href="/checkout?type=PRO_TOOLS" className="w-full mt-6 block text-center font-bold py-3 rounded-xl transition-all bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white">Pilih Sistem Tools</Link>`
);

// Lengkap
code = code.replace(
  /<form action=\{async \(\) => \{[\s\S]*?Pilih Paket Lengkap[\s\S]*?<\/button>\s*<\/form>/g,
  `<Link href="/checkout?type=PRO_LENGKAP" className="w-full mt-6 block text-center bg-rn-accent text-black font-black py-3 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(208,226,6,0.2)]">Pilih Paket Lengkap</Link>`
);

// Remove import { createCheckoutToken } from "@/app/actions/payment";
code = code.replace('import { createCheckoutToken } from "@/app/actions/payment";\n', '');

fs.writeFileSync(file, code);
console.log("Fixed landing buttons");
