const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace("from 'date-fns';\\nimport { useEffect } from 'react';", "from 'date-fns';\nimport { useEffect } from 'react';");

fs.writeFileSync(file, code);
