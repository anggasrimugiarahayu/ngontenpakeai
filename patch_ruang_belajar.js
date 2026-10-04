const fs = require('fs');

let pageFile = 'src/app/ruang-belajar/page.tsx';
let pageCode = fs.readFileSync(pageFile, 'utf8');

// Add UserOwnedProduct fetching
const fetchCode = `
  const products = await prisma.digitalProduct.findMany({
    where: { isActive: true },
    include: { category: true, reviews: { select: { rating: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const userProducts = session?.user?.id ? await prisma.userOwnedProduct.findMany({
    where: { userId: session.user.id },
    select: { digitalProductId: true }
  }) : [];
  const ownedProductIds = new Set(userProducts.map(up => up.digitalProductId));
`;

pageCode = pageCode.replace(
  /const products = await prisma\.digitalProduct\.findMany\(\{\s*where: \{ isActive: true \},\s*include: \{ category: true, reviews: \{ select: \{ rating: true \} \} \},\s*orderBy: \{ createdAt: 'desc' \}\s*\}\);/,
  fetchCode
);

// Update mapping logic
const mapLogic = `
            {products.map((ebook: any) => {
              const isFree = ebook.accessLevel === "FREE";
              const isProEbook = ebook.accessLevel === "PRO";
              const isPremiumEbook = ebook.accessLevel === "PREMIUM";
              
              const isOwned = ownedProductIds.has(ebook.id);
              
              let isLocked = true;
              if (isFree) isLocked = false;
              else if (isProEbook && isPro) isLocked = false;
              else if (isOwned) isLocked = false;

              const reviewCount = ebook.reviews?.length || 0;
`;

pageCode = pageCode.replace(
  /\{products\.map\(\(ebook: any\) => \{\s*const isFree = !ebook\.isProOnly;\s*const isLocked = ebook\.isProOnly && !isPro;\s*const reviewCount = ebook\.reviews\?\.length \|\| 0;/,
  mapLogic
);

// Update tags and prices
const tagsLogic = `
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                          <div className={\`font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider \${!isLocked ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300' : 'bg-rn-accent/10 text-rn-accent dark:bg-rn-accent/20 dark:text-rn-accent'}\`}>
                            {isFree ? "Gratis" : (isPremiumEbook ? "Premium" : "Pro Only")}
                          </div>
                          {isOwned && (
                             <div className="font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                               Dimiliki
                             </div>
                          )}
                          {ebook.category && (
                            <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              {ebook.category.name}
                            </div>
                          )}
                        </div>
`;

pageCode = pageCode.replace(
  /<div className="flex flex-wrap gap-1\.5 mb-4 mt-auto">[\s\S]*?(?=\{ebook\.category &&)/,
  tagsLogic
);

const bottomLogic = `
                      <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                        {isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Gratis</span>
                        ) : isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Akses Terbuka</span>
                        ) : (
                          <span className={\`text-[17px] font-black \${isLocked ? 'text-rn-accent' : 'text-gray-400 dark:text-gray-500'}\`}>
                             {isPremiumEbook ? "Premium" : "Pro"}
                          </span>
                        )}
                        <button className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition-colors">
                          Buka E-Book
                        </button>
                      </div>
`;

pageCode = pageCode.replace(
  /<div className="mt-auto pt-2\.5 flex items-center justify-between border-t border-gray-100 dark:border-white\/5">[\s\S]*?<\/button>\s*<\/div>/,
  bottomLogic
);

fs.writeFileSync(pageFile, pageCode);
console.log("Ruang Belajar Index patched!");
