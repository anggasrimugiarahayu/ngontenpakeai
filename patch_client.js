const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// Use real data for lifetime sales on the main tab
// Wait, it already uses data.lifetimeSalesIDR and data.lifetimeOrders

// Use real data in the Statistics tab for Total Sales & Sales Value (IDR)
code = code.replace(
  /<h3 className="text-3xl font-black text-gray-900 dark:text-white">1,093<\/h3>/,
  `<h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.lifetimeOrders}</h3>`
);

code = code.replace(
  /<h3 className="text-3xl font-black text-gray-900 dark:text-white">2,925,000<\/h3>/,
  `<h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatIDR(data.lifetimeSalesIDR)}</h3>`
);

// Replace MOCK_PRODUCTS.map with data.realProductSales (fallback to empty if not there)
code = code.replace(
  /\{MOCK_PRODUCTS\.map\(\(product\) => \(/g,
  `{(data.realProductSales && data.realProductSales.length > 0 ? data.realProductSales : []).map((product: any) => (`
);

fs.writeFileSync(file, code);
