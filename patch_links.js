const fs = require('fs');

// Patch page.tsx
const pagePath = './src/app/page.tsx';
if (fs.existsSync(pagePath)) {
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Ebook Card (Ruang Belajar)
  content = content.replace(
    /<Link\n\s*href=\{isLoggedIn \? "\/ruang-belajar" : "\/login\?redirect=\/ruang-belajar"\}/g,
    `<Link
              prefetch={true}
              onMouseEnter={() => { if (isLoggedIn) preload("ruangBelajar", getRuangBelajarDataAction) }}
              onTouchStart={() => { if (isLoggedIn) preload("ruangBelajar", getRuangBelajarDataAction) }}
              href={isLoggedIn ? "/ruang-belajar" : "/login?redirect=/ruang-belajar"}`
  );

  // Tools Card (Ruang Ngonten)
  content = content.replace(
    /<Link\n\s*href=\{isLoggedIn \? "\/ruang-ngonten" : "\/login\?redirect=\/ruang-ngonten"\}/g,
    `<Link prefetch={true}\n              href={isLoggedIn ? "/ruang-ngonten" : "/login?redirect=/ruang-ngonten"}`
  );

  // Ruang Growing Card
  content = content.replace(
    /<Link\n\s*href=\{isLoggedIn \? "\/ruang-growing" : "\/login\?redirect=\/ruang-growing"\}/g,
    `<Link prefetch={true}\n              href={isLoggedIn ? "/ruang-growing" : "/login?redirect=/ruang-growing"}`
  );

  fs.writeFileSync(pagePath, content);
  console.log("Patched page.tsx cards");
}

// Patch Navbar.tsx
const navbarPath = './src/components/layout/Navbar.tsx';
if (fs.existsSync(navbarPath)) {
  let content = fs.readFileSync(navbarPath, 'utf8');

  const imports = `import { preload } from "swr";
import { getDashboardDataAction } from "@/app/actions/dashboard";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";

const handleHoverPrefetch = (href: string) => {
  if (href === '/dashboard') preload("dashboard", getDashboardDataAction);
  else if (href === '/pengaturan') preload("pengaturan", getPengaturanDataAction);
  else if (href === '/ruang-belajar') preload("ruangBelajar", getRuangBelajarDataAction);
};
`;

  if (!content.includes('handleHoverPrefetch')) {
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\n' + imports);
  }

  content = content.replace(
    /<Link href="\/dashboard"/g,
    '<Link prefetch={true} onMouseEnter={() => handleHoverPrefetch("/dashboard")} onTouchStart={() => handleHoverPrefetch("/dashboard")} href="/dashboard"'
  );
  content = content.replace(
    /<Link href="\/pengaturan"/g,
    '<Link prefetch={true} onMouseEnter={() => handleHoverPrefetch("/pengaturan")} onTouchStart={() => handleHoverPrefetch("/pengaturan")} href="/pengaturan"'
  );

  fs.writeFileSync(navbarPath, content);
  console.log("Patched Navbar.tsx dropdowns");
}
