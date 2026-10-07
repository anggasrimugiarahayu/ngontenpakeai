const fs = require('fs');
const path = './src/app/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add cancelPayment to imports
content = content.replace(
  /import \{ createCheckoutToken, verifyPayment \} from "@\/app\/actions\/payment";/,
  'import { createCheckoutToken, verifyPayment, cancelPayment } from "@/app/actions/payment";'
);

// 2. Add availableAddons to props
content = content.replace(
  /existingPendingOrder\?: \{ token: string, orderId: string, expiryTime: string, paymentMethodKey: string \} \| null;\n\}/,
  'existingPendingOrder?: { token: string, orderId: string, expiryTime: string, paymentMethodKey: string } | null;\n  availableAddons?: { id: string, title: string, coverUrl: string | null, price: number }[];\n}'
);

content = content.replace(
  /existingPendingOrder\n\}: CheckoutClientProps\)/,
  'existingPendingOrder,\n  availableAddons = []\n}: CheckoutClientProps)'
);

// 3. Add Add-on State
const stateRegex = /const \[showPaymentModal, setShowPaymentModal\] = useState\(false\);/;
content = content.replace(stateRegex, 
  `const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const handleCancelPayment = async () => {
    if (!currentOrderId) return;
    setIsCancelLoading(true);
    try {
      await cancelPayment(currentOrderId);
      window.location.reload();
    } catch(e) {
      console.error(e);
      setIsCancelLoading(false);
    }
  };
`);

// 4. Update baseAmount to include Add-ons
const feesRegex = /const \{ grossAmount, adminFee \} = useMemo\(\(\) => \{\n    return calculatePaymentFees\(baseAmount, selectedMethod\);\n  \}, \[baseAmount, selectedMethod\]\);/;
content = content.replace(feesRegex, 
  `const { grossAmount, adminFee, totalAddonsPrice } = useMemo(() => {
    const addonsTotal = availableAddons.filter(a => selectedAddons.includes(a.id)).reduce((acc, curr) => acc + (curr.price || 0), 0);
    const finalBase = baseAmount + addonsTotal;
    const calc = calculatePaymentFees(finalBase, selectedMethod);
    return { ...calc, totalAddonsPrice: addonsTotal };
  }, [baseAmount, selectedMethod, selectedAddons, availableAddons]);`
);

// 5. Pass addonIds to createCheckoutToken
const createRegex = /const res = await createCheckoutToken\(\{ type, productId, paymentMethodKey: selectedMethod, customerName, customerEmail, customerPhone \}\);/;
content = content.replace(createRegex, 
  `const res = await createCheckoutToken({ type, productId, paymentMethodKey: selectedMethod, customerName, customerEmail, customerPhone, addonIds: selectedAddons });`
);

// 6. UI for Addons: Put it below the PRODUCT box
const productBoxEndRegex = /<span className="font-medium text-gray-900 dark:text-white text-sm md:text-base shrink-0 ml-2">Rp \{formatRupiah\(baseAmount\)\}<\/span>\n            <\/div>\n          <\/div>/;

const addonUI = `<span className="font-medium text-gray-900 dark:text-white text-sm md:text-base shrink-0 ml-2">Rp {formatRupiah(baseAmount)}</span>
            </div>
            
            {/* Addons Section */}
            {availableAddons && availableAddons.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
                <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">ADD-ON PRODUK LAIN</h3>
                <div className="space-y-3">
                  {availableAddons.map(addon => (
                    <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-[#18181b] rounded-lg p-0.5 border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                          {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-4 h-4 text-gray-300" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                          <p className="text-xs font-medium text-rn-accent">+ Rp {formatRupiah(addon.price || 0)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedAddons(prev => prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id])}
                        disabled={isPending}
                        className={\`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 \${
                          selectedAddons.includes(addon.id) 
                            ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20' 
                            : 'bg-rn-accent/10 text-rn-accent hover:bg-rn-accent/20'
                        }\`}
                      >
                        {selectedAddons.includes(addon.id) ? 'Batal' : '+ Add'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>`;

content = content.replace(productBoxEndRegex, addonUI);

// 7. Update totals inside the breakdown if Addons exist
const subtotalRegex = /<span className="font-medium text-gray-900 dark:text-white">Rp \{formatRupiah\(baseAmount\)\}<\/span>/;
content = content.replace(subtotalRegex, 
  `<span className="font-medium text-gray-900 dark:text-white">Rp {formatRupiah(baseAmount + (totalAddonsPrice || 0))}</span>`
);

// 8. Add Cancel Button if pending
const buyButtonRegex = /<button onClick=\{paymentState === "error" \? \(\) => \{ setCurrentToken\(""\); setCurrentOrderId\(""\); handlePay\(\); \} : paymentState === "pending" \? \(\) => openSnap\(currentToken, currentOrderId\) : handlePay\} disabled=\{loading\}\n            className=\{\`w-full text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-auto flex-none shadow-md \$\{'bg-rn-accent hover:bg-rn-accent\/90'\}\`\}>\n            \{loading \? <Loader2 className="w-5 h-5 animate-spin" \/> : null\}\n            \{paymentState === "pending" \? "Menunggu Pembayaran" : loading \? "Processing..." : \`Buy Now - IDR \$\{formatRupiah\(grossAmount\)\}\`\}\n          <\/button>/;

const buyButtonReplace = `<div className="flex flex-col gap-2 mt-auto">
            <button onClick={paymentState === "error" ? () => { setCurrentToken(""); setCurrentOrderId(""); handlePay(); } : paymentState === "pending" ? () => openSnap(currentToken, currentOrderId) : handlePay} disabled={loading || isCancelLoading}
              className={\`w-full text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md \${'bg-rn-accent hover:bg-rn-accent/90'}\`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {paymentState === "pending" ? "Lanjutkan Pembayaran" : loading ? "Processing..." : \`Buy Now - IDR \${formatRupiah(grossAmount)}\`}
            </button>
            
            {paymentState === "pending" && (
              <button 
                onClick={handleCancelPayment} 
                disabled={isCancelLoading || loading}
                className="w-full text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isCancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Batalkan Pembayaran
              </button>
            )}
          </div>`;

content = content.replace(buyButtonRegex, buyButtonReplace);

fs.writeFileSync(path, content);
console.log("Patched CheckoutClient.tsx for addons and cancel!");
