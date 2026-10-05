const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the old if (!data)
content = content.replace(
  'if (!data) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;\n\n  React.useEffect(() => {',
  'React.useEffect(() => {'
);

// 2. Fix useEffect
content = content.replace(
  "if (data.fullOrders && data.fullOrders.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {",
  "if (data?.fullOrders && data.fullOrders.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {"
);
content = content.replace(
  "}, [data.fullOrders]);",
  "}, [data?.fullOrders]);"
);

// 3. Fix useMemo
content = content.replace(
  'const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {\n    return { \n       chartData: [], \n       dynamicTotalViews: data.totalViews || 0, \n       dynamicTotalClicks: data.totalClicks || 0, \n       salesChartData: [] \n    };\n  }, [date, data.totalViews, data.totalClicks]);',
  `const { chartData, dynamicTotalViews, dynamicTotalClicks, salesChartData } = React.useMemo(() => {
    return { 
       chartData: [], 
       dynamicTotalViews: data?.totalViews || 0, 
       dynamicTotalClicks: data?.totalClicks || 0, 
       salesChartData: [] 
    };
  }, [date, data?.totalViews, data?.totalClicks]);

  if (!data) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;`
);

fs.writeFileSync(path, content);
console.log("Fixed Hooks in DashboardClient");
