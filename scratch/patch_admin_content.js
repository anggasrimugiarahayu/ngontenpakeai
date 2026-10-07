const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the map start and end
content = content.replace(
  /\{products\.map\(\(prod: any\) => \(/,
  `{products.map((prod: any) => {
              const reviewCount = prod.reviews?.length || 0;
              const averageRating = reviewCount > 0 
                ? (prod.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount).toFixed(1) 
                : "0.0";
              const buyerCount = prod._count?.owners || 0;
              
              return (`
);

content = content.replace(
  /<\/div>\n\s*\}\)\}/g,
  `</div>
              );
            })}`
);

// Replace the rating section
content = content.replace(
  /<span>5\.0<\/span>\n\s*<span className="text-gray-400 font-normal ml-0\.5">\n\s*\(Banyak ulasan\)\n\s*<\/span>/,
  `<span>{averageRating === "0.0" ? "0" : averageRating}</span>
                      <span className="text-gray-400 font-normal ml-0.5">
                        ({reviewCount === 0 ? "0 ulasan" : \`\${reviewCount} ulasan\`})
                      </span>
                      <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                      <span className="text-gray-500 font-medium">
                        {buyerCount} pembeli
                      </span>`
);

// Replace the bottom flex container
content = content.replace(
  /<div className="mt-auto pt-2 flex items-end justify-between">/,
  `<div className="mt-auto pt-2 flex flex-wrap items-end justify-between gap-y-3 gap-x-2">`
);

// Add ml-auto to buttons wrapper
content = content.replace(
  /<div className="flex items-center gap-1 sm:gap-1\.5 shrink-0">/,
  `<div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">`
);

fs.writeFileSync(path, content);
console.log("Patched AdminSettingsContent.tsx");
