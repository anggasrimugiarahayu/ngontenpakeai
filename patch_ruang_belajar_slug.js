const fs = require('fs');

let pageFile = 'src/app/ruang-belajar/[slug]/page.tsx';
let pageCode = fs.readFileSync(pageFile, 'utf8');

// Add UserOwnedProduct fetching and logic
const fetchCode = `
  const isFavorite = session?.user?.id 
    ? await prisma.favorite.findUnique({ where: { userId_digitalProductId: { userId: session.user.id, digitalProductId: ebook.id } } }) !== null
    : false;

  const userReview = session?.user?.id 
    ? await prisma.review.findUnique({ where: { userId_digitalProductId: { userId: session.user.id, digitalProductId: ebook.id } } })
    : null;

  const userProducts = session?.user?.id ? await prisma.userOwnedProduct.findMany({
    where: { userId: session.user.id },
    select: { digitalProductId: true }
  }) : [];
  const ownedProductIds = new Set(userProducts.map(up => up.digitalProductId));

  const isFree = ebook.accessLevel === "FREE";
  const isProEbook = ebook.accessLevel === "PRO";
  const isPremiumEbook = ebook.accessLevel === "PREMIUM";
  
  const isOwned = ownedProductIds.has(ebook.id);
  
  let isLocked = true;
  if (isFree) isLocked = false;
  else if (isProEbook && isPro) isLocked = false;
  else if (isOwned) isLocked = false;
`;

pageCode = pageCode.replace(
  /const isFavorite = session\?\.user\?\.id\s*\?\s*await prisma\.favorite\.findUnique\(\{ where: \{ userId_digitalProductId: \{ userId: session\.user\.id, digitalProductId: ebook\.id \} \} \}\) !== null\s*:\s*false;\s*const userReview = session\?\.user\?\.id\s*\?\s*await prisma\.review\.findUnique\(\{ where: \{ userId_digitalProductId: \{ userId: session\.user\.id, digitalProductId: ebook\.id \} \} \}\)\s*:\s*null;\s*const isLocked = ebook\.isProOnly && !isPro;/,
  fetchCode
);

// Update PDF display
pageCode = pageCode.replace(
  /\{ebook\.isProOnly && \(/,
  `{!isFree && !isOwned && (`
);

// Update Information Table
pageCode = pageCode.replace(
  /\{ebook\.isProOnly \? 'Premium \(PRO\)' : 'Gratis'\}/,
  `{isFree ? 'Gratis' : isPremiumEbook ? 'Premium' : 'Pro Only'}`
);

fs.writeFileSync(pageFile, pageCode);
console.log("Ruang Belajar Slug patched!");
