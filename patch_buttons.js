const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// Button 1: Send WhatsApp (OrderDetailsContent)
content = content.replace(
  /border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white/g,
  'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
);

// Button 2: Other small buttons (e.g. Save / Approve)
content = content.replace(
  /bg-emerald-500 hover:bg-emerald-600/g,
  'bg-orange-500 hover:bg-orange-600'
);

// Box 4: Email Delivery Tracking (green dot)
content = content.replace(
  /bg-emerald-500 rounded-full border-2 border-white/g,
  'bg-orange-500 rounded-full border-2 border-white'
);
content = content.replace(
  /<span className="font-medium text-emerald-500">Opened<\/span>/g,
  '<span className="font-medium text-orange-500">Opened</span>'
);

// WhatsApp Phone Number link
content = content.replace(
  /text-emerald-500 font-medium hover:underline mt-1/g,
  'text-orange-500 font-medium hover:underline mt-1'
);

// Focus rings
content = content.replace(
  /focus:ring-emerald-500\/50/g,
  'focus:ring-orange-500/50'
);

// Shadows
content = content.replace(
  /shadow-emerald-500\/20/g,
  'shadow-orange-500/20'
);

fs.writeFileSync(path, content);
console.log("Patched buttons!");
