import sys

with open('src/app/(app)/layout.tsx', 'r') as f:
    content = f.read()

search = """    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { role: true, proToolsExpiredAt: true } 
    });
    if (dbUser) {
      userRole = dbUser.role || "USER";
      hasTools = dbUser.proToolsExpiredAt ? new Date(dbUser.proToolsExpiredAt) > new Date() : false;
    }"""

replace = """    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      select: { role: true, proToolsExpiredAt: true, onboardingCompleted: true } 
    });
    if (dbUser) {
      if (!dbUser.onboardingCompleted) {
        redirect("/onboarding");
      }
      userRole = dbUser.role || "USER";
      hasTools = dbUser.proToolsExpiredAt ? new Date(dbUser.proToolsExpiredAt) > new Date() : false;
    }"""

if search in content:
    content = content.replace(search, replace)
    with open('src/app/(app)/layout.tsx', 'w') as f:
        f.write(content)
    print("Patched (app)/layout.tsx")
else:
    print("Could not find search string.")
