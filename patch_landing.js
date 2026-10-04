const fs = require('fs');
let file = 'src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('import { createCheckoutToken }')) {
  code = code.replace(
    'import { LayoutDashboard,',
    'import { createCheckoutToken } from "@/app/actions/payment";\nimport { redirect } from "next/navigation";\nimport { LayoutDashboard,'
  );
}

// Replace Basic Lynk.id
const basicLink = `<a
                href="http://lynk.id/ngontenpakaiai/2124pkdew4ee/checkout"
                target="_blank"
                className={\`mt-6 block text-center font-bold py-3 rounded-xl transition-all bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white\`}
              >
                Pilih Paket Basic
              </a>`;
const basicForm = `<form action={async () => {
                const res = await createCheckoutToken({ type: "PRO_BASIC" });
                if (res?.redirectUrl) {
                  window.location.href = res.redirectUrl;
                }
              }}>
                <button type="submit" className={\`w-full mt-6 block text-center font-bold py-3 rounded-xl transition-all bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white\`}>
                  Pilih Paket Basic
                </button>
              </form>`;

// Replace Tools Lynk.id
const toolsLink = `<a
                href="http://lynk.id/ngontenpakaiai/0elxm3wy387w/checkout"
                target="_blank"
                className={\`mt-6 block text-center font-bold py-3 rounded-xl transition-all bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white\`}
              >
                Pilih Sistem Tools
              </a>`;
const toolsForm = `<form action={async () => {
                const res = await createCheckoutToken({ type: "PRO_TOOLS" });
                if (res?.redirectUrl) {
                  window.location.href = res.redirectUrl;
                }
              }}>
                <button type="submit" className={\`w-full mt-6 block text-center font-bold py-3 rounded-xl transition-all bg-gray-900 hover:bg-rn-accent hover:text-black text-white dark:bg-[#27272a] dark:hover:bg-rn-accent dark:hover:text-black dark:text-white\`}>
                  Pilih Sistem Tools
                </button>
              </form>`;
              
// Replace Lengkap Lynk.id
const lengkapLink = `<a
                href="http://lynk.id/ngontenpakaiai/w3pwykdq8j60/checkout"
                target="_blank"
                className="mt-6 block text-center bg-rn-accent text-black font-black py-3 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(208,226,6,0.2)]"
              >
                Pilih Paket Lengkap
              </a>`;
const lengkapForm = `<form action={async () => {
                const res = await createCheckoutToken({ type: "PRO_LENGKAP" });
                if (res?.redirectUrl) {
                  window.location.href = res.redirectUrl;
                }
              }}>
                <button type="submit" className="w-full mt-6 block text-center bg-rn-accent text-black font-black py-3 rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(208,226,6,0.2)]">
                  Pilih Paket Lengkap
                </button>
              </form>`;

code = code.replace(basicLink, basicForm);
code = code.replace(toolsLink, toolsForm);
code = code.replace(lengkapLink, lengkapForm);

fs.writeFileSync(file, code);
console.log("Patched landing page links");
