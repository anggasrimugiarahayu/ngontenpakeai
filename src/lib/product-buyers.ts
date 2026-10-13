import prisma from "./prisma";

/**
 * Menghitung dan melampirkan jumlah pembeli riil untuk setiap produk digital.
 * Untuk produk bertipe PRO (isProOnly, accessLevel === 'PRO', atau termasuk dalam bundle PRO_BOOK / PRO_PLUS),
 * jumlah pembeli menghitung seluruh member yang berstatus akun PRO (atau memiliki order PRO_BOOK / PRO_PLUS)
 * ditambah pembeli satuan non-PRO yang belum termasuk dalam hitungan member PRO (tidak dobel hitung).
 */
export async function attachComputedBuyerCounts<T extends { 
  id: string; 
  isProOnly?: boolean | null; 
  accessLevel?: string | null; 
  _count?: { owners?: number; favorites?: number } | null 
}>(products: T[]): Promise<T[]> {
  if (!products || products.length === 0) return products;

  try {
    const [proUserCount, nonProOwners, pricingSetting] = await Promise.all([
      prisma.user.count({
        where: {
          OR: [
            { role: "PRO" },
            { orders: { some: { status: "SUCCESS", orderType: { in: ["PRO_BOOK", "PRO_PLUS"] } } } }
          ]
        }
      }).catch(() => 0),
      prisma.userOwnedProduct.findMany({
        where: {
          user: {
            role: { not: "PRO" },
            orders: { none: { status: "SUCCESS", orderType: { in: ["PRO_BOOK", "PRO_PLUS"] } } }
          }
        },
        select: { digitalProductId: true }
      }).catch(() => []),
      prisma.appSetting.findUnique({ where: { key: "PRICING_PACKAGES" } }).catch(() => null)
    ]);

    const nonProCountMap = new Map<string, number>();
    for (const row of nonProOwners) {
      if (row.digitalProductId) {
        nonProCountMap.set(row.digitalProductId, (nonProCountMap.get(row.digitalProductId) || 0) + 1);
      }
    }

    const proBundledIds = new Set<string>();
    if (pricingSetting?.value) {
      try {
        const pkg = JSON.parse(pricingSetting.value);
        ["PRO_BOOK", "PRO_PLUS"].forEach(k => {
          if (pkg[k]?.bundledProductIds && Array.isArray(pkg[k].bundledProductIds)) {
            pkg[k].bundledProductIds.forEach((id: string) => proBundledIds.add(id));
          }
        });
      } catch (e) {}
    }

    return products.map(p => {
      const isProProduct = !!(p.isProOnly || p.accessLevel === "PRO" || proBundledIds.has(p.id));
      const originalCount = p._count?.owners || 0;
      const nonProCount = nonProCountMap.get(p.id) || 0;
      const computedOwners = isProProduct ? (proUserCount + nonProCount) : originalCount;

      return {
        ...p,
        buyerCount: computedOwners,
        _count: {
          ...(p._count || {}),
          owners: computedOwners,
          favorites: p._count?.favorites || 0
        }
      };
    });
  } catch (error) {
    console.error("Error attaching computed buyer counts:", error);
    return products;
  }
}
