"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { attachComputedBuyerCounts } from "@/lib/product-buyers";
import { attachLightweightCovers } from "@/lib/ebook-covers";
import { deletePhysicalUploadFile } from "@/lib/server-uploads";
import { HomepageCardConfig } from "@/lib/homepage-cards";
import { getCachedHomepageCards } from "@/lib/cache";
import { getYoutubeVideoId, parseYouTubeIsoDuration } from "@/lib/youtube-utils";
import { isAdminEmail } from "@/lib/admin";
import {
  RISET_CONFIG_KEY,
  InstagramRisetConfig,
  getResolvedRisetConfig,
  updateInstagramSessionStatus,
} from "@/lib/riset-config";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  if (isAdminEmail(session.user.email)) {
    return;
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
}

function safeRevalidateTag(tag: string) {
  try {
    (revalidateTag as any)(tag);
  } catch {}
  try {
    (revalidateTag as any)(tag, "default");
  } catch {}
}

function revalidateAdminConfig() {
  safeRevalidateTag("admin-config");
  safeRevalidateTag("features");
  try {
    revalidatePath("/", "layout");
  } catch {}
  try {
    revalidatePath("/pengaturan");
  } catch {}
  try {
    revalidatePath("/ruang-ngonten");
  } catch {}
}

function revalidateEbookCatalog(slug?: string) {
  safeRevalidateTag("ebook-catalog");
  safeRevalidateTag("admin-config");
  try {
    revalidatePath("/ruang-belajar");
  } catch {}
  if (slug) {
    try {
      revalidatePath(`/ruang-belajar/${slug}`);
    } catch {}
  }
  try {
    revalidatePath("/pengaturan");
  } catch {}
}

// 1. Models AI
export async function getAiModels() {
  await assertAdmin();
  return await prisma.aiModel.findMany({ orderBy: { createdAt: "desc" } });
}
export async function createAiModel(data: any) {
  await assertAdmin();
  await prisma.aiModel.create({ data });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}
