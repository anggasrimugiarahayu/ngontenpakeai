const fs = require('fs');
const path = './src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
if (!content.includes('validatePromoCodeAction')) {
  content = content.replace(
    /import \{ createCheckoutToken, verifyPayment, cancelPayment \} from "@\/app\/actions\/payment";/,
    'import { createCheckoutToken, verifyPayment, cancelPayment } from "@/app/actions/payment";\nimport { validatePromoCodeAction } from "@/app/actions/checkout";'
  );
}

// States
if (!content.includes('showVoucherModal')) {
  content = content.replace(
    /const \[showAddonModal, setShowAddonModal\] = useState\(false\);/,
    `const [showAddonModal, setShowAddonModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, type: string, value: number, amount: number} | null>(null);`
  );
}

// Discount Logic
const oldCalcRegex = /const \{ grossAmount, adminFee, totalAddonsPrice \} = useMemo\(\(\) => \{\n    const addonsTotal = availableAddons\.filter\(a => selectedAddons\.includes\(a\.id\)\)\.reduce\(\(acc, curr\) => acc \+ \(curr\.price \|\| 0\), 0\);\n    const finalBase = baseAmount \+ addonsTotal;\n    const calc = calculatePaymentFees\(finalBase, selectedMethod\);\n    return \{ \.\.\.calc, totalAddonsPrice: addonsTotal \};\n  \}, \[baseAmount, selectedMethod, selectedAddons, availableAddons\]\);/;

const newCalc = `const { grossAmount, adminFee, totalAddonsPrice, discountAmount } = useMemo(() => {
    const addonsTotal = availableAddons.filter(a => selectedAddons.includes(a.id)).reduce((acc, curr) => acc + (curr.price || 0), 0);
    let finalBase = baseAmount + addonsTotal;
    
    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.type === "PERCENTAGE") {
        discount = Math.floor(finalBase * (appliedVoucher.value / 100));
      } else {
        discount = appliedVoucher.value;
      }
      if (discount > finalBase) discount = finalBase;
      appliedVoucher.amount = discount; // mutates state ref safely for rendering
      finalBase -= discount;
    }

    const calc = calculatePaymentFees(finalBase, selectedMethod);
    return { ...calc, totalAddonsPrice: addonsTotal, discountAmount: discount };
  }, [baseAmount, selectedMethod, selectedAddons, availableAddons, appliedVoucher]);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || !productId) return;
    setIsVerifyingPromo(true);
    setPromoError("");
    try {
      const res = await validatePromoCodeAction(promoCodeInput.trim(), productId);
      if (res.success) {
        setAppliedVoucher({ code: promoCodeInput.trim().toUpperCase(), type: res.discountType, value: res.discountValue, amount: 0 });
        setShowVoucherModal(false);
        setPromoCodeInput("");
      } else {
        setPromoError(res.message);
      }
    } catch(e) {
      setPromoError("Terjadi kesalahan.");
    } finally {
      setIsVerifyingPromo(false);
    }
  };
`;
content = content.replace(oldCalcRegex, newCalc);

// Update createCheckoutToken call
content = content.replace(
  /addonIds: selectedAddons \}\);/,
  'addonIds: selectedAddons, voucherCode: appliedVoucher?.code, discountAmount }):'
); // wait, it's addonIds: selectedAddons }); let's fix strictly.
content = content.replace(
  /addonIds: selectedAddons \}\);/g,
  'addonIds: selectedAddons, voucherCode: appliedVoucher?.code, discountAmount });'
);

// Add Checkout Header
content = content.replace(
  /<button onClick=\{\(\) => router\.back\(\)\} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-3 transition-colors w-fit">\n        <ArrowLeft className="w-4 h-4" \/> Kembali\n      <\/button>/,
  `<div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">Checkout</h1>
        <div className="w-20"></div>
      </div>`
);

// Payment Detail UI
const paymentDetailRegex = /<h3 className="text-\[11px\] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-4 uppercase">PAYMENT DETAIL<\/h3>\n          <div className="space-y-3 mb-6">[\s\S]*?<div className="flex justify-between text-lg md:text-xl font-bold mt-4 pt-4 border-t border-gray-100 dark:border-white\/10">[\s\S]*?<\/div>/;

const newPaymentDetail = `<h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-4 uppercase">PAYMENT DETAIL</h3>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">Rp {formatRupiah(baseAmount + (totalAddonsPrice || 0))}</span>
            </div>
            
            {appliedVoucher ? (
              <div className="flex justify-between text-rn-accent text-sm items-center">
                <div className="flex items-center gap-2">
                  <span>Discount ({appliedVoucher.code})</span>
                  <button onClick={() => setAppliedVoucher(null)} className="p-0.5 hover:bg-rn-accent/10 rounded-full transition-colors"><X className="w-3 h-3" /></button>
                </div>
                <span className="font-medium">- Rp {formatRupiah(appliedVoucher.amount)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Discount</span>
                <span className="font-medium text-rn-accent">- Rp 0</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
              <span>Convenience fee</span>
              <span className="font-medium text-gray-900 dark:text-white">Rp {formatRupiah(adminFee)}</span>
            </div>
            <div className="flex justify-between text-lg md:text-xl font-bold mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
              <span className="text-gray-900 dark:text-white uppercase tracking-tight">TOTAL</span>
              <span className="text-gray-900 dark:text-white">Rp {formatRupiah(grossAmount)}</span>
            </div>
          </div>
          
          {!appliedVoucher && (
            <button 
              onClick={() => setShowVoucherModal(true)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 text-sm font-bold hover:border-rn-accent hover:text-rn-accent transition-colors disabled:opacity-50"
            >
              + Add Voucher
            </button>
          )}`;

content = content.replace(paymentDetailRegex, newPaymentDetail);

// Add Voucher Modal
const voucherModalUI = `
      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-900 dark:text-white">Masukkan Kode Promo</h3>
              <button onClick={() => { setShowVoucherModal(false); setPromoError(""); setPromoCodeInput(""); }} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 space-y-4">
              <input 
                type="text" 
                placeholder="Contoh: DISKON50" 
                value={promoCodeInput} 
                onChange={(e) => setPromoCodeInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl text-base font-bold uppercase focus:ring-2 focus:ring-rn-accent/50 focus:border-rn-accent outline-none dark:text-white transition-all text-center"
              />
              {promoError && (
                <p className="text-red-500 text-xs font-medium text-center">{promoError}</p>
              )}
              <button 
                onClick={handleApplyPromo}
                disabled={isVerifyingPromo || !promoCodeInput.trim()}
                className="w-full bg-rn-accent text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gunakan Kode"}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/\{showPaymentModal && \(/, voucherModalUI + '\n      {showPaymentModal && (');

fs.writeFileSync(path, content);
console.log("Patched UI for vouchers!");
