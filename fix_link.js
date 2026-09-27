const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /import \{ useTheme \} from "next-themes";/,
  'import { useTheme } from "next-themes";\nimport Link from "next/link";'
);
fs.writeFileSync(file, code);
