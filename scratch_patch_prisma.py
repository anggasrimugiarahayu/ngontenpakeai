import sys

with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

search = """  googleApiKey     String?           @map("google_api_key")
  accounts         Account[]"""

replace = """  googleApiKey     String?           @map("google_api_key")
  onboardingCompleted Boolean           @default(false) @map("onboarding_completed")
  preferences         Json?
  accounts         Account[]"""

if search in content:
    content = content.replace(search, replace)
    with open('prisma/schema.prisma', 'w') as f:
        f.write(content)
    print("Patched Prisma schema.")
else:
    print("Could not find search string.")
