const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('getDashboardDataAction')) {
  content = content.replace(
    'import { useState } from "react";',
    'import { useState } from "react";\nimport useSWR from "swr";\nimport { getDashboardDataAction } from "@/app/actions/dashboard";'
  );
}

content = content.replace(
  'export default function DashboardClient({ data, user }: { data: any, user: any }) {',
  `export default function DashboardClient({ user }: { user: any }) {\n  const { data } = useSWR("dashboard", getDashboardDataAction);`
);

fs.writeFileSync(path, content);
console.log("Patched DashboardClient");
