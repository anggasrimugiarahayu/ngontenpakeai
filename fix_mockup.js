const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldMockupStr = `<div className="w-full max-w-[350px] min-h-[600px] lg:min-h-0 h-full mx-auto rounded-[12px] border border-gray-300`;
const newMockupStr = `<div className="w-full max-w-[350px] lg:h-full mx-auto rounded-[12px] border border-gray-300`;

code = code.replace(oldMockupStr, newMockupStr);
fs.writeFileSync(file, code);
