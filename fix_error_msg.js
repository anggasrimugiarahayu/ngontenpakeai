const fs = require('fs');
let file = 'src/app/actions/payment.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'throw new Error("Gagal membuat transaksi pembayaran.");',
  'throw new Error(`Gagal membuat transaksi: ${error.message}`);'
);
fs.writeFileSync(file, code);
