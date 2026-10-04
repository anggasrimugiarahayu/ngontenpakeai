const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `return (
      <style jsx global>{\`
        @media print {`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, `return (
      <>
      <style jsx global>{\`
        @media print {`);
        
  // Now we need to find the matching closing tag for return (
  // The structure is:
  // return (
  //   <>
  //   <style>...</style>
  //   <div className="flex flex-col space-y-4 lg:hidden">...
  //   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">...
  //   </>
  // );
  
  // To avoid complex AST parsing, let's just find the exact string that closes the renderOrdersTab return
  const closingStr = `          {/* Right Column: Order Details (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-[#121214] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden h-full">
              <OrderDetailsContent order={selectedOrder} />
            </div>
          </div>
        </div>
      </> // We will add this
    );
  };`;
  
  // Wait, let's use regex to find the end of the return statement for renderOrdersTab.
  // The end is:
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   };
  // 
  //   return ( // This is the main component return
  const endRegex = /          <\/div>\n        <\/div>\n      \);\n    };\n/m;
  code = code.replace(endRegex, `          </div>\n        </div>\n      </>\n      );\n    };\n`);
  
  fs.writeFileSync(file, code);
  console.log("Fixed syntax");
} else {
  console.log("Could not find target string to fix");
}
