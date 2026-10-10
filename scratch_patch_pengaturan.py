import sys

with open('src/app/actions/pengaturan.ts', 'r') as f:
    content = f.read()

search = """  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  const isPro = isAdmin || false;

  const [features, usages] = await Promise.all([
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.usage.findMany({ where: { userId: session.user.id } })
  ]);
  const userData = { features, usages };"""

replace = """  const isAdmin = session?.user?.email === "anggasrimugiarahayu@gmail.com";
  
  const [features, usages, dbUser, userOrders] = await Promise.all([
    prisma.feature.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.usage.findMany({ where: { userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { proToolsExpiredAt: true, role: true } }),
    prisma.order.findMany({ 
      where: { userId: session.user.id, status: "SUCCESS" },
      include: { product: true }
    })
  ]);

  const hasTools = dbUser?.proToolsExpiredAt && new Date(dbUser.proToolsExpiredAt) > new Date();
  const isPro = isAdmin || hasTools || false;
  
  const ownedEbooks = userOrders
    .filter((o: any) => o.product && o.orderType !== 'PRO_TOOLS')
    .map((o: any) => o.product.title);

  const userData = { 
    features, 
    usages, 
    proExpiredAt: dbUser?.proToolsExpiredAt || null,
    ownedEbooks
  };"""

if search in content:
    content = content.replace(search, replace)
    with open('src/app/actions/pengaturan.ts', 'w') as f:
        f.write(content)
    print("Patched getPengaturanDataAction")
else:
    print("Search not found")
