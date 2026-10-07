const fs = require('fs');
const path = './src/app/(app)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject import
if (!content.includes('getPricingPackagesAction')) {
  content = content.replace(
    'import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";',
    'import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";\nimport { getPricingPackagesAction } from "@/app/actions/pengaturan";'
  );
}

// Inject state & fetch
const stateRegex = /const \[mounted, setMounted\] = useState\(false\);/;
if (!content.includes('pricingConfig')) {
  content = content.replace(stateRegex, `const [mounted, setMounted] = useState(false);\n  const [pricingConfig, setPricingConfig] = useState<any>(null);\n\n  useEffect(() => {\n    getPricingPackagesAction().then(res => {\n      if (res) setPricingConfig(res);\n    });\n  }, []);`);
}

// Replace Pricing Grid
const oldGridRegex = /<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full text-left">[\s\S]*?<\/main>\n      \)\}/;

const newGridCode = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full text-left">
            {[
              { key: "PRO_BASIC", type: "PRO_BASIC" },
              { key: "PRO_TOOLS", type: "PRO_TOOLS" },
              { key: "PRO_LENGKAP", type: "PRO_LENGKAP" }
            ].map(pkgItem => {
              const defaultPkg = {
                PRO_BASIC: {
                  name: "Paket Basic (Ebook)",
                  desc: "Cocok buat yang mau fokus belajar teori faceless creator.",
                  price: 99000,
                  originalPrice: 2419000,
                  discountLabel: "95% OFF",
                  highlightText: "",
                  features: ["Ebook Ngonten Pakai AI (Personal Use)", "Ebook 30 Day Creator Challenge (Personal Use)", "Bimbingan Private 1-on-1 WhatsApp (6 Bulan)", "6+ Bonus Strategi & Template Lainnya"]
                },
                PRO_TOOLS: {
                  name: "Paket Sistem Tools",
                  desc: "Cocok buat yang butuh bantuan AI untuk eksekusi ngonten.",
                  price: 99000,
                  originalPrice: 666000,
                  discountLabel: "85% OFF",
                  highlightText: "",
                  features: ["Akses 8 Sistem AI Ngonten Pakai AI", "Ebook Ngonten Pakai AI (Included)", "Bonus 4 Resource Ekstra (Footage, Hook, Tools)", "Sekali Bayar, Akses Selamanya"]
                },
                PRO_LENGKAP: {
                  name: "Paket Lengkap (Ebook)",
                  desc: "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.",
                  price: 149000,
                  originalPrice: 2419000,
                  discountLabel: "94% OFF",
                  highlightText: "Paling Worth",
                  features: ["Semua isi Paket Basic", "Hak Jual Ulang (PLR) untuk berbagai materi", "Bimbingan Private 1-on-1 (Lifetime)", "Tools Text to Voice Over", "Video Footage Siap Pakai"]
                }
              };
              
              const pkgData = (pricingConfig && pricingConfig[pkgItem.key]) || defaultPkg[pkgItem.key as keyof typeof defaultPkg];
              const isLengkap = pkgItem.key === "PRO_LENGKAP";
              const hasHighlight = pkgData.highlightText && pkgData.highlightText.trim() !== "";
              
              const formatK = (p: number) => p >= 1000 ? (p / 1000) + 'k' : p.toString();

              return (
                <div key={pkgItem.key} className={\`border rounded-2xl p-5 md:p-6 flex flex-col relative transition-colors duration-300 \${hasHighlight ? 'border-2 border-rn-accent transform lg:-translate-y-4 bg-white dark:bg-[#18181b]' : 'bg-white border-gray-200 dark:bg-[#18181b] dark:border-white/5'}\`}>
                  {hasHighlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rn-accent text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                      {pkgData.highlightText}
                    </div>
                  )}

                  <h3 className={\`font-bold text-lg md:text-xl font-heading mb-1 transition-colors duration-300 text-gray-900 dark:text-white\`}>
                    {pkgData.name}
                  </h3>
                  <p className={\`text-xs md:text-sm mb-4 transition-colors duration-300 text-gray-600 dark:text-gray-400 line-clamp-2\`}>
                    {pkgData.desc}
                  </p>

                  <div className="flex items-end gap-2 mb-2">
                    <span className={\`text-2xl md:text-3xl font-black transition-colors duration-300 text-gray-900 dark:text-white\`}>
                      Rp {formatK(pkgData.price)}
                    </span>
                  </div>
                  
                  <div className={\`text-xs md:text-sm mb-2 transition-colors duration-300 text-gray-500 dark:text-gray-400\`}>
                    Total <span className="line-through">Rp {pkgData.originalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  
                  {pkgData.discountLabel && (
                    <div className="inline-block bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-max mb-4">
                      {pkgData.discountLabel}
                    </div>
                  )}

                  <div className="flex-1">
                    <ul className={\`space-y-2 md:space-y-3 text-xs md:text-sm transition-colors duration-300 text-gray-700 dark:text-gray-300\`}>
                      {pkgData.features.map((f: string, i: number) => (
                        <li key={i} className={\`flex gap-2 items-start \${isLengkap && i === 0 ? 'font-bold text-gray-900 dark:text-white' : ''}\`}>
                          <Check className="w-4 h-4 text-rn-accent shrink-0 mt-0.5" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link prefetch={true} href={\`/checkout?type=\${pkgItem.type}\`} className={\`w-full mt-6 block text-center font-bold py-3 rounded-xl transition-all \${hasHighlight ? 'bg-rn-accent text-black font-black hover:bg-white shadow-[0_0_20px_rgba(208,226,6,0.2)]' : 'bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white'}\`}>
                    {pkgData.name.includes("Basic") ? "Pilih Paket Basic" : pkgData.name.includes("Tools") ? "Pilih Sistem Tools" : "Pilih Paket Lengkap"}
                  </Link>
                </div>
              );
            })}
          </div>
        </main>
      )}`;

content = content.replace(oldGridRegex, newGridCode);

fs.writeFileSync(path, content);
console.log("Patched page.tsx");
