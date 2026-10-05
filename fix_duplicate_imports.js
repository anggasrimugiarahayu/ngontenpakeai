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
    
    // Split into lines
    const lines = content.split('\n');
    const newLines = [];
    let spinnerImported = false;
    
    for (const line of lines) {
      if (line.includes('import LoadingSpinner')) {
        if (!spinnerImported) {
          newLines.push(line);
          spinnerImported = true;
        }
      } else {
        newLines.push(line);
      }
    }

    fs.writeFileSync(file, newLines.join('\n'));
  }
});
console.log("Fixed duplicate imports");
