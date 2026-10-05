const fs = require('fs');
const path = './src/app/(app)/pengaturan/SettingsTabs.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace multiline signature
const oldSignature = `export function SettingsTabs({ 
  user, 
  isAdmin, 
  isPro, 
  adminData, 
  userData 
}: { 
  user: any; 
  isAdmin: boolean; 
  isPro: boolean; 
  adminData?: any; 
  userData?: any; 
}) {`;

const newSignature = `export function SettingsTabs({ user }: { user: any }) {
  const { data } = useSWR("pengaturan", getPengaturanDataAction);
  if (!data) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;
  const { userData, adminData, isPro, isAdmin } = data;`;

if (content.includes(oldSignature)) {
  content = content.replace(oldSignature, newSignature);
  fs.writeFileSync(path, content);
  console.log("Fixed SettingsTabs");
} else {
  console.log("Could not find SettingsTabs signature");
}
