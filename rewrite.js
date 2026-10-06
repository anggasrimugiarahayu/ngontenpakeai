const fs = require('fs');

const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// We need to rewrite the component signature
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

// We need to rewrite the logic section.
// The logic section starts from `const pathname = usePathname();` down to `const mappedTools = ... filter(tool => tool.isActive);`

const oldLogicRegex = /const pathname = usePathname\(\);[\s\S]*const mappedTools = TOOLS\.map[^\;]+\.filter[^;]+;/m;
const newLogic = `
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile drawer
  const [isExpanded, setIsExpanded] = useState(false); // Desktop floating dock

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Listen for open-tools-drawer event from Navbar
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-tools-drawer', handleOpen);
    return () => window.removeEventListener('open-tools-drawer', handleOpen);
  }, []);

  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Mode 2: Tools Navigation (Only when INSIDE a specific tool)
  const isToolsMode = pathname.startsWith('/ruang-ngonten/') && pathname !== '/ruang-ngonten' && pathname !== '/ruang-ngonten/';

  // Global Nav Items based on Role
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
content = content.replace(oldLogicRegex, newLogic.trim());

// We need to replace the mapping in Desktop sidebar
content = content.replace(
  /\{\(isHome \? \[\.\.\.GLOBAL_NAV, \.\.\.SETTINGS_NAV\] : isSettingsArea \? SETTINGS_NAV : isDashboard \? GLOBAL_NAV : mappedTools\)\.map\(\(tool\) => \{/g,
  `{itemsToRender.map((tool) => {`
);

// We need to fix isActive logic inside map
content = content.replace(
  /let isActive = false;\n\s*if \(isDashboard\) \{\n\s*isActive = pathname === tool\.href \|\| \(tool\.href !== '\/' && pathname\.startsWith\(tool\.href\)\);\n\s*\} else \{\n\s*isActive = pathname\.startsWith\(tool\.href\);\n\s*\}/g,
  `let isActive = false;
                if (!isToolsMode) {
                  isActive = pathname === tool.href || (tool.href !== '/' && tool.href !== '/?pricing=true' && !tool.href.startsWith('/login') && pathname.startsWith(tool.href));
                } else {
                  isActive = pathname === tool.href;
                }`
);

// We need to fix isLocked logic
content = content.replace(
  /const isLocked = !isDashboard && !isSettingsArea && \(\(!hasBlueprint && tool\.href !== '\/ruang-ngonten\/master-blueprint'\) \|\| \(\(tool as any\)\.isProOnly && !isPro\)\);/g,
  `const isLocked = isToolsMode && ((!hasBlueprint && tool.href !== '/ruang-ngonten/master-blueprint') || ((tool as any).isProOnly && !isPro));`
);

// Update Mobile Drawer header title
content = content.replace(
  /<span className="font-bold text-gray-900 dark:text-white">\{isDashboard \? 'Navigasi' : 'Menu Tools'\}<\/span>/g,
  `<span className="font-bold text-gray-900 dark:text-white">{isToolsMode ? 'Menu Tools' : 'Navigasi'}</span>`
);

// Ensure the mapping inside Mobile Drawer is also replaced (if the regex didn't catch it)
content = content.replace(
  /\{\(isHome \? \[\.\.\.GLOBAL_NAV, \.\.\.SETTINGS_NAV\] : isSettingsArea \? SETTINGS_NAV : isDashboard \? GLOBAL_NAV : mappedTools\)\.map\(\(tool\) => \{/g,
  `{itemsToRender.map((tool) => {`
);


fs.writeFileSync(path, content);
console.log("Rewrite successful!");
