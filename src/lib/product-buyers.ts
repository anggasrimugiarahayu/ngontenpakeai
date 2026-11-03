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
    const pricingSetting = await prisma.appSetting
      .findUnique({ where: { key: "PRICING_PACKAGES" } })
      .catch(() => null);

    const productToPackageMap = new Map<string, string[]>();
    if (pricingSetting?.value) {
      try {
        const parsed = JSON.parse(pricingSetting.value);
        const pkgs = parsed.packages || parsed;
        for (const [pkgId, pkg] of Object.entries<any>(pkgs)) {
          if (pkg && Array.isArray(pkg.bundledProductIds)) {
            pkg.bundledProductIds.forEach((pid: string) => {
              if (pid) {
                if (!productToPackageMap.has(pid)) productToPackageMap.set(pid, []);
                productToPackageMap.get(pid)!.push(pkgId);
              }
            });
          }
        }
      } catch (e) {}
    }

    const allPackageIds = Array.from(
      new Set(Array.from(productToPackageMap.values()).flat())
    );

    const packageOrdersMap = new Map<string, number>();
    if (allPackageIds.length > 0) {
      const orderGroups = await prisma.order
        .groupBy({
          by: ["orderType"],
          where: {
            status: "SUCCESS",
            orderType: { in: allPackageIds },
          },
          _count: { userId: true },
        })
        .catch(() => []);
      orderGroups.forEach((g) => {
        packageOrdersMap.set(g.orderType, g._count.userId);
      });
    }

    return products.map((p) => {
      const directCount = p._count?.owners || 0;
      const matchingPkgs = productToPackageMap.get(p.id) || [];
      const packageBuyers = matchingPkgs.reduce(
        (sum, pkgId) => sum + (packageOrdersMap.get(pkgId) || 0),
        0
      );
      const computedOwners = Math.max(directCount, packageBuyers);

      return {
        ...p,
        buyerCount: computedOwners,
        _count: {
          ...(p._count || {}),
          owners: computedOwners,
          favorites: p._count?.favorites || 0,
        },
      };
    });
  } catch (error) {
    console.error("Error attaching computed buyer counts:", error);
    return products;
  }
}
