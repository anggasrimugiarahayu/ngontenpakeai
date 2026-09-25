const fs = require('fs');
const path = '/Users/anggasrimugiarahayu/.gemini/antigravity-ide/brain/fc7a50e8-6f1e-465a-a977-09f0885c4dce/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'VIEW_FILE' && data.content && data.content.includes('File Path: `file:///Users/anggasrimugiarahayu/Documents/PROJECT/NGONTEN%20PAKAI%20AI/src/app/page.tsx`')) {
            const isTruncated = data.content.includes('Content truncated');
            console.log("View:", data.content.split('\n').slice(0,6).join(' | '), isTruncated ? "TRUNCATED" : "FULL");
        }
    } catch (e) {
    }
}
