const fs = require('fs');
const path = './src/app/api/midtrans/webhook/route.ts';
let content = fs.readFileSync(path, 'utf8');

const ebookRegex = /if \(order\.orderType === "EBOOK" && order\.digitalProductId\) \{[\s\S]*?\}\n        \}/;
const ebookReplace = `if (order.orderType === "EBOOK" && order.digitalProductId) {
          await tx.userOwnedProduct.upsert({
            where: {
              userId_digitalProductId: {
                userId: order.userId,
                digitalProductId: order.digitalProductId
              }
            },
            update: {},
            create: {
              userId: order.userId,
              digitalProductId: order.digitalProductId
            }
          });
        }
        
        // Grant addons if any
        if (order.addonIds && Array.isArray(order.addonIds) && order.addonIds.length > 0) {
          for (const addonId of order.addonIds) {
            await tx.userOwnedProduct.upsert({
              where: {
                userId_digitalProductId: {
                  userId: order.userId,
                  digitalProductId: addonId
                }
              },
              update: {},
              create: {
                userId: order.userId,
                digitalProductId: addonId
              }
            });
          }
        }`;
content = content.replace(ebookRegex, ebookReplace);

fs.writeFileSync(path, content);
console.log("Patched webhook.ts for addons!");
