const fs = require('fs');
const path = './src/app/(app)/pengaturan/SettingsTabs.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('getPengaturanDataAction')) {
  content = content.replace(
    'import { useState } from "react";',
    'import { useState } from "react";\nimport useSWR from "swr";\nimport { getPengaturanDataAction } from "@/app/actions/pengaturan";'
  );
}

content = content.replace(
  'export function SettingsTabs({ user, isAdmin, isPro, adminData, userData }: { user: any, isAdmin: boolean, isPro: boolean, adminData: any, userData: any }) {',
  `export function SettingsTabs({ user }: { user: any }) {\n  const { data } = useSWR("pengaturan", getPengaturanDataAction);\n\n  if (!data) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;\n\n  const { userData, adminData, isPro, isAdmin } = data;`
);

fs.writeFileSync(path, content);
console.log("Patched SettingsTabs");
