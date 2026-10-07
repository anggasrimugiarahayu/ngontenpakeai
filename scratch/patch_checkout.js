const fs = require('fs');
const path = './src/app/actions/checkout.ts';
let content = fs.readFileSync(path, 'utf8');

// We need to inject the fetch for PRICING_PACKAGES.
// Right now it says:
//   } else if (type === "PRO_BASIC") {
//     baseAmount = 99000;
//     itemName = "Ruang Ngonten Faceless (PRO Basic)";
//     itemDescription = "Akses modul dasar, tanpa AI tools.";
//   } else if (type === "PRO_TOOLS") {

const oldCheckoutCode = `  } else if (type === "PRO_BASIC") {
    baseAmount = 99000;
    itemName = "Ruang Ngonten Faceless (PRO Basic)";
    itemDescription = "Akses modul dasar, tanpa AI tools.";
  } else if (type === "PRO_TOOLS") {
    baseAmount = 99000;
    itemName = "Sistem Tools AI (PRO Tools)";
    itemDescription = "Akses sistem prompt AI khusus untuk ngonten.";
  } else if (type === "PRO_LENGKAP") {
    baseAmount = 149000;
    itemName = "Paket Lengkap (Modul + Tools)";
    itemDescription = "Akses seluruh modul dan sistem tools AI.";
  } else {`;

const newCheckoutCode = `  } else if (type === "PRO_BASIC" || type === "PRO_TOOLS" || type === "PRO_LENGKAP") {
    const setting = await prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
    const pricingConfig = setting?.value ? JSON.parse(setting.value) : null;
    
    if (pricingConfig && pricingConfig[type]) {
      baseAmount = pricingConfig[type].price;
      itemName = pricingConfig[type].name;
      itemDescription = pricingConfig[type].desc;
    } else {
      // Fallback defaults
      if (type === "PRO_BASIC") {
        baseAmount = 99000; itemName = "Paket Basic (Ebook)"; itemDescription = "Cocok buat yang mau fokus belajar teori faceless creator.";
      } else if (type === "PRO_TOOLS") {
        baseAmount = 99000; itemName = "Paket Sistem Tools"; itemDescription = "Cocok buat yang butuh bantuan AI untuk eksekusi ngonten.";
      } else if (type === "PRO_LENGKAP") {
        baseAmount = 149000; itemName = "Paket Lengkap (Ebook)"; itemDescription = "Bonus terbanyak, akses jualan (PLR) dan Lifetime support.";
      }
    }
  } else {`;

content = content.replace(oldCheckoutCode, newCheckoutCode);
fs.writeFileSync(path, content);
console.log("Patched checkout.ts");
