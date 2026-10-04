const fs = require('fs');
let file = 'src/app/actions/payment.ts';
let code = fs.readFileSync(file, 'utf8');

if (code.includes('revalidatePath("/ruang-belajar");')) {
  code = code.replace('revalidatePath("/ruang-belajar");', '');
  fs.writeFileSync(file, code);
}
console.log("Removed revalidatePath");
