import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { coreApi } from "@/lib/midtrans";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate signature & status using midtrans-client
    const statusResponse = await coreApi.transaction.notification(body);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let finalStatus = "PENDING";

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        finalStatus = "PENDING";
      } else if (fraudStatus === "accept") {
        finalStatus = "SUCCESS";
      }
    } else if (transactionStatus === "settlement") {
      finalStatus = "SUCCESS";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      finalStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      finalStatus = "PENDING";
    }

    // Find Order
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only process if it was pending and became success
    if (order.status !== "SUCCESS" && finalStatus === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: { status: "SUCCESS" }
        });

        // Grant the Item!
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
        } else if (order.orderType === "PRO_BOOK" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_PLUS") {
          // 1. Upgrade to PRO role
          let updateData: any = { role: "PRO" };
          
          // If they bought TOOLS or LENGKAP, give them 30 days of proToolsExpiredAt
          if (order.orderType === "PRO_TOOLS" || order.orderType === "PRO_PLUS") {
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
      });
    } else {
      // Just update status if failed/pending
      await prisma.order.update({
        where: { id: orderId },
        data: { status: finalStatus }
      });
    }

    try {
      revalidateTag("admin-dashboard-stats", "default");
      revalidateTag("global-stats", "default");
      revalidateTag("user-ownership", "default");
      revalidateTag("user-orders", "default");
      revalidateTag("user-session", "default");
    } catch (e) {
      console.error("Failed to revalidate tags:", e);
    }

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
