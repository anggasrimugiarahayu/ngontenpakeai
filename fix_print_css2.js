const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const mainReturnRegex = /  return \(\n    <div className="space-y-6">/m;
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
    <div className="space-y-6">`;

code = code.replace(mainReturnRegex, correctInjection);
fs.writeFileSync(file, code);
