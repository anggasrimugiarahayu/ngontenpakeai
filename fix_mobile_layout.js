const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="w-full max-w-7xl mx-auto p-4 md:p-6 pt-2 md:pt-4 flex flex-col h-[calc(100dvh-150px)] md:h-[calc(100vh-180px)] animate-in fade-in duration-300">`;
const replaceStr = `<div className="w-full max-w-7xl mx-auto p-4 md:p-6 pt-2 md:pt-4 flex flex-col min-h-[calc(100dvh-150px)] lg:h-[calc(100vh-180px)] animate-in fade-in duration-300">`;

// Add a fallback min-h to the mockup so it doesn't collapse if aspect ratio is ignored by some browsers
const oldMockupStr = `<div className="w-full max-w-[350px] h-full mx-auto rounded-[12px] border border-gray-300`;
const newMockupStr = `<div className="w-full max-w-[350px] min-h-[600px] lg:min-h-0 h-full mx-auto rounded-[12px] border border-gray-300`;

code = code.replace(targetStr, replaceStr);
code = code.replace(oldMockupStr, newMockupStr);

fs.writeFileSync(file, code);
