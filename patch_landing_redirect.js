const fs = require('fs');
let file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'const res = await createCheckoutToken({ type: "PRO_BASIC" });',
  'const res = await createCheckoutToken({ type: "PRO_BASIC", redirectUrl: window.location.origin + "/ruang-belajar" });'
);

code = code.replace(
  'const res = await createCheckoutToken({ type: "PRO_TOOLS" });',
  'const res = await createCheckoutToken({ type: "PRO_TOOLS", redirectUrl: window.location.origin + "/ruang-belajar" });'
);

code = code.replace(
  'const res = await createCheckoutToken({ type: "PRO_LENGKAP" });',
  'const res = await createCheckoutToken({ type: "PRO_LENGKAP", redirectUrl: window.location.origin + "/ruang-belajar" });'
);

fs.writeFileSync(file, code);
