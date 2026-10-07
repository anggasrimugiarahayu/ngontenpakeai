const fs = require('fs');
const path = './src/app/actions/ruangBelajar.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /include: \{ category: true, reviews: \{ select: \{ rating: true \} \} \},/g,
  `include: { category: true, reviews: { select: { rating: true } }, _count: { select: { owners: true } } },`
);

fs.writeFileSync(path, content);
console.log("Patched actions");
