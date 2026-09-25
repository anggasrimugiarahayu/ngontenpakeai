const fs = require('fs');

const path = '/Users/anggasrimugiarahayu/.gemini/antigravity-ide/brain/fc7a50e8-6f1e-465a-a977-09f0885c4dce/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'VIEW_FILE' && data.content && data.content.includes('page.tsx')) {
            if (data.content.includes('Total Lines: 494')) {
               console.log("FOUND VIEW FILE with 494 lines!");
               // extract the code 
               // the content usually starts with "Created At... File Path... Total Lines... Showing lines... \n<line_number>: <original_line>"
               fs.writeFileSync('page_extracted.txt', data.content, 'utf8');
            }
        }
    } catch (e) {
    }
}
