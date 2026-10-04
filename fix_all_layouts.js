const fs = require('fs');
const glob = require('glob');

const files = [
  'src/app/ruang-ngonten/layout.tsx',
  'src/app/pengaturan/layout.tsx',
  'src/app/feedback/layout.tsx',
  'src/app/ruang-belajar/layout.tsx',
  'src/app/ruang-growing/layout.tsx',
  'src/app/bantuan/layout.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('const dbFeatures = await prisma.feature.findMany();')) {
    code = code.replace(/const dbFeatures = await prisma\.feature\.findMany\(\);/m,
\`let dbFeatures: any[] = [];
  try {
    dbFeatures = await prisma.feature.findMany();
  } catch (e) {
    console.error("Supabase cold start error for features:", e);
  }\`);
  }

  if (code.includes('const blueprint = await prisma.masterBlueprint.findFirst')) {
    code = code.replace(/const blueprint = await prisma\.masterBlueprint\.findFirst\(\{[\s\S]*?\}\);/m, 
\`let blueprint = null;
    try {
      blueprint = await prisma.masterBlueprint.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
      });
    } catch (e) {
      console.error("Supabase cold start error for blueprint:", e);
    }\`);
  }
  
  fs.writeFileSync(file, code);
}
