const fs = require('fs');
let file = 'src/app/ruang-belajar/[slug]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { headers }')) {
  code = code.replace(
    'import { redirect } from "next/navigation";',
    'import { redirect } from "next/navigation";\nimport { headers } from "next/headers";'
  );
}

// Ensure the page takes searchParams
code = code.replace(
  'export default async function ReadEbookPage({ params }: { params: { slug: string } }) {',
  'export default async function ReadEbookPage({ params, searchParams }: { params: { slug: string }, searchParams: { [key: string]: string | string[] | undefined } }) {'
);

if (!code.includes('await verifyPayment(searchParams.order_id)')) {
  code = code.replace(
    'const session = await auth();',
    `const session = await auth();
    if (searchParams?.order_id && typeof searchParams.order_id === 'string') {
      const { verifyPayment } = await import("@/app/actions/payment");
      await verifyPayment(searchParams.order_id);
    }`
  );
}

// In the createCheckoutToken call
code = code.replace(
  'await createCheckoutToken({ type: "EBOOK", productId: ebook.id });',
  `await createCheckoutToken({ 
                                 type: "EBOOK", 
                                 productId: ebook.id,
                                 redirectUrl: \`\${headers().get("host")?.includes("localhost") ? "http" : "https"}://\${headers().get("host")}/ruang-belajar/\${ebook.slug}\`
                               });`
);

fs.writeFileSync(file, code);
