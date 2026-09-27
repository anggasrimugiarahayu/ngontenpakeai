const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Change Mockup Backgrounds
const mockupStart = `  const Mockup = () => (`;
const copyBtnStart = `            {/* Copy Button */}`;
const oldMockupStr = code.substring(code.indexOf(mockupStart), code.indexOf(copyBtnStart));

// We want to replace dark:bg-black with dark:bg-[#121214] ONLY inside the Mockup
const newMockupStr = oldMockupStr.replace(/dark:bg-black/g, 'dark:bg-[#121214]');
code = code.replace(oldMockupStr, newMockupStr);

// 2. Change Copy Profile IG Button Style
const oldCopyBtn = `<button 
                onClick={copyProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white bg-white dark:bg-black rounded-full font-bold transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-none dark:hover:shadow-[0px_0px_0px_0px_#ffffff] hover:translate-y-[4px] hover:translate-x-[4px] hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-gray-900 dark:hover:border-white font-heading text-sm md:text-base"
              >
                <Copy className="w-4 h-4" /> Copy Profile IG
              </button>`;
const newCopyBtn = `<button 
                onClick={copyProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-rn-accent hover:bg-orange-600 text-white transition-colors shadow-lg shadow-rn-accent/20"
              >
                <Copy className="w-4 h-4" /> Copy Profile IG
              </button>`;
code = code.replace(oldCopyBtn, newCopyBtn);

// Also verify if there are any other Neo-Brutalist shadows remaining in the buttons inside Mockup.
// The user complained about "style button tools kita". Maybe they also meant the Edit/Share buttons?
// The Edit/Share buttons in Mockup currently have:
// shadow-[3px_3px_0px_0px_rgba...]
// In modern app tools (like Master Blueprint), buttons just use a thin border and simple hover.
// Let's remove the brutalist hover effects from Edit/Share buttons too.
const brutalistHoverEditShare = `hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px] active:!bg-[#D0E206] active:!border-gray-900 active:!text-gray-900 dark:active:!bg-[#D0E206] dark:active:!border-gray-900 dark:active:!text-gray-900`;
const brutalistHoverEditShare2 = `hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px]`;
const activeStateReplacement = `hover:bg-gray-100 dark:hover:bg-white/10 active:bg-gray-200 dark:active:bg-white/20`;

// We will do a regex replacement for these brutalist classes in the entire code to clean it up completely.
code = code.replace(/hover:shadow-\[3px_3px_0px_0px[^\]]+\]/g, '');
code = code.replace(/dark:hover:shadow-\[3px_3px_0px_0px[^\]]+\]/g, '');
code = code.replace(/hover:-translate-x-\[2px\] hover:-translate-y-\[2px\]/g, 'hover:bg-gray-100 dark:hover:bg-white/10');
code = code.replace(/active:!bg-\[#D0E206\] active:!border-gray-900 active:!text-gray-900 dark:active:!bg-\[#D0E206\] dark:active:!border-gray-900 dark:active:!text-gray-900/g, 'active:scale-95');
code = code.replace(/bg-\[#D0E206\] dark:bg-\[#D0E206\] text-gray-900 dark:text-gray-900 shadow-\[3px_3px_0px_0px_rgba\(17,24,39,1\)\] dark:shadow-\[3px_3px_0px_0px_#ffffff\] -translate-x-\[2px\] -translate-y-\[2px\]/g, 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white border-rn-accent');
code = code.replace(/focus-within:shadow-\[[^\]]+\]/g, '');
code = code.replace(/focus-within:-translate-x-\[2px\] focus-within:-translate-y-\[2px\]/g, '');
code = code.replace(/focus:shadow-\[[^\]]+\]/g, '');
code = code.replace(/focus:-translate-x-\[2px\] focus:-translate-y-\[2px\]/g, '');

fs.writeFileSync(file, code);
