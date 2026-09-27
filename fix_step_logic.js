const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetOld = 'const [step, setStep] = useState(1);';
const targetNew = `const [step, setStep] = useState(() => {
    if (initialData?.profileName) return 3;
    if (initialData?.username) return 2;
    return 1;
  });`;

code = code.replace(targetOld, targetNew);
fs.writeFileSync(file, code);
