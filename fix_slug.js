const fs = require('fs');

let pageFile = 'src/app/ruang-belajar/[slug]/page.tsx';
let pageCode = fs.readFileSync(pageFile, 'utf8');

const newLogic = `
  const userProducts = await prisma.userOwnedProduct.findMany({
    where: { userId: session.user.id },
    select: { digitalProductId: true }
  });
  const ownedProductIds = new Set(userProducts.map(up => up.digitalProductId));

  const isFree = ebook.accessLevel === "FREE";
  const isProEbook = ebook.accessLevel === "PRO";
  const isPremiumEbook = ebook.accessLevel === "PREMIUM";
  
  const isOwned = ownedProductIds.has(ebook.id);
  
  let isLocked = true;
  if (isFree) isLocked = false;
  else if (isProEbook && isPro) isLocked = false;
  else if (isOwned) isLocked = false;

  const isFavorite = ebook.favorites.length > 0;
`;

pageCode = pageCode.replace(
  '  const isLocked = ebook.isProOnly && !isPro;\n  const isFavorite = ebook.favorites.length > 0;',
  newLogic
);

fs.writeFileSync(pageFile, pageCode);
console.log("Slug page fixed!");
