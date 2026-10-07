const fs = require('fs');
const path = './src/app/api/midtrans/webhook/route.ts';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `        // Grant the Item!
        if (order.orderType === "EBOOK" && order.digitalProductId) {
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
        }`;

const newLogic = `        // Grant the Item!
        if (order.orderType === "EBOOK") {
          const productIdsToGrant = [];
          if (order.digitalProductId) productIdsToGrant.push(order.digitalProductId);
          if (order.addonIds && Array.isArray(order.addonIds)) {
            productIdsToGrant.push(...order.addonIds);
          }

          for (const pid of productIdsToGrant) {
            await tx.userOwnedProduct.upsert({
              where: {
                userId_digitalProductId: {
                  userId: order.userId,
                  digitalProductId: pid
                }
              },
              update: {},
              create: {
                userId: order.userId,
                digitalProductId: pid
              }
            });
          }
        }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(path, content);
console.log("Patched webhook successfully");
