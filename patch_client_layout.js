const fs = require('fs');
const file = 'src/app/ruang-ngonten/ClientLayout.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add Settings to Lucide imports if not there. Let's just import LayoutDashboard or PieChart if needed.
// Wait, LayoutDashboard is likely needed for the Dashboard menu.
// Let's find the lucide-react import
code = code.replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];/, (match, group1) => {
    let imports = group1.split(',').map(s => s.trim());
    if (!imports.includes('LayoutDashboard')) imports.push('LayoutDashboard');
    return `import { ${imports.join(', ')} } from 'lucide-react';`;
});

// 2. Add Dashboard to SETTINGS_NAV
const settingsNavStr = `const SETTINGS_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Pengaturan', icon: Settings, href: '/pengaturan' },
  { label: 'Bantuan', icon: HelpCircle, href: '/bantuan' },
  { label: 'Feedback', icon: MessageSquare, href: '/feedback' },
];`;

code = code.replace(/const SETTINGS_NAV = \[[^\]]+\];/, settingsNavStr);

// 3. Update isSettingsArea definition to include /dashboard
code = code.replace(/const isSettingsArea = pathname === '\/pengaturan' \|\| pathname\.startsWith\('\/pengaturan'\) \|\| pathname === '\/bantuan' \|\| pathname === '\/feedback';/, 
  "const isSettingsArea = pathname === '/dashboard' || pathname.startsWith('/dashboard') || pathname === '/pengaturan' || pathname.startsWith('/pengaturan') || pathname === '/bantuan' || pathname === '/feedback';");

fs.writeFileSync(file, code);
