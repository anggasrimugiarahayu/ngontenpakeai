const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="w-full max-w-7xl mx-auto p-4 md:p-6 md:py-8 h-[100dvh] md:h-screen flex flex-col animate-in fade-in duration-300">`;
const replaceStr = `<div className="w-full max-w-7xl mx-auto p-4 md:p-6 pt-2 md:pt-4 flex flex-col h-[calc(100dvh-150px)] md:h-[calc(100vh-180px)] animate-in fade-in duration-300">`;
code = code.replace(targetStr, replaceStr);

fs.writeFileSync(file, code);
