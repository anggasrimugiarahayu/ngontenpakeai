const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const [activeTab, setActiveTab] = useState(\'overview\');',
  `const [activeTab, setActiveTab] = useState('overview');\n\n  if (!data) return <div className="p-8 text-center animate-pulse">Loading dashboard...</div>;`
);

fs.writeFileSync(path, content);
console.log("Patched DashboardClient 2");
