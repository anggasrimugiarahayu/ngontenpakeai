const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `        {/* Right Panel: Live Mockup */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="sticky top-24">
            <h3 className="font-bold text-center mb-4 uppercase tracking-widest text-[11px] text-gray-400 dark:text-gray-500">LIVE MOCKUP</h3>
            <Mockup />
          </div>
        </div>`;

const replaceStr = `        {/* Right Panel: Live Mockup */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col min-h-0">
          <h3 className="font-bold text-center mb-4 uppercase tracking-widest text-[11px] text-gray-400 dark:text-gray-500 shrink-0">LIVE MOCKUP</h3>
          <div className="flex-1 min-h-0 flex flex-col items-center justify-start">
            <Mockup />
          </div>
        </div>`;

code = code.replace(targetStr, replaceStr);

// Also remove max-h-[80vh] from Mockup since it will now scale cleanly to its parent flex-1
code = code.replace(
  `w-full max-w-[350px] h-full max-h-[80vh] mx-auto rounded-[12px] border border-gray-300`,
  `w-full max-w-[350px] h-full mx-auto rounded-[12px] border border-gray-300`
);

fs.writeFileSync(file, code);
