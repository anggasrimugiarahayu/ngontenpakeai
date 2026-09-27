const fs = require('fs');
const file = 'prisma/schema.prisma';
let code = fs.readFileSync(file, 'utf8');

// Add back-relation to User model
if (!code.includes('bioBuilders BioBuilder[]')) {
  code = code.replace(/masterBlueprints MasterBlueprint\[\]/, 'masterBlueprints MasterBlueprint[]\n  bioBuilders   BioBuilder[]');
  fs.writeFileSync(file, code);
  console.log("Added BioBuilder relation to User model.");
}
