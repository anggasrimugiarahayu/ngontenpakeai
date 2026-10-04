const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `  // Fetch users & products
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.digitalProduct.count();`;

const replacement = `  // Fetch users & products
  let totalUsers = 0;
  let totalProducts = 0;
  try {
    totalUsers = await prisma.user.count();
    totalProducts = await prisma.digitalProduct.count();
  } catch (e) {
    console.log("Supabase timeout on counting users/products");
  }`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
console.log("Patched dashboard page");
