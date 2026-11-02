"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export interface AppNotification {
  id: string;
  type: "ORDER_CREATED" | "PAYMENT_SUCCESS" | "NEW_PRODUCT" | "ORDER_STATUS";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  meta?: {
    orderId?: string;
    amount?: number;
    status?: string;
    productTitle?: string;
    customerName?: string;
  };
}

export async function getNotificationsAction(): Promise<{
  success: boolean;
  isAdmin: boolean;
  notifications: AppNotification[];
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: true, isAdmin: false, notifications: [] };
    }

    const isAdmin =
      isAdminEmail(session.user.email) ||
      (session.user as any).role === "ADMIN";

    if (isAdmin) {
      // ADMIN NOTIFICATIONS: Track new orders and purchases
      const recentOrders = await prisma.order.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          product: {
            select: { id: true, title: true, slug: true },
          },
        },
      });

      const notifications: AppNotification[] = recentOrders.map((order) => {
        const customerName =
          order.user?.name || order.user?.email || "Pelanggan";
        const productTitle =
          order.product?.title ||
          (order.orderType === "PRO_SUBSCRIPTION"
            ? "Langganan PRO"
            : "Produk Digital");
        const formattedAmount = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(order.amount);

        if (order.status === "SUCCESS") {
          return {
            id: `admin-order-success-${order.id}`,
            type: "PAYMENT_SUCCESS",
            title: "Pesanan Berhasil / Lunas 💰",
            message: `${customerName} berhasil membeli ${productTitle} senilai ${formattedAmount}.`,
            timestamp: order.updatedAt
              ? order.updatedAt.toISOString()
              : order.createdAt.toISOString(),
            link: "/dashboard",
            meta: {
              orderId: order.id,
              amount: order.amount,
              status: order.status,
              productTitle,
              customerName,
            },
          };
        } else if (order.status === "PENDING") {
          return {
            id: `admin-order-pending-${order.id}`,
            type: "ORDER_CREATED",
            title: "Pesanan Baru Masuk 🛒",
            message: `${customerName} membuat pesanan ${productTitle} (${formattedAmount}) - Menunggu Pembayaran.`,
            timestamp: order.createdAt.toISOString(),
            link: "/dashboard",
            meta: {
              orderId: order.id,
              amount: order.amount,
              status: order.status,
              productTitle,
              customerName,
            },
          };
        } else {
          return {
            id: `admin-order-failed-${order.id}`,
            type: "ORDER_STATUS",
            title: "Pesanan Dibatalkan / Gagal",
            message: `Pesanan ${productTitle} dari ${customerName} tidak diselesaikan.`,
            timestamp: order.createdAt.toISOString(),
            link: "/dashboard",
            meta: {
              orderId: order.id,
              amount: order.amount,
              status: order.status,
              productTitle,
              customerName,
            },
          };
        }
      });

      return { success: true, isAdmin: true, notifications };
    } else {
      // REGULAR USER NOTIFICATIONS:
      // 1. User's payment confirmations and order status
      // 2. New product releases
      const [userOrders, newProducts] = await Promise.all([
        prisma.order.findMany({
          where: { userId: session.user.id },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            product: {
              select: { id: true, title: true, slug: true },
            },
          },
        }),
        prisma.digitalProduct.findMany({
          where: { isActive: true },
          take: 6,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            createdAt: true,
          },
        }),
      ]);

      const orderNotifs: AppNotification[] = [];
      for (const order of userOrders) {
        const productTitle =
          order.product?.title ||
          (order.orderType === "PRO_SUBSCRIPTION"
            ? "Langganan PRO"
            : "Produk Digital");

        if (order.status === "SUCCESS") {
          orderNotifs.push({
            id: `user-order-success-${order.id}`,
            type: "PAYMENT_SUCCESS",
            title: "Pembayaran Anda Berhasil! 🎉",
            message: `Pembayaran ${productTitle} telah sukses dikonfirmasi. Materi siap diakses sekarang.`,
            timestamp: order.updatedAt
              ? order.updatedAt.toISOString()
              : order.createdAt.toISOString(),
            link: order.product?.slug
              ? `/ruang-belajar/${order.product.slug}`
              : `/ruang-belajar`,
            meta: {
              orderId: order.id,
              productTitle,
              status: order.status,
            },
          });
        } else if (order.status === "PENDING") {
          orderNotifs.push({
            id: `user-order-pending-${order.id}`,
            type: "ORDER_STATUS",
            title: "Menunggu Pembayaran ⏳",
            message: `Pesanan ${productTitle} Anda sedang menunggu pembayaran. Selesaikan untuk mulai akses materi.`,
            timestamp: order.createdAt.toISOString(),
            link: order.paymentUrl || "/checkout",
            meta: {
              orderId: order.id,
              productTitle,
              status: order.status,
            },
          });
        }
      }

      const productNotifs: AppNotification[] = newProducts.map((product) => ({
        id: `user-product-${product.id}`,
        type: "NEW_PRODUCT",
        title: "Produk Baru Tersedia",
        message: `"${product.title}" telah dirilis di Ruang Belajar. Pelajari materi terbarunya sekarang!`,
        timestamp: product.createdAt.toISOString(),
        link: `/ruang-belajar/${product.slug}`,
        meta: {
          productTitle: product.title,
        },
      }));

      // Combine and sort by newest first
      const combined = [...orderNotifs, ...productNotifs].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        success: true,
        isAdmin: false,
        notifications: combined.slice(0, 20),
      };
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, isAdmin: false, notifications: [] };
  }
}
