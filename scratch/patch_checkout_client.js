const fs = require('fs');
const path = './src/app/(app)/checkout/CheckoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update Props interface
const propsRegex = /interface CheckoutClientProps \{[\s\S]*?\}/;
const propsMatch = content.match(propsRegex);
if (propsMatch) {
  const newProps = propsMatch[0].replace('}', '  includedAddons?: any[];\n}');
  content = content.replace(propsMatch[0], newProps);
}

// Update component arguments
const argsRegex = /export default function CheckoutClient\(\{([\s\S]*?)\}: CheckoutClientProps\) \{/;
const argsMatch = content.match(argsRegex);
if (argsMatch) {
  const newArgsStr = argsMatch[1] + ', includedAddons = []';
  content = content.replace(argsMatch[0], `export default function CheckoutClient({${newArgsStr}}: CheckoutClientProps) {`);
}

// Inject included addons UI in ADD-ON PRODUK LAIN section
// We want it right before selectedAddons
const uiRegex = /\{selectedAddons\.map\(addonId => \{/;
const uiReplacement = `
                  {includedAddons.length > 0 && (
                    <div className="mb-2 space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 ml-1">Included (Gratis)</p>
                      {includedAddons.map(addon => (
                        <div key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-green-50/50 dark:bg-green-900/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-[#18181b] rounded-lg p-0.5 border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                              {addon.coverUrl ? <img src={addon.coverUrl} className="w-full h-full object-contain" alt="" /> : <CreditCard className="w-4 h-4 text-gray-300" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{addon.title}</p>
                              <p className="text-xs font-medium text-green-600 dark:text-green-500">Termasuk Paket (Rp 0)</p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedAddons.length > 0 && <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 ml-1 mt-3">Tambahan Ekstra</p>}
                  {selectedAddons.map(addonId => {`;

content = content.replace(uiRegex, uiReplacement);

fs.writeFileSync(path, content);
console.log("Patched CheckoutClient.tsx");
