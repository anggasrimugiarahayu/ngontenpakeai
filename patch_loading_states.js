const fs = require('fs');

const filesToPatch = [
  'src/app/(app)/dashboard/DashboardClient.tsx',
  'src/app/(app)/pengaturan/SettingsTabs.tsx',
  'src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx',
  'src/app/checkout/CheckoutWrapperClient.tsx',
  'src/app/(app)/bantuan/page.tsx',
  'src/app/(app)/feedback/page.tsx',
];

filesToPatch.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (!content.includes('import LoadingSpinner')) {
      content = content.replace(
        'import { useState } from "react";',
        'import { useState } from "react";\nimport LoadingSpinner from "@/components/ui/LoadingSpinner";'
      );
      content = content.replace(
        'import { useState, useEffect } from "react";',
        'import { useState, useEffect } from "react";\nimport LoadingSpinner from "@/components/ui/LoadingSpinner";'
      );
      content = content.replace(
        'import useSWR from "swr";',
        'import LoadingSpinner from "@/components/ui/LoadingSpinner";\nimport useSWR from "swr";'
      );
    }

    // Dashboard
    content = content.replace(
      /<div className="p-8 text-center animate-pulse">Loading dashboard...<\/div>/g,
      '<LoadingSpinner message="Memuat Dashboard..." />'
    );

    // Pengaturan
    content = content.replace(
      /<div className="p-8 text-center animate-pulse">Loading settings...<\/div>/g,
      '<LoadingSpinner message="Memuat Pengaturan..." />'
    );

    // Ebook detail
    content = content.replace(
      /<div className="p-12 text-center animate-pulse flex flex-col items-center justify-center min-h-\[50vh\]"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"><\/div><p className="text-gray-500">Memuat E-Book...<\/p><\/div>/g,
      '<LoadingSpinner message="Memuat E-Book..." />'
    );

    // Checkout wrapper
    content = content.replace(
      /<div className="flex-1 w-full flex justify-center py-6 px-4 sm:py-8 items-center h-\[50vh\]">\n\s*<div className="flex flex-col items-center gap-4 animate-pulse">\n\s*<div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"><\/div>\n\s*<p className="text-gray-500 font-medium">Menyiapkan pembayaran...<\/p>\n\s*<\/div>\n\s*<\/div>/g,
      '<LoadingSpinner message="Menyiapkan Pembayaran..." />'
    );

    // Bantuan
    content = content.replace(
      /<div className="flex justify-center items-center py-12">\n\s*<Loader2 className="w-8 h-8 animate-spin text-orange-500" \/>\n\s*<\/div>/g,
      '<LoadingSpinner message="Memuat Bantuan..." />'
    );

    // Feedback
    content = content.replace(
      /<div className="flex-1 flex justify-center items-center py-20">\n\s*<Loader2 className="w-8 h-8 animate-spin text-orange-500" \/>\n\s*<\/div>/g,
      '<LoadingSpinner message="Memuat Feedback..." />'
    );

    fs.writeFileSync(file, content);
  }
});

console.log("Patched loading states");
