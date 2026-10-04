const fs = require('fs');

// 1. page.tsx
let pageFile = 'src/app/pengaturan/page.tsx';
let pageCode = fs.readFileSync(pageFile, 'utf8');
// add fetch for features and usages
pageCode = pageCode.replace(
  'const isPro = isAdmin || false; // Later add actual Pro check for normal users',
  `const isPro = isAdmin || false; // Later add actual Pro check for normal users

  const [features, usages] = await Promise.all([
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.usage.findMany({ where: { userId: session.user.id } })
  ]);
  const userData = { features, usages };`
);
// add import prisma
if (!pageCode.includes('import prisma')) {
  pageCode = pageCode.replace(
    'import { SettingsTabs } from "./SettingsTabs";',
    'import { SettingsTabs } from "./SettingsTabs";\nimport prisma from "@/lib/prisma";'
  );
}
pageCode = pageCode.replace(
  'adminData={adminData}',
  'adminData={adminData}\n        userData={userData}'
);
fs.writeFileSync(pageFile, pageCode);

// 2. SettingsTabs.tsx
let tabsFile = 'src/app/pengaturan/SettingsTabs.tsx';
let tabsCode = fs.readFileSync(tabsFile, 'utf8');
tabsCode = tabsCode.replace(
  'adminData?: any; \n}) {',
  'adminData?: any; \n  userData?: any; \n}) {'
);
tabsCode = tabsCode.replace(
  'adminData \n}:',
  'adminData, \n  userData \n}:'
);
tabsCode = tabsCode.replace(
  '<PlanUsageSection isPro={isPro} />',
  '<PlanUsageSection isPro={isPro} userData={userData} />'
);
fs.writeFileSync(tabsFile, tabsCode);

// 3. SettingsClientData.tsx
let clientFile = 'src/app/pengaturan/SettingsClientData.tsx';
let clientCode = fs.readFileSync(clientFile, 'utf8');
clientCode = clientCode.replace(
  `const DEFAULT_FEATURES = [
  { id: "cm1ibtwf2000213d2f9o8593a", name: "Ruang Belajar" },
  { id: "cm1ibtwf2000313d2r9lve0g3", name: "Ruang Ngonten" },
  { id: "cm1ibtwf2000413d2kxy758ed", name: "Ruang Growing" },
];`,
  ''
);
clientCode = clientCode.replace(
  'export function PlanUsageSection({ isPro }: { isPro: boolean }) {',
  'export function PlanUsageSection({ isPro, userData }: { isPro: boolean, userData?: any }) {'
);
clientCode = clientCode.replace(
  'const [features, setFeatures] = useState(DEFAULT_FEATURES);',
  'const [features, setFeatures] = useState(userData?.features || []);'
);
clientCode = clientCode.replace(
  'const [usages, setUsages] = useState<any[]>([]);',
  'const [usages, setUsages] = useState<any[]>(userData?.usages || []);'
);

// We can remove the fetch logic for features/usages, but keep ApiKeySection fetch
clientCode = clientCode.replace(
  `  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.features) setFeatures(data.features);
        if (data.usages) setUsages(data.usages);
      })
      .catch(console.error);
  }, []);`,
  ''
);
fs.writeFileSync(clientFile, clientCode);

console.log("Pengaturan SSR patched!");
