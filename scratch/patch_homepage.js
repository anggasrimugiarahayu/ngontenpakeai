const fs = require('fs');
const path = './src/app/(app)/HomePageClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace export default function Home()
content = content.replace(
  'export default function Home() {',
  'export default function HomePageClient({ initialPricingConfig }: { initialPricingConfig: any }) {'
);

// Remove getPricingPackagesAction fetch logic
const stateRegex = /const \[mounted, setMounted\] = useState\(false\);\n  const \[pricingConfig, setPricingConfig\] = useState<any>\(null\);\n\n  useEffect\(\(\) => \{\n    getPricingPackagesAction\(\)\.then\(res => \{\n      if \(res\) setPricingConfig\(res\);\n    \}\);\n  \}, \[\]\);/;
content = content.replace(stateRegex, 'const [mounted, setMounted] = useState(false);\n  const pricingConfig = initialPricingConfig;');

// Optional: remove import if unused
content = content.replace('import { getPricingPackagesAction } from "@/app/actions/pengaturan";\n', '');

fs.writeFileSync(path, content);
console.log("Patched HomePageClient.tsx");
