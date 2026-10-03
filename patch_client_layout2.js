const fs = require('fs');
const file = 'src/app/ruang-ngonten/ClientLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add icons to lucide-react imports
const importMatch = code.match(/import \{([^}]+)\} from 'lucide-react';/);
if (importMatch) {
  let imports = importMatch[1];
  if (!imports.includes('Settings')) imports += ', Settings';
  if (!imports.includes('HelpCircle')) imports += ', HelpCircle';
  if (!imports.includes('MessageSquare')) imports += ', MessageSquare';
  code = code.replace(importMatch[0], `import {${imports}} from 'lucide-react';`);
}

// 2. Define SETTINGS_NAV and change isDashboard logic
const globalNavBlock = `
  const GLOBAL_NAV = [
    { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen },
    { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate },
    { label: "Ruang Growing", href: "/ruang-growing", icon: RefreshCw },
  ];`;

const settingsNavBlock = `
  const GLOBAL_NAV = [
    { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen },
    { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate },
    { label: "Ruang Growing", href: "/ruang-growing", icon: RefreshCw },
  ];

  const SETTINGS_NAV = [
    { label: "Pengaturan", href: "/pengaturan", icon: Settings },
    { label: "Bantuan", href: "/bantuan", icon: HelpCircle },
    { label: "Feedback", href: "/feedback", icon: MessageSquare },
  ];

  const isSettingsArea = pathname.startsWith('/pengaturan') || pathname.startsWith('/bantuan') || pathname.startsWith('/feedback');
`;

if (code.includes('label: "Ruang Belajar"') && !code.includes('SETTINGS_NAV')) {
  code = code.replace(globalNavBlock, settingsNavBlock);
}

// Remove the old isDashboard replacement we did earlier to fix the boolean logic
const oldIsDashboard = `const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/' || pathname.startsWith('/ruang-belajar') || pathname.startsWith('/ruang-growing') || pathname.startsWith('/pengaturan') || pathname.startsWith('/bantuan') || pathname.startsWith('/feedback');`;
const newIsDashboard = `const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/' || pathname.startsWith('/ruang-belajar') || pathname.startsWith('/ruang-growing');`;
code = code.replace(oldIsDashboard, newIsDashboard);

// 3. Update the menu rendering for Desktop (isDashboard ? GLOBAL_NAV : mappedTools)
code = code.replace(
  /\{\(isDashboard \? GLOBAL_NAV : mappedTools\)\.map\(\(tool\) => \{/g,
  `{(isSettingsArea ? SETTINGS_NAV : isDashboard ? GLOBAL_NAV : mappedTools).map((tool) => {`
);

// 4. Update the menu rendering for Mobile
code = code.replace(
  /\{\(isDashboard \? GLOBAL_NAV : mappedTools\)\.map\(\(tool, index\) => \{/g,
  `{(isSettingsArea ? SETTINGS_NAV : isDashboard ? GLOBAL_NAV : mappedTools).map((tool, index) => {`
);

// 5. Ensure "Back" button always goes to root if in settings area
const oldBackHref = `const backHref = pathSegments.length > 1 ? '/' + pathSegments[0] : '/';`;
const newBackHref = `const backHref = isSettingsArea ? '/' : (pathSegments.length > 1 ? '/' + pathSegments[0] : '/');`;
code = code.replace(oldBackHref, newBackHref);

fs.writeFileSync(file, code);
