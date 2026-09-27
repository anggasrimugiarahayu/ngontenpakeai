const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="p-5 md:p-8 rounded-3xl border shadow-sm bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/10 flex-1 flex flex-col min-h-0">`;
const replaceStr = `<div className="flex-1 flex flex-col min-h-0">`;

code = code.replace(targetStr, replaceStr);

// Let's also adjust the inner scrollbar wrapper to have a bit of padding if needed, but since it's already inside a padded container, it might be fine.
// Wait, the "Kembali" / "Simpan" buttons were inside this card. They had `border-t pt-6`. If I remove the card, the border-t might still look okay, or I can remove the border-t too.
const oldFooterStr = `<div className="mt-4 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">`;
const newFooterStr = `<div className="mt-4 pt-6 flex items-center justify-between shrink-0">`;
code = code.replace(oldFooterStr, newFooterStr);

fs.writeFileSync(file, code);
