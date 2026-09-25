const fs = require('fs');
const path = '/Users/anggasrimugiarahayu/.gemini/antigravity-ide/brain/fc7a50e8-6f1e-465a-a977-09f0885c4dce/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (const line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'VIEW_FILE' && data.content && data.content.includes('page.tsx')) {
            const match = data.content.match(/Showing lines \d+ to \d+/);
            if (match) console.log(match[0]);
        }
    } catch (e) {
    }
}
