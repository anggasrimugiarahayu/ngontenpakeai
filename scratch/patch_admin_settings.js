const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { PricingConfigSection }')) {
  content = content.replace(
    'import { deleteVoucher } from "./admin-actions";',
    'import { deleteVoucher } from "./admin-actions";\nimport { PricingConfigSection } from "./PricingConfigSection";'
  );
}

content = content.replace(
  '      {/* Tab: Ruang Belajar */}',
  '      {/* Tab: Pricing Paket */}\n      {activeTab === "pricing" && (\n        <PricingConfigSection products={products} settings={settings} />\n      )}\n\n      {/* Tab: Ruang Belajar */}'
);

fs.writeFileSync(path, content);
console.log("Patched AdminSettingsContent");