export async function setDefaultModel(id: string) {
  await assertAdmin();
  await prisma.$transaction([
    prisma.aiModel.updateMany({ data: { isDefault: false } }),
    prisma.aiModel.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}

export async function setFallbackModel(id: string) {
  await assertAdmin();
  await prisma.$transaction([
    prisma.aiModel.updateMany({ data: { isFallback: false } }),
    prisma.aiModel.update({ where: { id }, data: { isFallback: true } }),
  ]);
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}

export async function toggleModel(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.aiModel.update({ where: { id }, data: { isActive } });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}
export async function deleteModel(id: string) {
  await assertAdmin();
  await prisma.aiModel.delete({ where: { id } });
  revalidateAdminConfig();
  revalidatePath("/pengaturan");
}

// 2. Settings (Default API Key)
export async function getAppSettings() {
  await assertAdmin();
  return await prisma.appSetting.findMany();
}
export async function saveAppSetting(key: string, value: string) {
  await assertAdmin();
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  if (key === "PRICING_PACKAGES") {
    safeRevalidateTag("pricing-packages");
    try {
      revalidatePath("/checkout");
    } catch (e) {}
    try {
      revalidatePath("/");
    } catch (e) {}
  }
  if (key === "HOMEPAGE_CARDS") {
    safeRevalidateTag("homepage-cards");
    try {
      revalidatePath("/");
    } catch (e) {}
    try {
      revalidatePath("/(app)", "layout");
    } catch (e) {}
    try {
      revalidatePath("/pengaturan");
    } catch (e) {}
  }
  revalidateAdminConfig();
}

export async function getHomepageCardsAction(): Promise<HomepageCardConfig[]> {
  return await getCachedHomepageCards();
}

export async function saveHomepageCardsAction(cards: HomepageCardConfig[]) {
  await assertAdmin();
  await prisma.appSetting.upsert({
    where: { key: "HOMEPAGE_CARDS" },
    update: { value: JSON.stringify(cards) },
    create: { key: "HOMEPAGE_CARDS", value: JSON.stringify(cards) },
  });
  safeRevalidateTag("homepage-cards");
  safeRevalidateTag("admin-config");
  try {
    revalidatePath("/");
  } catch (e) {}
  try {
    revalidatePath("/(app)", "layout");
  } catch (e) {}
  try {
    revalidatePath("/pengaturan");
  } catch (e) {}
  revalidateAdminConfig();
  return { success: true };
}

export async function deleteAppSetting(key: string) {
  await assertAdmin();
  try {
    await prisma.appSetting.delete({
      where: { key },
    });
    if (key === "PRICING_PACKAGES") {
      safeRevalidateTag("pricing-packages");
      try {
        revalidatePath("/checkout");
      } catch (e) {}
      try {
        revalidatePath("/");
      } catch (e) {}
    }
  } catch (e) {
    // Ignore error if not found
  }
  revalidateAdminConfig();
}

// 3. Features (Ruang Ngonten)
export async function getFeatures() {
  await assertAdmin();
  return await prisma.feature.findMany({ orderBy: { name: "asc" } });
}
export async function toggleFeatureStatus(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.feature.update({ where: { id }, data: { isActive } });
  revalidateAdminConfig();
}
export async function toggleFeaturePro(id: string, isProOnly: boolean) {
  await assertAdmin();
  await prisma.feature.update({ where: { id }, data: { isProOnly } });
  revalidateAdminConfig();
}

export async function updateFeatureQuotaConfig(config: {
  ngontenFreeLimit: number;
  risetFreeLimit: number;
  automationFreeTrialDays: number;
}) {
  await assertAdmin();
  await prisma.appSetting.upsert({
    where: { key: "FEATURE_QUOTA_CONFIG" },
    update: { value: JSON.stringify(config) },
    create: { key: "FEATURE_QUOTA_CONFIG", value: JSON.stringify(config) },
  });
  revalidateAdminConfig();
}

// 4. Digital Categories & Products
export async function getCategories() {
  await assertAdmin();
  return await prisma.digitalCategory.findMany({ orderBy: { createdAt: "desc" } });
}
export async function createCategory(data: any) {
  await assertAdmin();
  if (data.slug) {
    const existing = await prisma.digitalCategory.findUnique({ where: { slug: data.slug } });
    if (existing) {
      data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
  }
  await prisma.digitalCategory.create({ data });
  revalidateEbookCatalog();
}

export async function getProducts() {
  await assertAdmin();
  const [rawProducts, sortSetting] = await Promise.all([
    prisma.digitalProduct.findMany({
      select: {
        id: true,
        categoryId: true,
        title: true,
        price: true,
        originalPrice: true,
        pageCount: true,
        description: true,
        slug: true,
        fileUrl: true,
        language: true,
        formatType: true,
        productType: true,
        totalDuration: true,
        videoList: true,
        resourceData: true,
        author: true,
        isProOnly: true,
        accessLevel: true,
        isDownloadable: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        category: true,
        vouchers: true,
        reviews: { select: { rating: true } },
        _count: { select: { owners: true, favorites: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.appSetting.findUnique({ where: { key: "EBOOK_SORT_ORDER" } }).catch(() => null),
  ]);

  const [withBuyers, withCovers] = await Promise.all([
    attachComputedBuyerCounts(rawProducts),
    attachLightweightCovers(rawProducts, true),
  ]);
  const coverMap = new Map(withCovers.map((c) => [c.id, c]));
  const products = withBuyers.map((p) => {
    const cov = coverMap.get(p.id);
    return cov ? { ...p, coverUrl: cov.coverUrl, coverUrl2: cov.coverUrl2, coverUrl3: cov.coverUrl3 } : p;
  });

  if (sortSetting?.value) {
    try {
      const orderIds: string[] = JSON.parse(sortSetting.value);
      const orderMap = new Map<string, number>();
      orderIds.forEach((id, idx) => orderMap.set(id, idx));

      return [...products].sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (e) {}
  }

  return products;
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.digitalProduct.update({
    where: { id },
    data: { isActive },
  });
  revalidateEbookCatalog();
}

export async function reorderProducts(orderedIds: string[]) {
  await assertAdmin();
  await prisma.appSetting.upsert({
    where: { key: "EBOOK_SORT_ORDER" },
    update: { value: JSON.stringify(orderedIds) },
    create: { key: "EBOOK_SORT_ORDER", value: JSON.stringify(orderedIds) },
  });
  revalidateEbookCatalog();
}

export async function createProduct(data: any) {
  try {
    await assertAdmin();

    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      return { success: false, error: "Judul produk wajib diisi." };
    }

    if (!data.categoryId || typeof data.categoryId !== "string" || !data.categoryId.trim()) {
      return { success: false, error: "Kategori produk wajib dipilih." };
    }

    // Verifikasi kategori valid di database
    const categoryExists = await prisma.digitalCategory.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!categoryExists) {
      return { success: false, error: "Kategori yang dipilih tidak valid." };
    }

    if (!data.slug || typeof data.slug !== "string" || !data.slug.trim()) {
      data.slug = `product-${Math.random().toString(36).substring(2, 8)}`;
    } else {
      data.slug = data.slug.trim().toLowerCase();
      const existing = await prisma.digitalProduct.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return { success: false, error: "Slug URL sudah digunakan oleh produk lain." };
      }
    }

    const { categoryId, ...restData } = data;

    // Normalisasi string kosong menjadi null
    if (restData.coverUrl === "") restData.coverUrl = null;
    if (restData.coverUrl2 === "") restData.coverUrl2 = null;
    if (restData.coverUrl3 === "") restData.coverUrl3 = null;
    if (restData.fileUrl === "") restData.fileUrl = null;
    if (restData.totalDuration === "") restData.totalDuration = null;
    if (!restData.productType) restData.productType = "EBOOK";

    if (typeof restData.videoList === "string") {
      try {
        restData.videoList = JSON.parse(restData.videoList);
      } catch {
        restData.videoList = null;
      }
    }
    if (typeof restData.resourceData === "string") {
      try {
        restData.resourceData = JSON.parse(restData.resourceData);
      } catch {
        restData.resourceData = null;
      }
    }

    await prisma.digitalProduct.create({
      data: {
        ...restData,
        category: { connect: { id: categoryId } },
      },
    });
    revalidateEbookCatalog(data.slug);
    return { success: true };
  } catch (err: any) {
    console.error("Gagal menambahkan e-book:", err);
    return { success: false, error: err?.message || "Gagal menambahkan e-book." };
  }
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  await prisma.digitalCategory.delete({ where: { id } });
  revalidateEbookCatalog();
}

export async function deleteProduct(id: string) {
  await assertAdmin();
  const prod = await prisma.digitalProduct.findUnique({
    where: { id },
    select: { coverUrl: true, coverUrl2: true, coverUrl3: true },
  });
  if (prod) {
    if (prod.coverUrl) await deletePhysicalUploadFile(prod.coverUrl);
    if (prod.coverUrl2) await deletePhysicalUploadFile(prod.coverUrl2);
    if (prod.coverUrl3) await deletePhysicalUploadFile(prod.coverUrl3);
  }
  await prisma.digitalProduct.delete({ where: { id } });
  revalidateEbookCatalog();
}

export async function updateProduct(id: string, data: any) {
  try {
    await assertAdmin();

    if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
      return { success: false, error: "Judul produk wajib diisi." };
    }

    if (!data.categoryId || typeof data.categoryId !== "string" || !data.categoryId.trim()) {
      return { success: false, error: "Kategori produk wajib dipilih." };
    }

    // Jalankan pengecekan duplikasi slug dan pengambilan data produk lama secara paralel
    const [existing, oldProduct] = await Promise.all([
      data.slug
        ? prisma.digitalProduct.findFirst({
            where: { slug: data.slug.trim().toLowerCase(), id: { not: id } },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.digitalProduct.findUnique({
        where: { id },
        select: { coverUrl: true, coverUrl2: true, coverUrl3: true },
      }),
    ]);

    if (existing) {
      return { success: false, error: "Slug URL sudah digunakan oleh produk lain." };
    }

    if (data.slug) {
      data.slug = data.slug.trim().toLowerCase();
    }

    const { categoryId, ...restData } = data;

    // Pastikan string kosong "" dinormalisasi menjadi null
    if (restData.coverUrl === "") restData.coverUrl = null;
    if (restData.coverUrl2 === "") restData.coverUrl2 = null;
    if (restData.coverUrl3 === "") restData.coverUrl3 = null;
    if (restData.fileUrl === "") restData.fileUrl = null;
    if (restData.totalDuration === "") restData.totalDuration = null;

    if (typeof restData.videoList === "string") {
      try {
        restData.videoList = JSON.parse(restData.videoList);
      } catch {
        restData.videoList = null;
      }
    }
    if (typeof restData.resourceData === "string") {
      try {
        restData.resourceData = JSON.parse(restData.resourceData);
      } catch {
        restData.resourceData = null;
      }
    }

    if (typeof restData.coverUrl === "string" && restData.coverUrl.startsWith("/api/ebook-cover/")) {
      delete restData.coverUrl;
    }
    if (typeof restData.coverUrl2 === "string" && restData.coverUrl2.startsWith("/api/ebook-cover/")) {
      delete restData.coverUrl2;
    }
    if (typeof restData.coverUrl3 === "string" && restData.coverUrl3.startsWith("/api/ebook-cover/")) {
      delete restData.coverUrl3;
    }

    // Bersihkan file fisik di disk jika cover lama diganti atau dihapus (non-blocking)
    if (oldProduct) {
      const cleanupPromises: Promise<any>[] = [];
      if (restData.coverUrl !== undefined && oldProduct.coverUrl && oldProduct.coverUrl !== restData.coverUrl && oldProduct.coverUrl.startsWith("/uploads/")) {
        cleanupPromises.push(deletePhysicalUploadFile(oldProduct.coverUrl));
      }
      if (restData.coverUrl2 !== undefined && oldProduct.coverUrl2 && oldProduct.coverUrl2 !== restData.coverUrl2 && oldProduct.coverUrl2.startsWith("/uploads/")) {
        cleanupPromises.push(deletePhysicalUploadFile(oldProduct.coverUrl2));
      }
      if (restData.coverUrl3 !== undefined && oldProduct.coverUrl3 && oldProduct.coverUrl3 !== restData.coverUrl3 && oldProduct.coverUrl3.startsWith("/uploads/")) {
        cleanupPromises.push(deletePhysicalUploadFile(oldProduct.coverUrl3));
      }
      if (cleanupPromises.length > 0) {
        Promise.all(cleanupPromises).catch(console.error);
      }
    }

    await prisma.digitalProduct.update({
      where: { id },
      data: {
        ...restData,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
    });
    revalidateEbookCatalog(data.slug);
    return { success: true };
  } catch (err: any) {
    console.error("Gagal update e-book:", err);
    return { success: false, error: err?.message || "Gagal menyimpan perubahan e-book." };
  }
}

export async function createVoucher(data: { code: string; discountType: string; discountValue: number; digitalProductId: string }) {
  await assertAdmin();
  await prisma.voucher.create({ data });
  revalidateEbookCatalog();
}
export async function deleteVoucher(id: string) {
  await assertAdmin();
  await prisma.voucher.delete({ where: { id } });
  revalidateEbookCatalog();
}

/**
 * Fetch video duration and metadata from YouTube API for automatic admin duration detection
 */
export async function getYoutubeMetadataAction(url: string) {
  await assertAdmin();
  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    return { success: false, error: "Link YouTube tidak valid" };
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return { success: false, error: "YOUTUBE_API_KEY belum dikonfigurasi di server" };
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return { success: false, error: `Gagal membaca YouTube API (${res.status})` };
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Video tidak ditemukan atau bersifat Private" };
    }

    const item = data.items[0];
    const isoDuration = item.contentDetails?.duration || "";
    const parsed = parseYouTubeIsoDuration(isoDuration);
    const title = item.snippet?.title || "";

    return {
      success: true,
      videoId,
      title,
      duration: parsed.formattedDuration,
      totalSeconds: parsed.totalSeconds,
    };
  } catch (err: any) {
    console.error("Error fetching YouTube metadata:", err);
    return { success: false, error: err.message || "Gagal mengambil data video YouTube" };
  }
}

export async function testInstagramSessionAction(sessionIdInput?: string) {
  await assertAdmin();
  let rawSessionId = sessionIdInput?.trim();
  if (!rawSessionId) {
    const cfg = await getResolvedRisetConfig();
    rawSessionId = cfg.instagramSessionId;
  }
  if (!rawSessionId) {
    return { success: false, status: "UNKNOWN", message: "Session ID belum diisi" };
  }

  const rawCleaned = rawSessionId.replace(/^sessionid=/i, "").split(";")[0].trim();
  const sessionId = rawCleaned.includes(":") ? encodeURIComponent(rawCleaned) : rawCleaned;
  const dsUserId = sessionId.split(/%3A|:/i)[0] || "";

  try {
    const res = await fetch("https://www.instagram.com/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Cookie: `sessionid=${sessionId}; ds_user_id=${dsUserId}; ig_nrcb=1;`,
      },
      redirect: "manual",
      cache: "no-store",
    });

    const isRedirect = res.status >= 300 && res.status < 400;
    if (isRedirect) {
      await updateInstagramSessionStatus("EXPIRED", "Instagram mengalihkan sesi (Redirect 302/Loop - Sesi Kadaluarsa)");
      return {
        success: false,
        status: "EXPIRED",
        statusCode: res.status,
        message: "Session ID kadaluarsa atau ditolak oleh Instagram (Redirect 302/Loop). Perlu diperbarui.",
      };
    }

    if (res.status === 200) {
      await updateInstagramSessionStatus("VALID");
      return {
        success: true,
        status: "VALID",
        statusCode: 200,
        message: "Session ID terverifikasi aktif & sehat (HTTP 200 OK)!",
      };
    }

    await updateInstagramSessionStatus("UNKNOWN", `Respon tidak terduga: HTTP ${res.status}`);
    return {
      success: false,
      status: "UNKNOWN",
      statusCode: res.status,
      message: `Instagram merespons dengan status HTTP ${res.status}`,
    };
  } catch (err: any) {
    const isRedirectLoop = String(err?.message || "").includes("redirect");
    const status = isRedirectLoop ? "EXPIRED" : "UNKNOWN";
    const msg = isRedirectLoop
      ? "Session ID kadaluarsa (Redirect count exceeded oleh Meta)."
      : (err?.message || "Gagal menghubungi Instagram");

    await updateInstagramSessionStatus(status, msg);
    return { success: false, status, message: msg };
  }
}

export async function saveInstagramSessionAction(rawSessionId: string) {
  await assertAdmin();
  const cleaned = rawSessionId.trim();
  if (!cleaned) {
    return { success: false, error: "Session ID tidak boleh kosong" };
  }

  const row = await prisma.appSetting.findUnique({
    where: { key: RISET_CONFIG_KEY },
  });
  const current: InstagramRisetConfig = row?.value ? JSON.parse(row.value) : {};

  const testRes = await testInstagramSessionAction(cleaned);

  const updated: InstagramRisetConfig = {
    ...current,
    instagramSessionId: cleaned,
    sessionStatus: (testRes.status as any) || "VALID",
    lastCheckedAt: new Date().toISOString(),
    statusError: testRes.success ? "" : testRes.message,
  };

  await prisma.appSetting.upsert({
    where: { key: RISET_CONFIG_KEY },
    update: { value: JSON.stringify(updated) },
    create: { key: RISET_CONFIG_KEY, value: JSON.stringify(updated) },
  });

  try {
    revalidatePath("/pengaturan");
    revalidatePath("/ruang-riset");
  } catch {}

  return {
    success: true,
    testStatus: testRes.status,
    message: testRes.success
      ? "Session ID berhasil disimpan dan terverifikasi AKTIF!"
      : `Session ID berhasil disimpan, namun status saat ini: ${testRes.message}`,
  };
}

export async function deleteInstagramSessionAction() {
  await assertAdmin();
  const row = await prisma.appSetting.findUnique({
    where: { key: RISET_CONFIG_KEY },
  });
  const current: InstagramRisetConfig = row?.value ? JSON.parse(row.value) : {};
  const updated: InstagramRisetConfig = {
    ...current,
    instagramSessionId: "",
    sessionStatus: "UNKNOWN",
    lastCheckedAt: new Date().toISOString(),
    statusError: "",
  };

  await prisma.appSetting.upsert({
    where: { key: RISET_CONFIG_KEY },
    update: { value: JSON.stringify(updated) },
    create: { key: RISET_CONFIG_KEY, value: JSON.stringify(updated) },
  });

  try {
    revalidatePath("/pengaturan");
    revalidatePath("/ruang-riset");
  } catch {}

  return { success: true };
}

export async function saveRapidApiKeyAction(key: string, host?: string) {
  await assertAdmin();
  const row = await prisma.appSetting.findUnique({
    where: { key: RISET_CONFIG_KEY },
  });
  const current: InstagramRisetConfig = row?.value ? JSON.parse(row.value) : {};
  const updated: InstagramRisetConfig = {
    ...current,
    rapidApiKey: key.trim(),
    rapidApiHost: host?.trim() || current.rapidApiHost || "instagram-scraper-api2.p.rapidapi.com",
  };

  await prisma.appSetting.upsert({
    where: { key: RISET_CONFIG_KEY },
    update: { value: JSON.stringify(updated) },
    create: { key: RISET_CONFIG_KEY, value: JSON.stringify(updated) },
  });

  try {
    revalidatePath("/pengaturan");
  } catch {}

  return { success: true };
}
