const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `          <div className="flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] transition-all duration-200 border border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none">Edit profile</div>
          <div className="flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] transition-all duration-200 border border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none">Share profile</div>`;

const replaceStr = `          <div className="cursor-pointer flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] transition-all duration-200 border border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none hover:border-gray-900 dark:hover:border-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px]">Edit profile</div>
          <div className="cursor-pointer flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] transition-all duration-200 border border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none hover:border-gray-900 dark:hover:border-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px]">Share profile</div>`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync(file, code);
