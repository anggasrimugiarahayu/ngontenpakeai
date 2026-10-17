import prisma from "./prisma";

interface CoverRow {
  id: string;
  updatedAt: Date | null;
  cover1: string | null;
  cover2: string | null;
  cover3: string | null;
}

export function formatCoverSlotUrl(
  id: string,
  val: string | null | undefined,
  slot: 1 | 2 | 3,
  updatedAt?: Date | string | null
): string | null {
  if (!val) return null;
  if (val === "DATA_URI" || val.startsWith("data:")) {
    const v = updatedAt ? new Date(updatedAt).getTime() : 1;
    return `/api/ebook-cover/${id}?slot=${slot}&v=${v}`;
  }
  return val;
}

/**
 * Mengambil status/URL cover dari PostgreSQL tanpa mentransfer string Base64 raksasa
 * melalui jaringan database (menggunakan LEFT("coverUrl", 5) di sisi SQL).
 */
export async function attachLightweightCovers<
  T extends { id: string; updatedAt?: Date | string | null }
>(
  products: T[],
  includeExtraSlots = false
): Promise<Array<T & { coverUrl: string | null; coverUrl2?: string | null; coverUrl3?: string | null }>> {
  if (!products || products.length === 0) return [];

  try {
    const rows = includeExtraSlots
      ? await prisma.$queryRaw<CoverRow[]>`
          SELECT
            id,
            created_at AS "updatedAt",
            CASE
              WHEN "coverUrl" IS NULL OR "coverUrl" = '' THEN NULL
              WHEN LEFT("coverUrl", 5) = 'data:' THEN 'DATA_URI'
              ELSE "coverUrl"
            END AS cover1,
            CASE
              WHEN "coverUrl2" IS NULL OR "coverUrl2" = '' THEN NULL
              WHEN LEFT("coverUrl2", 5) = 'data:' THEN 'DATA_URI'
              ELSE "coverUrl2"
            END AS cover2,
            CASE
              WHEN "coverUrl3" IS NULL OR "coverUrl3" = '' THEN NULL
              WHEN LEFT("coverUrl3", 5) = 'data:' THEN 'DATA_URI'
              ELSE "coverUrl3"
            END AS cover3
          FROM digital_products
        `
      : await prisma.$queryRaw<CoverRow[]>`
          SELECT
            id,
            created_at AS "updatedAt",
            CASE
              WHEN "coverUrl" IS NULL OR "coverUrl" = '' THEN NULL
              WHEN LEFT("coverUrl", 5) = 'data:' THEN 'DATA_URI'
              ELSE "coverUrl"
            END AS cover1,
            NULL AS cover2,
            NULL AS cover3
          FROM digital_products
        `;

    const coverMap = new Map<string, CoverRow>();
    for (const r of rows) {
      coverMap.set(r.id, r);
    }

    return products.map((p) => {
      const c = coverMap.get(p.id);
      const ver = p.updatedAt || c?.updatedAt || null;
      const result: any = {
        ...p,
        coverUrl: c
          ? formatCoverSlotUrl(p.id, c.cover1, 1, ver)
          : formatCoverSlotUrl(p.id, (p as any).coverUrl, 1, ver),
      };

      if (includeExtraSlots) {
        result.coverUrl2 = c
          ? formatCoverSlotUrl(p.id, c.cover2, 2, ver)
          : formatCoverSlotUrl(p.id, (p as any).coverUrl2, 2, ver);
        result.coverUrl3 = c
          ? formatCoverSlotUrl(p.id, c.cover3, 3, ver)
          : formatCoverSlotUrl(p.id, (p as any).coverUrl3, 3, ver);
      }

      return result as T & { coverUrl: string | null; coverUrl2?: string | null; coverUrl3?: string | null };
    });
  } catch (err) {
    console.error("Error in attachLightweightCovers:", err);
    return products.map((p) => ({
      ...p,
      coverUrl: (p as any).coverUrl ?? null,
    }));
  }
}
