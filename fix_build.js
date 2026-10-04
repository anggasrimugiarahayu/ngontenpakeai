const fs = require('fs');
let file = 'src/app/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/let successfulOrders = \{ _sum: \{ amount: 0 \}, _count: \{ id: 0 \} \};/, "let successfulOrders: any = { _sum: { amount: 0 }, _count: { id: 0 } };");
code = code.replace(/let fullOrders = \[\];/, "let fullOrders: any[] = [];");

fs.writeFileSync(file, code);

file = 'src/app/layout.tsx';
code = fs.readFileSync(file, 'utf8');
// Fix multiple suppressHydrationWarning
code = code.replace(/<html suppressHydrationWarning\s+suppressHydrationWarning/, "<html suppressHydrationWarning");
fs.writeFileSync(file, code);
