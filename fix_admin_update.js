const fs = require('fs');
let file = 'src/app/pengaturan/AdminSettingsContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix createProduct duplicate price lines
code = code.replace(
  'price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,\n                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,',
  'price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,'
);

// Fix updateProduct payload
code = code.replace(
  'isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",\n                isDownloadable: formData.get("isDownloadable") === "on",\n              });\n              setLoading(false);',
  'isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",\n                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,\n                isDownloadable: formData.get("isDownloadable") === "on",\n              });\n              setLoading(false);'
);

// Fix Admin Settings Card Footer text
code = code.replace(
  '{prod.accessLevel}',
  '{(prod.accessLevel === "PREMIUM" || prod.accessLevel === "PRO") ? `Rp ${(prod.price || 0).toLocaleString("id-ID")}` : "Rp 0"}'
);

// Fix the "PREMIUM" badge rendering based on old isProOnly logic
code = code.replace(
  `{prod.isProOnly && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-orange-700 dark:text-gray-300 bg-orange-100 dark:bg-[#222225] px-1.5 py-0.5 rounded uppercase tracking-wider border border-orange-200 dark:border-white/5 whitespace-nowrap">
                          PREMIUM
                        </span>
                      )}`,
  `{prod.accessLevel !== 'FREE' && (
                        <span className={\`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border whitespace-nowrap \${prod.accessLevel === 'PREMIUM' ? 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/30' : 'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/30'}\`}>
                          {prod.accessLevel}
                        </span>
                      )}`
);

fs.writeFileSync(file, code);
console.log("AdminSettingsContent.tsx fixed for price!");
