const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<h2 className="text-2xl font-black text-gray-900 dark:text-white">2,925,000<\/h2>/,
  `<h2 className="text-2xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeSalesIDR)}</h2>`
);

fs.writeFileSync(file, code);
