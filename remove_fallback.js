const fs = require('fs');

function removeBlock(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /const resolvedSearchParams = await searchParams;\n\s*if \(resolvedSearchParams\?\.order_id && typeof resolvedSearchParams\.order_id === 'string'\) \{\n\s*const \{ verifyPayment \} = await import\("@\/app\/actions\/payment"\);\n\s*await verifyPayment\(resolvedSearchParams\.order_id\);\n\s*\}/g,
    ''
  );
  fs.writeFileSync(file, code);
}

removeBlock('src/app/ruang-belajar/page.tsx');
removeBlock('src/app/ruang-belajar/[slug]/page.tsx');
console.log("Removed fallback verification from render");
