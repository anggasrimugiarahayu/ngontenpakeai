const fs = require('fs');
let file1 = 'src/app/ruang-belajar/page.tsx';
let code1 = fs.readFileSync(file1, 'utf8');

if (!code1.includes('const resolvedSearchParams = await searchParams')) {
  // Replace the parameter type to accept Promise
  code1 = code1.replace(
    'searchParams: { [key: string]: string | string[] | undefined }',
    'searchParams: Promise<{ [key: string]: string | string[] | undefined }>'
  );
  
  // Await searchParams
  code1 = code1.replace(
    'if (searchParams?.order_id',
    'const resolvedSearchParams = await searchParams;\n  if (resolvedSearchParams?.order_id'
  );
  // Also change the typeof check
  code1 = code1.replace(
    'typeof searchParams.order_id',
    'typeof resolvedSearchParams.order_id'
  );
  // Also change the argument
  code1 = code1.replace(
    'await verifyPayment(searchParams.order_id);',
    'await verifyPayment(resolvedSearchParams.order_id);'
  );
  
  fs.writeFileSync(file1, code1);
}

let file2 = 'src/app/ruang-belajar/[slug]/page.tsx';
let code2 = fs.readFileSync(file2, 'utf8');

if (!code2.includes('const resolvedSearchParams = await searchParams')) {
  // Replace the parameter type to accept Promise
  code2 = code2.replace(
    'searchParams: { [key: string]: string | string[] | undefined }',
    'searchParams: Promise<{ [key: string]: string | string[] | undefined }>'
  );
  
  // Await searchParams
  code2 = code2.replace(
    'if (searchParams?.order_id',
    'const resolvedSearchParams = await searchParams;\n    if (resolvedSearchParams?.order_id'
  );
  // Also change the typeof check
  code2 = code2.replace(
    'typeof searchParams.order_id',
    'typeof resolvedSearchParams.order_id'
  );
  // Also change the argument
  code2 = code2.replace(
    'await verifyPayment(searchParams.order_id);',
    'await verifyPayment(resolvedSearchParams.order_id);'
  );
  
  fs.writeFileSync(file2, code2);
}

console.log("Fixed searchParams");
