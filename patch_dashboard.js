const fs = require('fs');
const path = './src/app/actions/dashboard.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Add totalUsersFree, Pro, Subscribers calculation
const userCountRegex = /let totalUsers = 0;\n\s*let totalProducts = 0;\n\s*try \{\n\s*totalUsers = await prisma\.user\.count\(\);\n\s*totalProducts = await prisma\.digitalProduct\.count\(\);\n\s*\} catch \(e\) \{\n\s*console\.log\("Supabase timeout on counting users\/products"\);\n\s*\}/m;

const userCountReplacement = `
  let totalUsers = 0;
  let totalProducts = 0;
  let totalUsersFree = 0;
  let totalUsersPro = 0;
  let totalSubscribers = 0;

  try {
    totalUsers = await prisma.user.count();
    totalProducts = await prisma.digitalProduct.count();
    
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });
    
    userRoles.forEach(ur => {
      if (ur.role === 'PRO') {
        totalUsersPro += ur._count.id;
        totalSubscribers += ur._count.id;
      } else if (ur.role === 'ADMIN') {
        totalUsersPro += ur._count.id;
      } else {
        totalUsersFree += ur._count.id;
      }
    });
  } catch (e) {
    console.log("Supabase timeout on counting users/products");
  }

  let totalViews = 0;
  let totalClicks = 0;
  let productAnalyticsMap: Record<string, { views: number, clicks: number }> = {};

  try {
    const analytics = await prisma.productAnalytics.groupBy({
      by: ['digitalProductId'],
      _sum: { views: true, clicks: true }
    });
    
    analytics.forEach(a => {
      totalViews += (a._sum.views || 0);
      totalClicks += (a._sum.clicks || 0);
      productAnalyticsMap[a.digitalProductId] = {
        views: a._sum.views || 0,
        clicks: a._sum.clicks || 0
      };
    });
  } catch(e) { console.error("Analytics Error", e); }
`;

content = content.replace(userCountRegex, userCountReplacement.trim());


// 2. Fix realProductSales mapping
const salesRegex = /const realProductSales = topProducts\.map\(p => \{\n\s*const productDef = products\.find\(prod => prod\.id === p\.digitalProductId\);\n\s*return \{\n\s*id: p\.digitalProductId,\n\s*title: productDef\?\.title \|\| "Unknown Product",\n\s*views: 0,\n\s*sold: p\._count\.id,\n\s*amount: p\._sum\.amount \|\| 0,\n\s*conversion: 0, \n\s*image: productDef\?\.coverUrl \|\| 'https:\/\/images\.unsplash\.com\/photo-1611162617474-5b21e879e113\?w=100&h=100&fit=crop'\n\s*\};\n\s*\}\);/m;

const salesReplacement = `
  const realProductSales = topProducts.map(p => {
    const productDef = products.find(prod => prod.id === p.digitalProductId);
    const analytics = productAnalyticsMap[p.digitalProductId] || { views: 0, clicks: 0 };
    const views = analytics.views;
    const sold = p._count.id;
    const conversion = views > 0 ? ((sold / views) * 100) : 0;

    return {
      id: p.digitalProductId,
      title: productDef?.title || "Unknown Product",
      views: views,
      sold: sold,
      amount: p._sum.amount || 0,
      conversion: parseFloat(conversion.toFixed(1)), 
      image: productDef?.coverUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'
    };
  });
`;
content = content.replace(salesRegex, salesReplacement.trim());

// 3. Fix the final return statement
const returnRegex = /totalUsersFree: totalUsers, \n\s*totalUsersPro: 0,\n\s*totalSubscribers: 0,/;
content = content.replace(returnRegex, `
    totalUsersFree, 
    totalUsersPro,
    totalSubscribers,
`.trim());

content = content.replace(/totalViews: 0,\n\s*totalClicks: 0,/, `totalViews,\n    totalClicks,`);

fs.writeFileSync(path, content);
console.log("Patched dashboard.ts");
