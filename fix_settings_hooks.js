const fs = require('fs');
const path = './src/app/(app)/pengaturan/SettingsTabs.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `  const { data } = useSWR("pengaturan", getPengaturanDataAction);
  if (!data) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;
  const { userData, adminData, isPro, isAdmin } = data;
  const [activeTab, setActiveTab] = useState("profil");`;

const newCode = `  const { data } = useSWR("pengaturan", getPengaturanDataAction);
  const [activeTab, setActiveTab] = useState("profil");

  if (!data) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;
  const { userData, adminData, isPro, isAdmin } = data;`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(path, content);
console.log("Fixed hooks order in SettingsTabs");
