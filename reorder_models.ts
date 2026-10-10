import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const desiredOrder = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro"
];

async function main() {
  const models = await prisma.aiModel.findMany()
  
  // Fix the typo if it exists
  const typoModel = models.find(m => m.modelId === "emini-3-flash-preview")
  if (typoModel) {
    console.log("Fixing typo in model ID...")
    await prisma.aiModel.update({
      where: { id: typoModel.id },
      data: { modelId: "gemini-3-flash-preview" }
    })
    // Update local array for mapping
    typoModel.modelId = "gemini-3-flash-preview"
  }

  // Reload models
  const updatedModels = await prisma.aiModel.findMany()

  // Base date: Now
  const baseDate = new Date()

  for (let i = 0; i < desiredOrder.length; i++) {
    const targetModelId = desiredOrder[i];
    const model = updatedModels.find(m => m.modelId === targetModelId);
    if (model) {
      // Create a date that is (i) minutes older than baseDate
      // i = 0 (newest) -> baseDate
      // i = 1 (older) -> baseDate - 1 min
      const newDate = new Date(baseDate.getTime() - (i * 60000));
      await prisma.aiModel.update({
        where: { id: model.id },
        data: { createdAt: newDate }
      })
      console.log(`Updated ${targetModelId} to ${newDate.toISOString()}`)
    } else {
      console.log(`Model ${targetModelId} not found in DB!`)
    }
  }
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
