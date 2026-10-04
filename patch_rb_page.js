const fs = require('fs');
let file = 'src/app/ruang-belajar/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('verifyPayment')) {
  code = code.replace(
    'import { auth } from "@/auth";',
    'import { auth } from "@/auth";\nimport { verifyPayment } from "@/app/actions/payment";'
  );
}

// Add searchParams
code = code.replace(
  'export default async function RuangBelajarPage() {',
  'export default async function RuangBelajarPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {'
);

// Call verifyPayment
code = code.replace(
  'const session = await auth();',
  `const session = await auth();
  
  if (searchParams?.order_id && typeof searchParams.order_id === 'string') {
    await verifyPayment(searchParams.order_id);
  }
  `
);

fs.writeFileSync(file, code);
