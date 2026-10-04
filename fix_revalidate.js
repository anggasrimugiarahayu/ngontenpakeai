const fs = require('fs');
let file = 'src/app/actions/payment.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('revalidatePath("/ruang-belajar");')) {
  // Need to make sure revalidatePath is imported
  if (!code.includes('import { revalidatePath }')) {
    code = code.replace(
      'import { headers } from "next/headers";',
      'import { headers } from "next/headers";\nimport { revalidatePath } from "next/cache";'
    );
  }
  
  code = code.replace(
    'return { success: true, status: finalStatus, justUpdated: true };',
    'revalidatePath("/ruang-belajar");\n      return { success: true, status: finalStatus, justUpdated: true };'
  );
  fs.writeFileSync(file, code);
}
console.log("Added back revalidatePath");
