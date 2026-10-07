const fs = require('fs');
const path = './src/app/(app)/pengaturan/PricingConfigSection.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'import { Save, CheckCircle2, Edit, Package, Wrench, Gem, Check, X, Plus } from "lucide-react";',
  'import { Save, CheckCircle2, Edit, Package, Wrench, Gem, Check, X, Plus, BookOpen } from "lucide-react";'
);

fs.writeFileSync(path, content);
