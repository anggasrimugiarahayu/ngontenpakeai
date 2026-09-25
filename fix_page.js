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
        const match = line.match(/^\d+:\s?(.*)$/);
        if (match) {
            codeLines.push(match[1]);
        }
    }
}

// We know it truncates at line 382 "classNam". We will take up to line 379.
const validLines = codeLines.slice(0, 379);

// Add closing tags for the pricing section, main, and div
validLines.push(
`              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`
);

fs.writeFileSync('src/app/page.tsx', validLines.join('\n'), 'utf8');
console.log('Restored functional page.tsx!');
