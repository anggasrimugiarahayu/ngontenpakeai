const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update the useMemo
const useMemoRegex = /const \{ chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData \} = React\.useMemo\(\(\) => \{\n\s*return \{\n\s*chartData: \[\],\n\s*dynamicTotalViews: data\?\.totalViews \|\| 0,\n\s*dynamicTotalClicks: data\?\.totalClicks \|\| 0,\n\s*salesChartData: \[\]\n\s*\};\n\s*\}, \[date, data\?\.totalViews, data\?\.totalClicks\]\);/m;

const useMemoReplacement = `
  const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {
    return { 
       chartData: data?.viewsChartData || [], 
       dynamicTotalViews: data?.totalViews || 0, 
       dynamicTotalClicks: data?.totalClicks || 0, 
       salesChartData: data?.salesChartData || [] 
    };
  }, [date, data]);
`;
content = content.replace(useMemoRegex, useMemoReplacement.trim());


// 2. Replace 84.19% for Views
const viewsGrowthRegex = /<span className="flex items-center"><ArrowUp size=\{12\}\/> 12\.5%<\/span>/g;
content = content.replace(viewsGrowthRegex, `
                 {data.viewsGrowth >= 0 ? (
                   <span className="flex items-center text-emerald-500"><ArrowUp size={12}/> {data.viewsGrowth}%</span>
                 ) : (
                   <span className="flex items-center text-red-500"><ArrowDown size={12}/> {Math.abs(data.viewsGrowth)}%</span>
                 )}
`.trim());

// If it wasn't 12.5%, let's check what it was. Wait, earlier I didn't grep for Views growth. Let's just use generic regex for the text-emerald-500 span next to dynamicTotalClicks
// Wait, I will just write a function to replace it dynamically.

