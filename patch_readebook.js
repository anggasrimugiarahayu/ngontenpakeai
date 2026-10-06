const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('trackProductViewAction')) {
  // Add import
  content = content.replace(
    /import \{ getCheckoutDetailsAction \} from "@\/app\/actions\/checkout";/,
    `import { getCheckoutDetailsAction } from "@/app/actions/checkout";\nimport { trackProductViewAction, trackProductClickAction } from "@/app/actions/analytics";`
  );

  // Add useEffect inside component
  content = content.replace(
    /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
    `const [isSubmitting, setIsSubmitting] = useState(false);\n\n  import("react").then((React) => {\n    React.useEffect(() => {\n      if (data && !data.notFound && data.ebook?.id) {\n        trackProductViewAction(data.ebook.id);\n      }\n    }, [data?.ebook?.id]);\n  });`
  );
  
  // Actually, React is not directly imported from 'react' in scope sometimes, wait! There is `import { useState } from "react";`.
  // So I can just do:
  content = content.replace(
    /import \{ useState \} from "react";/,
    `import { useState, useEffect } from "react";`
  );
  
  content = content.replace(
    /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
    `const [isSubmitting, setIsSubmitting] = useState(false);\n\n  useEffect(() => {\n    if (data && !data.notFound && data.ebook?.id) {\n      trackProductViewAction(data.ebook.id);\n    }\n  }, [data?.ebook?.id]);`
  );

  // Add onClick to Beli link
  content = content.replace(
    /className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">\n\s*Beli Satuan/g,
    `onClick={() => trackProductClickAction(ebook.id)}\n                                 className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg">\n                                   Beli Satuan`
  );

  fs.writeFileSync(path, content);
  console.log("Patched ReadEbookClient!");
}
