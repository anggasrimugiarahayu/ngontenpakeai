const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// The <p> was replaced by <div>, but </p> is still there. 
// Let's replace the </p> for those 3 cards.

code = code.replace(/Total Views & Clicks\n\s*<\/p>/, "Total Views & Clicks\n               </div>");
code = code.replace(/Total Sales\n\s*<\/p>/, "Total Sales\n               </div>");
code = code.replace(/Sales Value \(IDR\)\n\s*<\/p>/, "Sales Value (IDR)\n               </div>");

fs.writeFileSync(file, code);
