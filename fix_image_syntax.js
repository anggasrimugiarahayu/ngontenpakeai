const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

const badCode = `                            </div>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col justify-start">`;

const fixedCode = `                            </div>
                            <div className="flex-1 flex flex-col justify-start">`;

code = code.replace(badCode, fixedCode);
fs.writeFileSync(file, code);
console.log("Fixed image syntax");
