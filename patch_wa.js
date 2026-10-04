const fs = require('fs');
const file = 'src/app/dashboard/DashboardClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Import WhatsAppModal
if (!code.includes('import WhatsAppModal')) {
  code = code.replace(
    `import PrintModal from './PrintModal';`,
    `import PrintModal from './PrintModal';\nimport WhatsAppModal from './WhatsAppModal';`
  );
}

// 2. Add state
const stateHook = `const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);`;
const newState = `const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waMessage, setWaMessage] = useState('');
  const [waOrder, setWaOrder] = useState<any>(null);`;
code = code.replace(stateHook, newState);

// 3. Update the WA Button inside OrderDetailsContent
// We can use a regex or string replace.
// Old button block:
/*
              <button 
                onClick={() => window.open(waUrl, '_blank')}
                className="w-full py-3 mb-6 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-colors">
                Send Follow Up Text via WhatsApp
              </button>
*/

const oldWaLogic = `const paymentDate = new Date(orderDate.getTime() + 2 * 60000);
      
      const whatsappMsg = \`Halo kak \${order.user?.name || ''}, terima kasih sudah memesan \${order.product?.title || 'Produk'}.\`;
      const waUrl = \`https://wa.me/6285156339329?text=\${encodeURIComponent(whatsappMsg)}\`;`;

const newWaLogic = `const paymentDate = new Date(orderDate.getTime() + 2 * 60000);`;
code = code.replace(oldWaLogic, newWaLogic);

const oldBtn = `<button 
                onClick={() => window.open(waUrl, '_blank')}
                className="w-full py-3 mb-6 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-colors">
                Send Follow Up Text via WhatsApp
              </button>`;

const newBtn = `<button 
                onClick={() => {
                  const name = order.user?.name || 'Kak';
                  const product = order.product?.title || 'Produk';
                  setWaMessage(\`Halo \${name},\\n\\nTerima kasih sudah memesan *\${product}*.\\n\\nApakah ada yang bisa kami bantu terkait pesanan ini?\`);
                  setWaOrder(order);
                  setIsWaModalOpen(true);
                }}
                className="w-full py-3 mb-6 border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold transition-colors">
                Send Follow Up Text via WhatsApp
              </button>`;

code = code.replace(oldBtn, newBtn);

// 4. Add the component at the bottom
const oldModal = `<PrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        order={selectedOrder} 
      />`;

const newModal = `<PrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        order={selectedOrder} 
      />

      <WhatsAppModal 
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
        order={waOrder}
        message={waMessage}
        setMessage={setWaMessage}
      />`;
code = code.replace(oldModal, newModal);

fs.writeFileSync(file, code);
console.log("Patched WA Button!");
