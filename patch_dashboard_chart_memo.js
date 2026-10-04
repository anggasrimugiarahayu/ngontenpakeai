const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// replace useEffect and state
const target = `const [chartData, setChartData] = useState<any[]>([]);
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
  }, [date]);`;

const replacement = `const { chartData, dynamicTotalViews, dynamicTotalClicks } = React.useMemo(() => {
    if (!date?.from) return { chartData: [], dynamicTotalViews: 0, dynamicTotalClicks: 0 };
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
      return { chartData: newData, dynamicTotalViews: tViews, dynamicTotalClicks: tClicks };
    } catch (e) {
      console.error(e);
      return { chartData: [], dynamicTotalViews: 0, dynamicTotalClicks: 0 };
    }
  }, [date]);`;

code = code.replace(target, replacement);

fs.writeFileSync(file, code);
