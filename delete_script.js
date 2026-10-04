const fs = require('fs');
const file = 'src/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

const scriptBlock = `            <Script src="https://unpkg.com/lucide@latest" strategy="beforeInteractive" />
            <Script id="lucide-init" strategy="lazyOnload">
              {\`
                setInterval(() => {
                  if (window.lucide) {
                    window.lucide.createIcons();
                  }
                }, 1000);
              \`}
            </Script>`;

code = code.replace(scriptBlock, "");
fs.writeFileSync(file, code);
