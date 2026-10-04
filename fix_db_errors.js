const fs = require('fs');
const file = 'src/app/dashboard/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/const blueprint = await prisma\.masterBlueprint\.findFirst\(\{[\s\S]*?\}\);/m, 
`let blueprint = null;
    try {
      blueprint = await prisma.masterBlueprint.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
      });
    } catch (e) {
      console.error("Supabase cold start error for blueprint:", e);
    }`);

code = code.replace(/const dbFeatures = await prisma\.feature\.findMany\(\);/m,
`let dbFeatures: any[] = [];
  try {
    dbFeatures = await prisma.feature.findMany();
  } catch (e) {
    console.error("Supabase cold start error for features:", e);
  }`);

fs.writeFileSync(file, code);
