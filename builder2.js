const fs = require('fs');

const recovered = fs.readFileSync('recovered_page.txt', 'utf8');
const lines = recovered.split('\n');

const codeLines = [];
let isCode = false;

for (const line of lines) {
    if (line.match(/^1: /)) {
        isCode = true;
    }
    
    if (isCode) {
        const match = line.match(/^\d+:\s?(.*)$/);
        if (match) {
            codeLines.push(match[1]);
        }
    }
}

// Slice up to the line where "Rp 99k" ends
const rp99kIndex = codeLines.findIndex(line => line.includes('Rp 99k'));
let pageCode = codeLines.slice(0, rp99kIndex + 2).join('\n'); // Include the closing </span> and </div>

// Modify the cards text
pageCode = pageCode.replace('Master Blueprint', 'Ruang Belajar');
pageCode = pageCode.replace('Langkah demi langkah merancang pondasi bisnis kontenmu.', 'Temukan ebook, strategi, dan framework untuk membangun fondasi kontenmu.');

pageCode = pageCode.replace('Bio Builder', 'Ruang Ngonten');
pageCode = pageCode.replace('Gunakan AI untuk merangkai kata-kata bio yang menarik audiens idealmu.', 'Dari ide jadi konten siap publish dengan tools dan AI yang saling terhubung.');

pageCode = pageCode.replace('Content Builder', 'Ruang Growing');
pageCode = pageCode.replace('Mudah mencari ide, membuat script, desain carousel, hingga susun content calendar.', 'Dari konten jadi aset, bangun sistem yang membantu mengembangkan audiens dan bisnis.');

// DELETE the Ebook Builder card!
const ebookCardStart = pageCode.indexOf('{/* EBOOK BUILDER CARD */}');
const pricingStart = pageCode.indexOf('</div>\n        </main>\n      ) : (\n        /* PRICING MODAL / SECTION */');

if (ebookCardStart !== -1 && pricingStart !== -1) {
    pageCode = pageCode.substring(0, ebookCardStart) + pageCode.substring(pricingStart);
}

// Now append the rest of the file
pageCode += `
              <div className={\`text-xs md:text-sm mb-2 transition-colors duration-300 \${isDark ? "text-gray-400" : "text-gray-500"}\`}>
                Total <span className="line-through">Rp 3.500.000</span>
              </div>
              <div className="inline-block bg-orange-500/20 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider w-max mb-4">
                Promo Spesial
              </div>

              <div className="flex-1">
                <ul className={\`space-y-2 md:space-y-3 text-xs md:text-sm transition-colors duration-300 \${isDark ? "text-gray-300" : "text-gray-700"}\`}>
                  <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-rn-accent shrink-0 mt-0.5" /> Akses ke Ruang Belajar</li>
                  <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-rn-accent shrink-0 mt-0.5" /> Akses ke Ruang Ngonten</li>
                  <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-rn-accent shrink-0 mt-0.5" /> Akses ke Ruang Growing</li>
                </ul>
              </div>

              <a href="#" className={\`mt-6 block text-center font-bold py-3 rounded-xl transition-all \${isDark ? "bg-[#27272a] hover:bg-rn-accent hover:text-black text-white" : "bg-gray-900 hover:bg-rn-accent hover:text-black text-white"}\`}>
                Pilih Paket Sistem
              </a>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111111]" />}>
      <HomeContent />
    </Suspense>
  );
}
`;

pageCode = pageCode.replace('md:grid-cols-2 gap-4', 'md:grid-cols-3 gap-4');
pageCode = pageCode.replace('href="/master-blueprint"', 'href="/ruang-belajar"');
pageCode = pageCode.replace('href="/bio-builder"', 'href="/ruang-ngonten"');
pageCode = pageCode.replace('href="/content-builder"', 'href="/ruang-growing"');

fs.writeFileSync('src/app/page.tsx', pageCode, 'utf8');
console.log("Successfully rebuilt page.tsx with builder2!");
