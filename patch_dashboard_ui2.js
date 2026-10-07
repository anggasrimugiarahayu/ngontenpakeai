const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace 84.19% block 1
content = content.replace(
  /<span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUp size=\{12\}\/> 84\.19%<\/span>/,
  `{data.salesGrowth >= 0 ? (
                   <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUp size={12}/> {data.salesGrowth}%</span>
                 ) : (
                   <span className="text-xs font-bold text-red-500 flex items-center"><ArrowDown size={12}/> {Math.abs(data.salesGrowth)}%</span>
                 )}`
);

// Replace 84.19% block 2
content = content.replace(
  /<span className="flex items-center"><ArrowUp size=\{10\}\/> 84\.19%<\/span>/,
  `{data.salesGrowth >= 0 ? (
                         <span className="flex items-center text-emerald-500"><ArrowUp size={10}/> {data.salesGrowth}%</span>
                       ) : (
                         <span className="flex items-center text-red-500"><ArrowDown size={10}/> {Math.abs(data.salesGrowth)}%</span>
                       )}`
);


// Add growth to Views & Clicks
const viewsClicksRegex = /<h3 className="text-3xl font-black text-gray-900 dark:text-white">\{formatIDR\(dynamicTotalViews \+ dynamicTotalClicks\)\}<\/h3>/;
content = content.replace(
  viewsClicksRegex,
  `<div className="flex items-baseline gap-2">
                 <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatIDR(dynamicTotalViews + dynamicTotalClicks)}</h3>
                 {data.viewsGrowth >= 0 ? (
                   <span className="text-xs font-bold text-emerald-500 flex items-center"><ArrowUp size={12}/> {data.viewsGrowth}%</span>
                 ) : (
                   <span className="text-xs font-bold text-red-500 flex items-center"><ArrowDown size={12}/> {Math.abs(data.viewsGrowth)}%</span>
                 )}
               </div>`
);

fs.writeFileSync(path, content);
console.log("Patched UI completely!");
