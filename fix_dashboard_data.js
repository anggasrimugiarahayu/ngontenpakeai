const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "React.useEffect(() => {",
  "if (!data) return <div className=\"p-8 text-center animate-pulse\">Loading dashboard...</div>;\n\n  React.useEffect(() => {"
);

fs.writeFileSync(path, content);
console.log("Fixed DashboardClient data check");
