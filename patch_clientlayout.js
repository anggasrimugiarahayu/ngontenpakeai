const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Define isHome
if (!content.includes('const isHome =')) {
  content = content.replace(
    "const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/' || pathname.startsWith('/ruang-belajar') || pathname.startsWith('/ruang-growing');",
    "const isHome = pathname === '/' || pathname === '';\n  const isDashboard = pathname === '/ruang-ngonten' || pathname === '/ruang-ngonten/' || pathname.startsWith('/ruang-belajar') || pathname.startsWith('/ruang-growing');"
  );
}

// Replace the mapping target
content = content.replace(
  /\{\(isSettingsArea \? SETTINGS_NAV : isDashboard \? GLOBAL_NAV : mappedTools\)\.map/g,
  `{(isHome ? [...GLOBAL_NAV, ...SETTINGS_NAV] : isSettingsArea ? SETTINGS_NAV : isDashboard ? GLOBAL_NAV : mappedTools).map`
);

// We need to also show the sidebar if isHome is true
content = content.replace(
  /\{\/\* \n        FLOATING SIDEBAR \(DESKTOP\)\n        Only visible if NOT on the main dashboard page\n      \*\/\}\n      <aside className=\{\`hidden md:flex fixed/g,
  `{/* 
        FLOATING SIDEBAR (DESKTOP)
      */}
      <aside className={\`hidden md:flex fixed`
);

// We need to ensure that the sidebar is visible on the home page.
// The sidebar code doesn't actually have a condition that hides the whole <aside> element!
// Wait! Let's check if the aside is conditionally rendered or just conditionally populated.

fs.writeFileSync(path, content);
console.log("Patched ClientLayout");
