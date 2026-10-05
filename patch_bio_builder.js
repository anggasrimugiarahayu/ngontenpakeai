const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('getBioBuilderAction')) {
  content = content.replace(
    'import { getBlueprintAction } from "@/app/actions/blueprint";',
    'import { getBlueprintAction } from "@/app/actions/blueprint";\nimport { getBioBuilderAction } from "@/app/actions/toolsData";'
  );
}

// Replace initialData variables with Swr response
content = content.replace(
  'export default function BioBuilderClient() {',
  `export default function BioBuilderClient() {
  const { data: initialData } = useSWR("bioBuilder", getBioBuilderAction);`
);

fs.writeFileSync(path, content);
console.log("Patched BioBuilderClient");
