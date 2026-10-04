const fs = require('fs');
const file = 'src/app/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

// The scripts are currently inside ThemeProvider.
// I will extract them and put them after ThemeProvider.
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
code = code.replace("</ThemeProvider>", "</ThemeProvider>\n" + scriptBlock);

// Also fix the double suppressHydrationWarning on html that failed earlier because of the newline
code = code.replace(/<html suppressHydrationWarning\s+lang="id"\s+className="scroll-smooth"\s+suppressHydrationWarning\s+>/m, '<html lang="id" className="scroll-smooth" suppressHydrationWarning>');

fs.writeFileSync(file, code);
