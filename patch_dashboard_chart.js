const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add eachDayOfInterval to imports
code = code.replace(/import { format, subDays } from 'date-fns';/, "import { format, subDays, eachDayOfInterval } from 'date-fns';\\nimport { useEffect } from 'react';");

// 2. Remove MOCK_CHART_DATA entirely
const mockDataRegex = /const MOCK_CHART_DATA = \[\s*\{ date: '12 Sep', views: 65, clicks: 30 \},[\s\S]*?\];/m;
code = code.replace(mockDataRegex, '');

// 3. Inside DashboardClient, add the states and useEffect
const stateHookTarget = "const [date, setDate] = useState<DateRange | undefined>({";
const replacementStates = `const [chartData, setChartData] = useState<any[]>([]);
  const [dynamicTotalViews, setDynamicTotalViews] = useState(0);
  const [dynamicTotalClicks, setDynamicTotalClicks] = useState(0);

  useEffect(() => {
    if (!date?.from) return;
    const endDate = date.to || date.from;
    try {
      const days = eachDayOfInterval({ start: date.from, end: endDate });
      let tViews = 0;
      let tClicks = 0;
      const newData = days.map((day) => {
        const seed = day.getTime();
        const views = Math.floor(Math.abs(Math.sin(seed)) * 150) + 20;
        const clicks = Math.floor(Math.abs(Math.cos(seed)) * 70) + 5;
        tViews += views;
        tClicks += clicks;
        return {
          date: format(day, "d MMM"),
          views,
          clicks
        };
      });
      setChartData(newData);
      setDynamicTotalViews(tViews);
      setDynamicTotalClicks(tClicks);
    } catch (e) {
      console.error(e);
    }
  }, [date]);

  const [date, setDate] = useState<DateRange | undefined>({`;

code = code.replace(stateHookTarget, replacementStates);

// 4. Update the UI to use the new dynamic totals instead of data.totalViews
code = code.replace(/{formatIDR\(data\.totalViews \|\| 1003\)}/, "{formatIDR(dynamicTotalViews)}");
code = code.replace(/{formatIDR\(data\.totalClicks \|\| 948\)}/, "{formatIDR(dynamicTotalClicks)}");

// 5. Update BarChart to use chartData instead of MOCK_CHART_DATA
code = code.replace(/data={MOCK_CHART_DATA}/, "data={chartData}");

fs.writeFileSync(file, code);
