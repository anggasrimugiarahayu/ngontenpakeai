const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/RuangBelajarClient.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import LoadingSpinner')) {
  content = content.replace(
    'import { BookOpen, Star, Loader2 } from "lucide-react";',
    'import { BookOpen, Star, Loader2 } from "lucide-react";\nimport LoadingSpinner from "@/components/ui/LoadingSpinner";'
  );
}

content = content.replace(
  /if \(!data\) \{\n\s*return \(\n\s*<div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">\n\s*<div className="mb-10 text-center max-w-2xl mx-auto">\n\s*<h1 className="text-3xl font-bold mb-3 font-heading text-gray-900 dark:text-white">Mau mulai belajar dari mana\?<\/h1>\n\s*<p className="text-\[15px\] leading-relaxed text-gray-600 dark:text-gray-400">\n\s*Temukan E-book, strategi, dan blueprint premium untuk membangun fondasi bisnis kontenmu\.\n\s*<\/p>\n\s*<\/div>\n\s*<\/div>\n\s*\);\n\s*\}/g,
  `if (isLoading || !data) {
    return (
      <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-3 font-heading text-gray-900 dark:text-white">Mau mulai belajar dari mana?</h1>
          <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">
            Temukan E-book, strategi, dan blueprint premium untuk membangun fondasi bisnis kontenmu.
          </p>
        </div>
        <LoadingSpinner message="Memuat Katalog E-Book..." />
      </div>
    );
  }`
);

fs.writeFileSync(path, content);
console.log("Patched RuangBelajarClient for LoadingSpinner");
