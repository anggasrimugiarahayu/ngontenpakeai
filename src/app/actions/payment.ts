"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { snap } from "@/lib/midtrans";
import { revalidatePath } from "next/cache";

export async function createCheckoutToken(data: { type: "EBOOK" | "PRO_SUBSCRIPTION", productId?: string, redirectUrl?: string }) {
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
    
    // Safety check if it's actually Rp 0, they should just claim it instead of buy it
    if (!product.price || product.price <= 0) {
      throw new Error("Produk ini gratis, silakan gunakan tombol klaim.");
    }
    
    amount = product.price;
    orderName = `Pembelian E-Book: ${product.title}`;
  } else if (data.type === "PRO_SUBSCRIPTION") {
    amount = 99000;
    orderName = "Langganan PRO (1 Bulan)";
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
        id: data.type === "EBOOK" ? data.productId : "PRO_SUBS",
        price: amount,
        quantity: 1,
        name: orderName
      }
    ],
    // Let's set a custom callback or redirect
    callbacks: {
      finish: data.redirectUrl || "https://ngontenpakeai.com/ruang-belajar"
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    
    // Update order with paymentUrl (Token)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentUrl: transaction.redirect_url, // Or just save the token itself if we use Snap.js
        midtransId: transaction.token
      }
    });

    return { token: transaction.token, redirectUrl: transaction.redirect_url };
  } catch (error: any) {
    console.error("Midtrans Error:", error.message);
    throw new Error("Gagal membuat transaksi pembayaran.");
  }
}
