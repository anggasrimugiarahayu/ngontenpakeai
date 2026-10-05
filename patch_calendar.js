const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/content-calendar/ContentCalendarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add import
if (!content.includes('getContentCalendarAction')) {
  content = content.replace(
    'import { getBlueprintAction } from "@/app/actions/blueprint";',
    'import { getBlueprintAction } from "@/app/actions/blueprint";\nimport { getContentCalendarAction } from "@/app/actions/toolsData";'
  );
}

// Add SWR hook
content = content.replace(
  'export default function ContentCalendarClient() {',
  `export default function ContentCalendarClient() {\n  const { data: initialData } = useSWR("contentCalendar", getContentCalendarAction);`
);

// Add useEffect to sync state
const useEffectHook = `
  useEffect(() => {
    if (initialData) {
      setCalendarData(initialData);
    }
  }, [initialData]);
`;

content = content.replace(
  '// Agenda Modal States',
  useEffectHook + '\n  // Agenda Modal States'
);

fs.writeFileSync(path, content);
console.log("Patched ContentCalendarClient");
