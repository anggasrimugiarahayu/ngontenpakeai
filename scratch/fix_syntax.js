const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// The incorrect replacement at line 240 was:
// </div>
//              );
//            })}
// We change it back to </div>\n                </div>\n              ))}
// Actually, let's just see exactly what's at 235-245.
//                   </div>
//                 </div>
//               );
//             })}
// We need to change `);\n            })}` back to `))}`.
content = content.replace(
  /<\/div>\n\s*\);\n\s*\}\)\}/,
  `</div>\n              ))}`
);

// Now for line 442, which is currently `))}`.
// We need to change the one after the products map.
// Let's find products map:
// `{products.map((prod: any) => {`
// and then the first `))}` after it.
const prodStart = content.indexOf('{products.map((prod: any) => {');
const endIdx = content.indexOf('))}', prodStart);
if (endIdx !== -1) {
  content = content.substring(0, endIdx) + ');\n            })}' + content.substring(endIdx + 3);
}

fs.writeFileSync(path, content);
console.log("Fixed syntax");
