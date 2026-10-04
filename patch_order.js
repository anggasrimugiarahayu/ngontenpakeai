const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /(const { chartData, dynamicTotalViews, dynamicTotalClicks } = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[date\]\);)(\s*)(const \[date, setDate\] = useState<DateRange \| undefined>\(\{[\s\S]*?\}\);)/m;

code = code.replace(regex, '$3$2$1');

fs.writeFileSync(file, code);
