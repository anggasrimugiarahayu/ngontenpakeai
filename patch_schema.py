with open("prisma/schema.prisma", "r") as f:
    content = f.read()

content = content.replace(
    'isDefault Boolean  @default(false)',
    'isDefault Boolean  @default(false)\n  isFallback Boolean  @default(false)'
)

with open("prisma/schema.prisma", "w") as f:
    f.write(content)

print("schema.prisma patched")
