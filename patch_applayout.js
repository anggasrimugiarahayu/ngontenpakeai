const fs = require('fs');
const path = './src/app/(app)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
  const dbFeatures = await getCachedFeatures();
  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com" || session?.user?.role === "ADMIN";
  const isPro = session?.user?.role === "PRO" || isAdmin;
  const isLoggedIn = !!session?.user;
  
  return <ClientLayout hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isAdmin={isAdmin} isLoggedIn={isLoggedIn}>{children}</ClientLayout>;
`;

content = content.replace(
  /const dbFeatures = await getCachedFeatures\(\);[\s\S]*return <ClientLayout hasBlueprint=\{hasBlueprint\} dbFeatures=\{dbFeatures\} isPro=\{isPro\}>\{children\}<\/ClientLayout>;/m,
  replacement.trim()
);

fs.writeFileSync(path, content);
console.log("Patched AppLayout");
