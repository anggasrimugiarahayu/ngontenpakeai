const fs = require('fs');
const path = './src/app/(app)/bantuan/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Clean up imports
content = content.replace(
  'import { useState, useEffect } from "react";\nimport { Mail, Send, Loader2, CheckCircle, X } from "lucide-react";\nimport { useTheme } from "next-themes";',
  'import { useState } from "react";\nimport { Mail, Send, Loader2, CheckCircle, X } from "lucide-react";'
);

// 2. Clean up variables
const oldVars = `  const { theme } = useTheme();
  const { data: session, status } = useSession();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted ? theme === "dark" : true;`;

const newVars = `  const { data: session, status } = useSession();`;

content = content.replace(oldVars, newVars);

// 3. Replace class names
content = content.replace(
  /className=\{`text-3xl md:text-5xl font-black font-heading mb-2 tracking-tight transition-colors duration-300 \$\{isDark \? "text-white" : "text-gray-900"\} `\}/g,
  'className="text-3xl md:text-5xl font-black font-heading mb-2 tracking-tight transition-colors duration-300 text-gray-900 dark:text-white"'
);
content = content.replace( // Fix slightly different regex matching
  /<h1 className=\{`text-3xl(.*?)isDark(.*?)\`\}>/gs,
  '<h1 className="text-3xl md:text-5xl font-black font-heading mb-2 tracking-tight transition-colors duration-300 text-gray-900 dark:text-white">'
);

content = content.replace(
  /<p className=\{`text-sm(.*?)isDark(.*?)\`\}>/gs,
  '<p className="text-sm md:text-base mb-8 max-w-lg mx-auto transition-colors duration-300 text-gray-600 dark:text-gray-400">'
);

content = content.replace(
  /<div className=\{`w-full max-w-lg(.*?)overflow-hidden \$\{(.*?)\}`\}>/gs,
  '<div className="w-full max-w-lg rounded-2xl border-2 p-6 md:p-8 transition-all duration-300 text-left relative overflow-hidden bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 hover:border-rn-orange/30 shadow-gray-200 dark:shadow-black/50">'
);

content = content.replace(
  /<h2 className=\{`text-lg(.*?)isDark(.*?)\`\}>/gs,
  '<h2 className="text-lg md:text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">'
);

content = content.replace(
  /className=\{`block text-xs font-bold mb-1.5 \$\{isDark \? "text-gray-400" : "text-gray-700"\}`\}/g,
  'className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-400"'
);

const inputClassRegex = /className=\{`w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500\/50 outline-none transition-all(.*?)\$\{.*?isDark.*?\}`\}/gs;
content = content.replace(inputClassRegex, 'className="w-full px-4 py-2.5 rounded-xl text-sm border focus:ring-2 focus:ring-orange-500/50 outline-none transition-all resize-none bg-gray-50 dark:bg-[#27272a] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"');

fs.writeFileSync(path, content);
console.log("Fixed bantuan styles");
