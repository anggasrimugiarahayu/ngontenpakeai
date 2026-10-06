"use server";
import prisma from "@/lib/prisma";

export async function trackProductViewAction(productId: string) {
  if (!productId) return;
  try {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    
    await prisma.productAnalytics.upsert({
      where: {
        digitalProductId_date: {
          digitalProductId: productId,
          date: today
        }
      },
      update: { views: { increment: 1 } },
      create: {
        digitalProductId: productId,
        date: today,
        views: 1,
        clicks: 0
      }
    });
  } catch (e) {
    console.error("Failed to track view", e);
  }
}

export async function trackProductClickAction(productId: string) {
  if (!productId) return;
  try {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    
    await prisma.productAnalytics.upsert({
      where: {
        digitalProductId_date: {
          digitalProductId: productId,
          date: today
        }
      },
      update: { clicks: { increment: 1 } },
      create: {
        digitalProductId: productId,
        date: today,
        views: 0,
        clicks: 1
      }
    });
  } catch (e) {
    console.error("Failed to track click", e);
  }
}
