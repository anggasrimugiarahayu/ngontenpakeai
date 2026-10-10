import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import { Toaster } from "react-hot-toast";' not in content:
    content = content.replace('import { Footer } from "@/components/layout/Footer";', 
                              'import { Footer } from "@/components/layout/Footer";\nimport { Toaster } from "react-hot-toast";')

# Add <Toaster /> right before </ThemeProvider>
if '<Toaster' not in content:
    content = content.replace('</ThemeProvider>', '<Toaster position="bottom-right" toastOptions={{ style: { background: "#333", color: "#fff" } }} />\n          </ThemeProvider>')

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)

print("LAYOUT MODIFIED")
