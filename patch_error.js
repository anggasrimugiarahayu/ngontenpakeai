const fs = require('fs');
let file = 'src/app/actions/payment.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('Server Key belum disetel')) {
  code = code.replace(
    'const parameter = {',
    `if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY === 'SB-Mid-server-YOUR_SERVER_KEY') {
    throw new Error("Midtrans Server Key belum disetel di .env. Silakan tambahkan MIDTRANS_SERVER_KEY.");
  }
  
  const parameter = {`
  );
  fs.writeFileSync(file, code);
}
