const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetOld = `<Link href="/ruang-ngonten">
                  <button className="px-6 py-2.5 rounded-xl font-bold text-sm bg-rn-accent hover:bg-orange-600 text-white flex items-center gap-2 transition-colors shadow-lg shadow-rn-accent/20">
                    Simpan <CheckCircle2 className="w-4 h-4" />
                  </button>
                </Link>`;

const targetNew = `<button 
                  onClick={() => {
                    autoSave(id, selectedBio, suggestions, avatarUrl);
                    showToast("Bio berhasil disimpan!", "success");
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-rn-accent hover:bg-orange-600 text-white flex items-center gap-2 transition-colors shadow-lg shadow-rn-accent/20"
                >
                  Simpan <CheckCircle2 className="w-4 h-4" />
                </button>`;

code = code.replace(targetOld, targetNew);
fs.writeFileSync(file, code);
