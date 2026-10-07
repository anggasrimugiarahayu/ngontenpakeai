const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { PricingConfigSection }')) {
  content = content.replace(
    'import { Plus, Trash2, Edit, BookOpen, Tag, X, Star, Ticket } from "lucide-react";',
    'import { Plus, Trash2, Edit, BookOpen, Tag, X, Star, Ticket } from "lucide-react";\nimport { PricingConfigSection } from "./PricingConfigSection";'
  );
  fs.writeFileSync(path, content);
  console.log("Fixed import");
} else {
  console.log("Import already exists");
}
