const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix Reset Bio mobile text
const oldResetBtn = `<Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Reset Bio</span>`;
const newResetBtn = `<Trash2 className="w-4 h-4" /> <span>Reset Bio</span>`;
code = code.replace(oldResetBtn, newResetBtn);

// Fix Simpan button text
const oldSaveBtn = `Selesai & Simpan <CheckCircle2 className="w-4 h-4" />`;
const newSaveBtn = `Simpan <CheckCircle2 className="w-4 h-4" />`;
code = code.replace(oldSaveBtn, newSaveBtn);

fs.writeFileSync(file, code);
