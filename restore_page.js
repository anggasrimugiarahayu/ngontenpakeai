const fs = require('fs');

const content = fs.readFileSync('recovered_page.txt', 'utf8');
const lines = content.split('\n');

const codeLines = [];
let isCode = false;

for (const line of lines) {
    if (line.match(/^1: /)) {
        isCode = true;
    }
    
    if (isCode) {
        // Strip the line number and colon: e.g. "123: " -> ""
        const match = line.match(/^\d+:\s?(.*)$/);
        if (match) {
            codeLines.push(match[1]);
        }
    }
}

fs.writeFileSync('src/app/page.tsx', codeLines.join('\n'), 'utf8');
console.log('Restored to src/app/page.tsx!');
