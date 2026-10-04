const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-emerald-500 font-medium hover:underline mt-1">085156339329</a>`;
const replace = `<a href={\`https://wa.me/\${(order.user?.phone || '085156339329').replace(/\\D/g, '').replace(/^0/, '62')}\`} target="_blank" rel="noopener noreferrer" className="inline-block text-emerald-500 font-medium hover:underline mt-1">{order.user?.phone || '085156339329'}</a>`;

code = code.replace(target, replace);
fs.writeFileSync(file, code);
console.log("Fixed waUrl reference");
