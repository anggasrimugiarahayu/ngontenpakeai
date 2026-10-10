import re

with open('src/app/(app)/pengaturan/admin-actions.ts', 'r') as f:
    content = f.read()

replacement = """export async function saveAppSetting(key: string, value: string) {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  revalidatePath("/pengaturan");
}

export async function deleteAppSetting(key: string) {
  try {
    await prisma.appSetting.delete({
      where: { key }
    });
  } catch (e) {
    // Ignore error if not found
  }
  revalidatePath("/pengaturan");
}"""

content = content.replace("export async function saveAppSetting(key: string, value: string) {\n  await prisma.appSetting.upsert({\n    where: { key },\n    update: { value },\n    create: { key, value }\n  });\n  revalidatePath(\"/pengaturan\");\n}", replacement)

with open('src/app/(app)/pengaturan/admin-actions.ts', 'w') as f:
    f.write(content)

