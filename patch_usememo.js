const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {
    return { 
       chartData: [], 
       dynamicTotalViews: data?.totalViews || 0, 
       dynamicTotalClicks: data?.totalClicks || 0, 
       salesChartData: [] 
    };
  }, [date, data?.totalViews, data?.totalClicks]);`;

const replacement = `  const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {
    return { 
       chartData: data?.viewsChartData || [], 
       dynamicTotalViews: data?.totalViews || 0, 
       dynamicTotalClicks: data?.totalClicks || 0, 
       salesChartData: data?.salesChartData || [] 
    };
  }, [date, data]);`;

if(content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content);
  console.log("Patched useMemo successfully!");
} else {
  console.log("Could not find exact useMemo string to replace.");
}
