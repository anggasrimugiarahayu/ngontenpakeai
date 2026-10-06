const fs = require('fs');
const path = './src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/  import\("react"\)\.then\(\(React\) => \{\n    React\.useEffect\(\(\) => \{\n      if \(data && !data\.notFound && data\.ebook\?\.id\) \{\n        trackProductViewAction\(data\.ebook\.id\);\n      \}\n    \}, \[data\?\.ebook\?\.id\]\);\n  \}\);\n\n/g, '');
fs.writeFileSync(path, content);
