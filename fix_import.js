const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import { useState } from "react";\\\\nimport { mutate } from "swr";',
  'import { useState } from "react";\\nimport { mutate } from "swr";'
);

fs.writeFileSync(path, content);
console.log("Import fixed");
