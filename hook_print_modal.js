const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Import PrintModal
if (!code.includes('import PrintModal')) {
  code = code.replace(/import \{ format, subDays, eachDayOfInterval \} from 'date-fns';/, "import { format, subDays, eachDayOfInterval } from 'date-fns';\nimport PrintModal from './PrintModal';");
}

// 2. Add state
if (!code.includes('const [isPrintModalOpen, setIsPrintModalOpen]')) {
  code = code.replace(/const \[isMobileModalOpen, setIsMobileModalOpen\] = useState\(false\);/, "const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);\n  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);");
}

// 3. Change Print button onClick
code = code.replace(/onClick=\{\(\) => window\.print\(\)\}/g, "onClick={() => setIsPrintModalOpen(true)}");

// 4. Render PrintModal at the end of the component
const endOfComponent = /      \{activeTab === 'orders' && renderOrdersTab\(\)\}\n\n    <\/div>\n    <\/>\n  \);\n\}/;
code = code.replace(endOfComponent, `      {activeTab === 'orders' && renderOrdersTab()}

      <PrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        order={selectedOrder} 
      />
    </div>
    </>
  );
}`);

fs.writeFileSync(file, code);
console.log("Hooked up PrintModal");
