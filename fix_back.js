const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/ClientLayout.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{\/\* BACK TO DASHBOARD BUTTON \(BOTTOM\) \*\/\}\n\s*<div className="p-2 border-t border-gray-100 dark:border-white\/5 mt-auto">\n\s*<Link prefetch=\{true\}\n\s*href=\{backHref\}[\s\S]*?<\/div>/g,
  `{isToolsMode && (
          {/* BACK TO DASHBOARD BUTTON (BOTTOM) */}
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

content = content.replace(
  /\{\/\* BACK TO DASHBOARD \(BOTTOM\) \*\/\}\n\s*<div className="p-4 border-t border-gray-100 dark:border-white\/5 mt-auto">\n\s*<Link prefetch=\{true\}\n\s*href=\{backHref\}[\s\S]*?<\/div>/g,
  `{isToolsMode && (
            {/* BACK TO DASHBOARD (BOTTOM) */}
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

fs.writeFileSync(path, content);
console.log("Fixed Back buttons!");
