const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// For createProduct (find await createProduct to the closing brace)
const createMatch = content.match(/await createProduct\(\{(.*?)\}\);/s);
if (createMatch) {
  let inner = createMatch[1];
  // Filter out duplicate lines
  let lines = inner.split('\\n');
  let seen = new Set();
  let cleanLines = [];
  for (let line of lines) {
    let trimLine = line.trim();
    if (!trimLine) {
      cleanLines.push(line);
      continue;
    }
    let key = trimLine.split(':')[0].trim();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    cleanLines.push(line);
  }
  content = content.replace(createMatch[1], cleanLines.join('\\n'));
}

// For updateProduct
const updateMatch = content.match(/await updateProduct\\(editingProduct\\.id, \\{(.*?)\\}\\);/s);
if (updateMatch) {
  let inner = updateMatch[1];
  let lines = inner.split('\\n');
  let seen = new Set();
  let cleanLines = [];
  for (let line of lines) {
    let trimLine = line.trim();
    if (!trimLine) {
      cleanLines.push(line);
      continue;
    }
    let key = trimLine.split(':')[0].trim();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    cleanLines.push(line);
  }
  content = content.replace(updateMatch[1], cleanLines.join('\\n'));
}

fs.writeFileSync(path, content);
console.log("Cleaned up duplicates");
