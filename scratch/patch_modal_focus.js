const fs = require('fs');
const path = './src/app/(app)/pengaturan/PricingConfigSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the component definition
content = content.replace(
  'const ModalForm = () => {',
  'const renderModal = () => {'
);

// Replace the component usage
content = content.replace(
  '<ModalForm />',
  '{renderModal()}'
);

fs.writeFileSync(path, content);
console.log("Patched PricingConfigSection.tsx to fix focus issue.");
