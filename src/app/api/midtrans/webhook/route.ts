import { NextRequest, NextResponse } from "next/server";
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
        } else if (order.orderType === "PRO_BASIC" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_LENGKAP") {
          // For now, any of these packages gives them the "PRO" role
          await tx.user.update({
            where: { id: order.userId },
            data: { role: "PRO" }
          });
        }
      });
    } else {
      // Just update status if failed/pending
      await prisma.order.update({
        where: { id: orderId },
        data: { status: finalStatus }
      });
    }

    return NextResponse.json({ success: true, status: finalStatus });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
