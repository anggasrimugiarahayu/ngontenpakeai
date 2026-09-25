const fs = require('fs');
const path = '/Users/anggasrimugiarahayu/.gemini/antigravity-ide/brain/fc7a50e8-6f1e-465a-a977-09f0885c4dce/.system_generated/logs/transcript_full.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n');

let latestView = "";
let latestViewLines = 0;

for (const line of lines) {
    if (!line) continue;
    try {
        const data = JSON.parse(line);
        if (data.type === 'VIEW_FILE' && data.content && data.content.includes('File Path: `file:///Users/anggasrimugiarahayu/Documents/PROJECT/NGONTEN%20PAKAI%20AI/src/app/page.tsx`')) {
            const match = data.content.match(/Showing lines 1 to (\d+)/);
            if (match) {
                const linesCount = parseInt(match[1]);
                if (linesCount > 400 && linesCount < 600) { // Should be around 494 or 563
                    latestView = data.content;
                }
            }
        }
    } catch (e) {
    }
}

if (latestView) {
    fs.writeFileSync('recovered_page.txt', latestView, 'utf8');
    console.log(`Recovered a view!`);
} else {
    console.log("No full view found.");
}
