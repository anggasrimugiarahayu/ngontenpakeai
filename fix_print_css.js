const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Remove the bad injection completely
const badInjectionRegex = /      <>\n      <style jsx global>\{`\n        @media print \{[\s\S]*?`\}<\/style>\n      /;
code = code.replace(badInjectionRegex, '');

// Also remove the </>\n      );\n    };\n that we added to close it!
// Oh wait, the closing tag we added was:
//           </div>\n        </div>\n      </>\n      );\n    };\n
// It replaced:
//           </div>\n        </div>\n      );\n    };\n
const badClosingRegex = /          <\/div>\n        <\/div>\n      <\/>\n      \);\n    };\n/;
code = code.replace(badClosingRegex, '          </div>\n        </div>\n      );\n    };\n');

// Wait, let's just make a very specific replace to clean up the !order block:
// Currently it is:
//       if (!order) return (
//         <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
//           <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
//           <p>Pilih transaksi untuk melihat detail</p>
//         </div>
//       );
// Let's reset the !order block perfectly:
const noOrderRegex = /if \(!order\) return \([\s\S]*?Pilih transaksi untuk melihat detail<\/p>\n        <\/div>\n      \);/m;
code = code.replace(noOrderRegex, `if (!order) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10">
          <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
          <p>Pilih transaksi untuk melihat detail</p>
        </div>
      );`);
      
// Now inject the print CSS correctly at the main component's return
const mainReturnRegex = /  return \(\n    <div className="min-h-screen/m;
const correctInjection = `  return (
    <>
      <style jsx global>{\`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\\\:hidden {
            display: none !important;
          }
          .print\\\\:block {
            display: block !important;
          }
        }
      \`}</style>
    <div className="min-h-screen`;

code = code.replace(mainReturnRegex, correctInjection);

// And we must add </> to the end of the component
// The end is:
//     </div>
//   );
// }
const endComponentRegex = /    <\/div>\n  \);\n\}\n?$/m;
code = code.replace(endComponentRegex, `    </div>\n    </>\n  );\n}`);

fs.writeFileSync(file, code);
console.log("Fixed!");
