const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// I will extract the list div and form div, and then replace the whole block.
// Let's find the start of the modal content:
// <Ticket className="text-rn-accent" size={20} /> Bank Voucher Global

const modalStartRegex = /<Ticket className="text-rn-accent" size=\{20\} \/> Bank Voucher Global[\s\S]*?<\/h3>\s*<button onClick=\{\(\) => setShowGlobalVoucherModal\(false\)\}[\s\S]*?<\/button>\s*<\/div>\s*(<div className="overflow-y-auto flex-1 mb-4 space-y-3 custom-scrollbar pr-2 min-h-\[150px\]">[\s\S]*?<\/div>\s*)\s*<div className="pt-4 border-t border-gray-200 dark:border-white\/10 shrink-0 bg-white dark:bg-\[#121214\]">\s*<h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Buat Voucher Baru<\/h4>\s*<div className="space-y-3">/g;

// Instead of complex regex, let's just write a script to replace the specific chunks safely.
// Or just copy the whole modal and replace it. Let's get the whole modal text from the file.
