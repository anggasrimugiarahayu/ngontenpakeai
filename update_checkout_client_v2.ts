import * as fs from 'fs';

const filePath = 'src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the entire `if (paymentState === "pending") { ... }` block
const pendingBlockRegex = /if \(paymentState === "pending"\) \{[\s\S]*?return \([\s\S]*?<\/div>\s*\);\s*\}/;
content = content.replace(pendingBlockRegex, '');

// 2. Disable inputs when pending
content = content.replace(/onChange=\{\(e\) => setCustomerEmail\(e.target.value\)\} /g, `onChange={(e) => setCustomerEmail(e.target.value)} disabled={paymentState === "pending"} `);
content = content.replace(/onChange=\{\(e\) => setCustomerName\(e.target.value\)\} /g, `onChange={(e) => setCustomerName(e.target.value)} disabled={paymentState === "pending"} `);
content = content.replace(/onChange=\{\(e\) => setCustomerPhone\(e.target.value\)\} /g, `onChange={(e) => setCustomerPhone(e.target.value)} disabled={paymentState === "pending"} `);
content = content.replace(/onChange=\{\(e\) => setAgreeToTerms\(e.target.checked\)\}/g, `onChange={(e) => setAgreeToTerms(e.target.checked)} disabled={paymentState === "pending"}`);

// Disable payment method button
content = content.replace(/onClick=\{\(\) => setShowPaymentModal\(true\)\}/g, `onClick={() => paymentState !== "pending" && setShowPaymentModal(true)} disabled={paymentState === "pending"}`);

// 3. Update the main button text and action
const buttonRegex = /onClick=\{paymentState === "error" \? \(\) => setPaymentState\("idle"\) : handlePay\}[\s\S]*?<\/button>/;
const newButton = `onClick={paymentState === "error" ? () => { setPaymentState("idle"); setCurrentToken(""); setCurrentOrderId(""); } : paymentState === "pending" ? () => openSnap(currentToken, currentOrderId) : handlePay} 
            disabled={loading}
            className="w-full bg-rn-accent text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-auto flex-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {paymentState === "error" ? "Buat Pesanan Baru" : paymentState === "pending" ? "Menunggu Pembayaran" : loading ? "Processing..." : \`Buy Now - IDR \${formatRupiah(grossAmount)}\`}
          </button>`;

content = content.replace(buttonRegex, newButton);

fs.writeFileSync(filePath, content);
