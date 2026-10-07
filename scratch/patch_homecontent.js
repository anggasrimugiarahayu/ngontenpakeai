const fs = require('fs');
const path = './src/app/(app)/HomePageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'function HomeContent() {',
  'function HomeContent({ initialPricingConfig }: { initialPricingConfig: any }) {'
);

content = content.replace(
  '<HomeContent />',
  '<HomeContent initialPricingConfig={initialPricingConfig} />'
);

fs.writeFileSync(path, content);
console.log("Patched HomeContent");
