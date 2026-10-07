const fs = require('fs');
const path = './src/app/(app)/pengaturan/PricingConfigSection.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('  const PreviewCard =');
const endIndex = content.indexOf('  return (', startIndex);

const newCardCode = `  const PreviewCard = ({ pkgKey }: { pkgKey: string }) => {
    const pkg = config[pkgKey];
    const isSpecial = pkg.highlightText && pkg.highlightText.length > 0;
    
    return (
      <div className={\`bg-white dark:bg-[#121214] border \${isSpecial ? 'border-orange-500' : 'border-gray-200 dark:border-white/10'} rounded-2xl p-5 relative flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow\`}>
        {isSpecial && (
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-widest border-[3px] border-white dark:border-[#121214] whitespace-nowrap shadow-sm">
             {pkg.highlightText}
           </div>
        )}
        
        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1.5 leading-tight">{pkg.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-4 leading-relaxed line-clamp-2">{pkg.desc}</p>
        
        <div className="text-gray-900 dark:text-white font-black text-2xl mb-1 tracking-tight">Rp {formatK(pkg.price)}</div>
        <div className="text-gray-400 text-[11px] font-medium mb-1.5 line-through">Total Rp {pkg.originalPrice.toLocaleString('id-ID')}</div>
        {pkg.discountLabel && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 text-[9px] font-black px-1.5 py-0.5 rounded w-max mb-5 tracking-wider">
            {pkg.discountLabel}
          </div>
        )}
        
        <ul className="space-y-2.5 mb-6 flex-1">
          {pkg.features.map((f: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
               <Check className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
               <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        <button className={\`w-full py-2.5 rounded-xl font-black text-xs transition-all duration-300 \${isSpecial ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white'}\`}>
          {pkg.name.includes("Basic") ? "Pilih Paket Basic" : pkg.name.includes("Tools") ? "Pilih Sistem Tools" : "Pilih Paket Lengkap"}
        </button>
      </div>
    );
  };

`;

content = content.substring(0, startIndex) + newCardCode + content.substring(endIndex);

fs.writeFileSync(path, content);
console.log("Patched PreviewCard exactly");
