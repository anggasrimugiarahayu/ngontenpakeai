const fs = require('fs');
const file = 'src/components/layout/Navbar.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = '<Link href="/pengaturan" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">';
const injection = `
                  {isAdmin && (
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <Link href="/pengaturan" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, injection.trim());
  fs.writeFileSync(file, code);
  console.log("Navbar patched");
} else {
  console.log("Could not find target string in Navbar.tsx");
}
