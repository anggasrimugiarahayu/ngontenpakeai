const fs = require('fs');
const path = './src/app/api/midtrans/webhook/route.ts';
let content = fs.readFileSync(path, 'utf8');

const oldWebhookCode = `        } else if (order.orderType === "PRO_BASIC" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_LENGKAP") {
          // For now, any of these packages gives them the "PRO" role
          await tx.user.update({
            where: { id: order.userId },
            data: { role: "PRO" }
          });
        }
      });`;

const newWebhookCode = `        } else if (order.orderType === "PRO_BASIC" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_LENGKAP") {
          // 1. Upgrade to PRO role
          let updateData: any = { role: "PRO" };
          
          // If they bought TOOLS or LENGKAP, give them 30 days of proToolsExpiredAt
          if (order.orderType === "PRO_TOOLS" || order.orderType === "PRO_LENGKAP") {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            updateData.proToolsExpiredAt = expiryDate;
          }

          await tx.user.update({
            where: { id: order.userId },
            data: updateData
          });

          // 2. Unlock bundled E-books from PRICING_PACKAGES config
          const setting = await tx.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
          const pricingConfig = setting?.value ? JSON.parse(setting.value) : null;
          
          if (pricingConfig && pricingConfig[order.orderType] && pricingConfig[order.orderType].bundledProductIds) {
            const bundledIds = pricingConfig[order.orderType].bundledProductIds;
            for (const pid of bundledIds) {
              const existing = await tx.userOwnedProduct.findFirst({
                where: { userId: order.userId, digitalProductId: pid }
              });
              if (!existing) {
                await tx.userOwnedProduct.create({
                  data: {
                    userId: order.userId,
                    digitalProductId: pid
                  }
                });
              }
            }
          }
        }
      });`;

content = content.replace(oldWebhookCode, newWebhookCode);
fs.writeFileSync(path, content);
console.log("Patched webhook.ts");
