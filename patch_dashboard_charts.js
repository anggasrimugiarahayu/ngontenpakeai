const fs = require('fs');
const path = './src/app/actions/dashboard.ts';
let content = fs.readFileSync(path, 'utf8');

const regexToInsertCharts = /const realProductSales = topProducts\.map\(p => \{/;

const chartsLogic = `
  // -- CHARTS & GROWTH CALCULATIONS --
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  let salesGrowth = 0;
  let viewsGrowth = 0;
  let salesChartData: any[] = [];
  let viewsChartData: any[] = [];

  try {
    const salesLast30 = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } }
    });
    const salesPrev30 = await prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const val30 = salesLast30._sum.amount || 0;
    const valPrev30 = salesPrev30._sum.amount || 0;
    salesGrowth = valPrev30 === 0 ? (val30 > 0 ? 100 : 0) : (((val30 - valPrev30) / valPrev30) * 100);

    const viewsLast30 = await prisma.productAnalytics.aggregate({
      _sum: { views: true, clicks: true },
      where: { date: { gte: thirtyDaysAgo } }
    });
    const viewsPrev30 = await prisma.productAnalytics.aggregate({
      _sum: { views: true, clicks: true },
      where: { date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
    });
    const valVC30 = (viewsLast30._sum.views || 0) + (viewsLast30._sum.clicks || 0);
    const valVCPrev30 = (viewsPrev30._sum.views || 0) + (viewsPrev30._sum.clicks || 0);
    viewsGrowth = valVCPrev30 === 0 ? (valVC30 > 0 ? 100 : 0) : (((valVC30 - valVCPrev30) / valVCPrev30) * 100);

    const ordersLast30 = await prisma.order.findMany({
      where: { status: 'SUCCESS', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amount: true }
    });
    
    const analyticsLast30 = await prisma.productAnalytics.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      select: { date: true, views: true, clicks: true }
    });

    const salesChartMap: Record<string, number> = {};
    ordersLast30.forEach(o => {
      const dateStr = o.createdAt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      salesChartMap[dateStr] = (salesChartMap[dateStr] || 0) + o.amount;
    });

    const viewsChartMap: Record<string, {views: number, clicks: number}> = {};
    analyticsLast30.forEach(a => {
      const dateStr = a.date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      if (!viewsChartMap[dateStr]) viewsChartMap[dateStr] = {views: 0, clicks: 0};
      viewsChartMap[dateStr].views += a.views;
      viewsChartMap[dateStr].clicks += a.clicks;
    });

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      salesChartData.push({ date: dateStr, sales: salesChartMap[dateStr] || 0 });
      viewsChartData.push({ date: dateStr, views: viewsChartMap[dateStr]?.views || 0, clicks: viewsChartMap[dateStr]?.clicks || 0 });
    }
  } catch(e) { console.error("Error charting", e); }
  
  const realProductSales = topProducts.map(p => {
`;

content = content.replace(regexToInsertCharts, chartsLogic.trim());

const returnRegex = /fullOrders: JSON\.parse\(JSON\.stringify\(fullOrders\)\)/;
content = content.replace(returnRegex, `
    fullOrders: JSON.parse(JSON.stringify(fullOrders)),
    salesGrowth: parseFloat(salesGrowth.toFixed(2)),
    viewsGrowth: parseFloat(viewsGrowth.toFixed(2)),
    salesChartData,
    viewsChartData
`.trim());

fs.writeFileSync(path, content);
console.log("Patched dashboard.ts with charts!");
