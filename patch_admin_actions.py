with open("src/app/(app)/pengaturan/admin-actions.ts", "r") as f:
    content = f.read()

new_func = """
export async function setFallbackModel(id: string) {
  await prisma.aiModel.updateMany({ data: { isFallback: false } });
  await prisma.aiModel.update({ where: { id }, data: { isFallback: true } });
  revalidatePath("/pengaturan");
}
"""

content = content.replace(
    'revalidatePath("/pengaturan");\n}\nexport async function toggleModel(id: string, isActive: boolean) {',
    'revalidatePath("/pengaturan");\n}\n' + new_func + '\nexport async function toggleModel(id: string, isActive: boolean) {'
)

with open("src/app/(app)/pengaturan/admin-actions.ts", "w") as f:
    f.write(content)

print("admin-actions.ts patched")
