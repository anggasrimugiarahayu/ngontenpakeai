"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { snap } from "@/lib/midtrans";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { coreApi } from "@/lib/midtrans";

export async function createCheckoutToken(data: { type: "EBOOK" | "PRO_BASIC" | "PRO_TOOLS" | "PRO_LENGKAP", productId?: string, redirectUrl?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  let amount = 0;
  let orderName = "";
  
  if (data.type === "EBOOK") {
    if (!data.productId) throw new Error("Product ID required for Ebook");
    const product = await prisma.digitalProduct.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error("Product not found");
    
    if (!product.price || product.price <= 0) {
      throw new Error("Produk ini gratis, silakan gunakan tombol klaim.");
    }
    
    amount = product.price;
    orderName = `Pembelian E-Book: ${product.title}`;
  } else if (data.type === "PRO_BASIC") {
    amount = 99000;
    orderName = "Paket Basic (Ebook)";
  } else if (data.type === "PRO_TOOLS") {
    amount = 99000;
    orderName = "Paket Sistem Tools";
  } else if (data.type === "PRO_LENGKAP") {
    amount = 149000;
    orderName = "Paket Lengkap (Ebook + Tools)";
  }

  // Create an Order in DB
  const order = await prisma.order.create({
    data: {
      userId,
      digitalProductId: data.type === "EBOOK" ? data.productId : null,
      orderType: data.type,
      amount,
      status: "PENDING",
    }
  });

  // Call Midtrans SNAP API
  if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY === 'SB-Mid-server-YOUR_SERVER_KEY') {
    throw new Error("Midtrans Server Key belum disetel di .env. Silakan tambahkan MIDTRANS_SERVER_KEY.");
  }
  
  const parameter = {
    transaction_details: {
      order_id: order.id,
      gross_amount: amount
    },
    customer_details: {
      first_name: user.name || "Customer",
      email: user.email,
    },
    item_details: [
      {
        id: data.type === "EBOOK" ? data.productId : data.type,
        price: amount,
        quantity: 1,
        name: orderName
      }
    ],
    callbacks: {
      finish: data.redirectUrl || ((await headers()).get("host")?.includes("localhost") ? "http://localhost:3000/ruang-belajar" : "https://ngontenpakeai.com/ruang-belajar")
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentUrl: transaction.redirect_url,
        midtransId: transaction.token
      }
    });

    return { token: transaction.token, redirectUrl: transaction.redirect_url };
  } catch (error: any) {
    console.error("Midtrans Error:", error.message);
    throw new Error(`Gagal membuat transaksi: ${error.message}`);
  }
}

export async function verifyPayment(orderId: string) {
  try {
    const statusResponse = await coreApi.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let finalStatus = "PENDING";
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") finalStatus = "PENDING";
      else if (fraudStatus === "accept") finalStatus = "SUCCESS";
    } else if (transactionStatus === "settlement") {
      finalStatus = "SUCCESS";
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
      finalStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      finalStatus = "PENDING";
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false };

    if (order.status !== "SUCCESS" && finalStatus === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: orderId }, data: { status: "SUCCESS" } });

        if (order.orderType === "EBOOK" && order.digitalProductId) {
          await tx.userOwnedProduct.upsert({
            where: { userId_digitalProductId: { userId: order.userId, digitalProductId: order.digitalProductId } },
            update: {},
            create: { userId: order.userId, digitalProductId: order.digitalProductId }
          });
        } else if (order.orderType === "PRO_BASIC" || order.orderType === "PRO_TOOLS" || order.orderType === "PRO_LENGKAP") {
          await tx.user.update({ where: { id: order.userId }, data: { role: "PRO" } });
        }
      });
      
      return { success: true, status: finalStatus, justUpdated: true };
    }
    
    return { success: true, status: order.status, justUpdated: false };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false };
  }
}
