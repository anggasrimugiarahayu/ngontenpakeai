const fs = require('fs');

const path = 'src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const gridStart = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">');
const gridEnd = content.indexOf('</div>\n        </main>');

if (gridStart !== -1 && gridEnd !== -1) {
    const gridContent = content.substring(gridStart, gridEnd);
    
    // Extract SVGs
    const svgs = [];
    let svgRegex = /<svg[\s\S]*?<\/svg>/g;
    let match;
    while ((match = svgRegex.exec(gridContent)) !== null) {
        svgs.push(match[0]);
    }

    const newGrid = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* RUANG BELAJAR */}
            <Link
              href="/ruang-belajar"
              className="group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl cursor-pointer z-0 overflow-hidden bg-white border-gray-200 shadow-gray-200 hover:border-orange-400 dark:bg-[#18181b] dark:border-white/5 dark:shadow-black/50 dark:hover:border-orange-500/50"
            >
              <div className="relative w-full overflow-hidden aspect-[16/9] rounded-lg">
                <div
                  data-active="true"
                  className="iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] text-gray-600 dark:text-gray-400"
                  style={{ top: "50%", left: "50%", width: "220%" }}
                >
                  ${svgs[0] || ''}
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className="font-heading text-lg font-bold leading-snug transition-colors duration-300 text-gray-900 dark:text-white"
                >
                  Ruang Belajar
                </h2>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400"
                >
                  Temukan ebook, strategi, dan framework untuk membangun fondasi kontenmu.
                </p>
              </div>
            </Link>

            {/* RUANG NGONTEN */}
            <Link
              href="/ruang-ngonten"
              className="group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl cursor-pointer z-0 overflow-hidden bg-white border-gray-200 shadow-gray-200 hover:border-orange-400 dark:bg-[#18181b] dark:border-white/5 dark:shadow-black/50 dark:hover:border-orange-500/50"
            >
              <div className="relative w-full overflow-hidden aspect-[16/9] rounded-lg">
                <div
                  data-active="true"
                  className="iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] text-gray-600 dark:text-gray-400"
                  style={{ top: "50%", left: "50%", width: "300%" }}
                >
                  ${svgs[2] || svgs[1] || ''}
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className="font-heading text-lg font-bold leading-snug transition-colors duration-300 text-gray-900 dark:text-white"
                >
                  Ruang Ngonten
                </h2>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400"
                >
                  Dari ide jadi konten siap publish dengan tools dan AI yang saling terhubung.
                </p>
              </div>
            </Link>

            {/* RUANG GROWING */}
            <Link
              href="/ruang-growing"
              className="group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl cursor-pointer z-0 overflow-hidden bg-white border-gray-200 shadow-gray-200 hover:border-orange-400 dark:bg-[#18181b] dark:border-white/5 dark:shadow-black/50 dark:hover:border-orange-500/50"
            >
              <div className="relative w-full overflow-hidden aspect-[16/9] rounded-lg">
                <div
                  data-active="true"
                  className="iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] text-gray-600 dark:text-gray-400"
                  style={{ top: "50%", left: "50%", width: "290%" }}
                >
                  ${svgs[3] || svgs[2] || ''}
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className="font-heading text-lg font-bold leading-snug transition-colors duration-300 text-gray-900 dark:text-white"
                >
                  Ruang Growing
                </h2>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300 text-gray-600 dark:text-gray-400"
                >
                  Dari konten jadi aset, bangun sistem yang membantu mengembangkan audiens dan bisnis.
                </p>
              </div>
            </Link>
          </div>`;

    content = content.substring(0, gridStart) + newGrid + content.substring(gridEnd);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Cards updated successfully!');
} else {
    console.log('Could not find grid bounds.');
}
