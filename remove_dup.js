const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const dupInject = `  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        autoSave(id, selectedBio, suggestions, result);
      };
      reader.readAsDataURL(file);
    }
  };`;

code = code.replace(dupInject, '');
fs.writeFileSync(file, code);
