import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { coreApi } from "@/lib/midtrans";
import prisma from "@/lib/prisma";
import { calculateSubscriptionFulfillment } from "@/lib/subscription-utils";

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
          const productIdsToGrant = Array.from(new Set([
            ...(order.digitalProductId ? [order.digitalProductId] : []),
            ...(order.addonIds && Array.isArray(order.addonIds) ? (order.addonIds as string[]) : [])
          ])).filter(Boolean);

          if (productIdsToGrant.length > 0) {
            await tx.userOwnedProduct.createMany({
              data: productIdsToGrant.map((pid) => ({
                userId: order.userId,
                digitalProductId: pid
              })),
              skipDuplicates: true
            });
          }
        } else {
          // Dynamic PRO subscription & package fulfillment (4 independent pillars: Ebook, Tools, Automation, Riset)
          const setting = await tx.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } });
          const rawConfig = setting?.value ? JSON.parse(setting.value as string) : null;

          const currentUser = await tx.user.findUnique({
            where: { id: order.userId },
            select: {
              role: true,
              hasProBook: true,
              proToolsExpiredAt: true,
              proAutomationExpiredAt: true,
              proRisetExpiredAt: true,
            },
          });

          const { meta, updateData } = calculateSubscriptionFulfillment({
            orderType: order.orderType,
            currentUser,
            rawPricingConfig: rawConfig,
          });

          await tx.user.update({
            where: { id: order.userId },
            data: updateData,
          });

          // Unlock bundled E-books from PRICING_PACKAGES config + any add-on E-books purchased with the package
          const allGrantIds = Array.from(
            new Set([
              ...(meta.bundledProductIds || []),
              ...(order.addonIds && Array.isArray(order.addonIds) ? (order.addonIds as string[]) : []),
            ])
          ).filter(Boolean);

          if (allGrantIds.length > 0) {
            await tx.userOwnedProduct.createMany({
              data: allGrantIds.map((pid) => ({
                userId: order.userId,
                digitalProductId: pid,
              })),
              skipDuplicates: true,
            });
          }
        }
      });
    } else if (order.status !== "SUCCESS") {
      // Just update status if failed/pending and order was not already completed
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
      revalidatePath("/");
      revalidatePath("/ruang-belajar");
      revalidatePath("/ruang-ngonten");
      revalidatePath("/ruang-riset");
      revalidatePath("/ruang-automation");
      revalidatePath("/pengaturan");
      revalidatePath("/dashboard");
    } catch (e) {
      console.error("Failed to revalidate tags:", e);
    }

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
