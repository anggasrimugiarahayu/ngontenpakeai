const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Signature
content = content.replace(
  /export default function ClientLayout\(\{\n  children,\n  hasBlueprint,\n  dbFeatures = \[\],\n  isPro = false,\n\}\: \{\n  children: React\.ReactNode;\n  hasBlueprint: boolean;\n  dbFeatures\?: any\[\];\n  isPro\?: boolean;\n\}\) \{/m,
  `export default function ClientLayout({
  children,
  hasBlueprint,
  dbFeatures = [],
  isPro = false,
  isAdmin = false,
  isLoggedIn = false,
}: {
  children: React.ReactNode;
  hasBlueprint: boolean;
  dbFeatures?: any[];
  isPro?: boolean;
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}) {`
);

// Add CreditCard icon
content = content.replace(
  /import \{ Compass, /g,
  'import { CreditCard, Compass, '
);

// 2. Logic Block
const logicStart = content.indexOf(`const isDashboard = pathname === '/ruang-ngonten'`);
const logicEnd = content.indexOf(`return (`, logicStart);

const newLogic = `
  const isToolsMode = pathname.startsWith('/ruang-ngonten/') && pathname !== '/ruang-ngonten' && pathname !== '/ruang-ngonten/';

  let GLOBAL_NAV_ITEMS = [];

  if (!isLoggedIn) {
    GLOBAL_NAV_ITEMS = [
      { label: "Ruang Belajar", href: "/login?redirect=/ruang-belajar", icon: BookOpen },
      { label: "Ruang Ngonten", href: "/login?redirect=/ruang-ngonten", icon: LayoutTemplate },
      { label: "Ruang Growing", href: "/login?redirect=/ruang-growing", icon: RefreshCw },
      { label: "Pricing", href: "/?pricing=true", icon: CreditCard },
    ];
  } else {
    GLOBAL_NAV_ITEMS = [
      { label: "Ruang Belajar", href: "/ruang-belajar", icon: BookOpen },
      { label: "Ruang Ngonten", href: "/ruang-ngonten", icon: LayoutTemplate },
      { label: "Ruang Growing", href: "/ruang-growing", icon: RefreshCw },
    ];
    if (isAdmin) {
      GLOBAL_NAV_ITEMS.push({ label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' });
    }
    GLOBAL_NAV_ITEMS.push(
      { label: 'Pengaturan', icon: Settings, href: '/pengaturan' },
      { label: 'Bantuan', icon: HelpCircle, href: '/bantuan' },
      { label: 'Feedback', icon: MessageSquare, href: '/feedback' }
    );
  }

  const mappedTools = TOOLS.map(tool => {
    const dbMatch = dbFeatures.find(db => db.name === tool.label);
    return {
      ...tool,
      isActive: dbMatch ? dbMatch.isActive : true,
      isProOnly: dbMatch ? dbMatch.isProOnly : false
    };
  }).filter(tool => tool.isActive);

  const itemsToRender = isToolsMode ? mappedTools : GLOBAL_NAV_ITEMS;
  const backHref = isToolsMode ? '/ruang-ngonten' : '/';

  `;

content = content.substring(0, logicStart) + newLogic + content.substring(logicEnd);


// 3. Desktop JSX Replacements
content = content.replace(
  /\{\(isDashboard \? GLOBAL_NAV : isSettingsArea \? SETTINGS_NAV : mappedTools\)\.map\(\(tool\) => \{/g,
  `{itemsToRender.map((tool) => {`
);
content = content.replace(
  /\{\(isDashboard \? GLOBAL_NAV : mappedTools\)\.map\(\(tool\) => \{/g,
  `{itemsToRender.map((tool) => {`
);

content = content.replace(
  /let isActive = false;\n\s*if \(isDashboard\) \{\n\s*isActive = pathname === tool\.href \|\| \(tool\.href !== '\/' && pathname\.startsWith\(tool\.href\)\);\n\s*\} else \{\n\s*isActive = pathname\.startsWith\(tool\.href\);\n\s*\}/g,
  `let isActive = false;
                if (!isToolsMode) {
                  isActive = pathname === tool.href || (tool.href !== '/' && tool.href !== '/?pricing=true' && !tool.href.startsWith('/login') && pathname.startsWith(tool.href));
                } else {
                  isActive = pathname === tool.href;
                }`
);

content = content.replace(
  /const isLocked = !isDashboard && !isSettingsArea && \(\(!hasBlueprint && tool\.href !== '\/ruang-ngonten\/master-blueprint'\) \|\| \(\(tool as any\)\.isProOnly && !isPro\)\);/g,
  `const isLocked = isToolsMode && ((!hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint') || ((tool as any).isProOnly && !isPro));`
);

content = content.replace(
  /const isLocked = !isDashboard && \(\(!hasBlueprint && tool\.href !== '\/ruang-ngonten\/master-blueprint'\) \|\| \(\(tool as any\)\.isProOnly && !isPro\)\);/g,
  `const isLocked = isToolsMode && ((!hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint') || ((tool as any).isProOnly && !isPro));`
);

// Desktop Back button hide
content = content.replace(
  /\{\/\* BACK TO DASHBOARD BUTTON \(BOTTOM\) \*\/\}\n\s*<div className="p-2 border-t border-gray-100 dark:border-white\/5 mt-auto">\n\s*<Link prefetch=\{true\}\n\s*href=\{backHref\}[\s\S]*?<\/div>/g,
  `{isToolsMode && (
          <div className="p-2 border-t border-gray-100 dark:border-white/5 mt-auto">
            <Link prefetch={true}
              href={backHref}
              title={!isExpanded ? "Back" : undefined}
              className={\`flex items-center rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 \${
                isExpanded ? 'px-3 py-3 gap-3' : 'justify-center w-10 h-10 mx-auto'
              }\`}
            >
              <LayoutGrid size={isExpanded ? 18 : 20} className="shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap truncate">Back</span>
              )}
            </Link>
          </div>
          )}`
);

// Mobile Back button hide
content = content.replace(
  /\{\/\* BACK TO DASHBOARD \(BOTTOM\) \*\/\}\n\s*<div className="p-4 border-t border-gray-100 dark:border-white\/5 mt-auto">\n\s*<Link prefetch=\{true\}\n\s*href=\{backHref\}[\s\S]*?<\/div>/g,
  `{isToolsMode && (
            <div className="p-4 border-t border-gray-100 dark:border-white/5 mt-auto">
              <Link prefetch={true}
                href={backHref}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 transition-colors hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
              >
                <LayoutGrid size={18} />
                <span className="text-sm">Back</span>
              </Link>
          </div>
          )}`
);

// Mobile title
content = content.replace(
  /<span className="font-bold text-gray-900 dark:text-white">\{isDashboard \? 'Navigasi' : 'Menu Tools'\}<\/span>/g,
  `<span className="font-bold text-gray-900 dark:text-white">{isToolsMode ? 'Menu Tools' : 'Navigasi'}</span>`
);


fs.writeFileSync(path, content);
console.log("Patched clean ClientLayout!");
