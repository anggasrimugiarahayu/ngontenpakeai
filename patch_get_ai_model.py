with open("src/lib/get-ai-model.ts", "r") as f:
    content = f.read()

new_func = """
export async function getFallbackAiModel(fallbackModel = "gemini-3.5-flash-lite") {
  const fallback = await prisma.aiModel.findFirst({
    where: { isFallback: true, isActive: true }
  });
  return fallback?.modelId || fallbackModel;
}
"""

with open("src/lib/get-ai-model.ts", "w") as f:
    f.write(content + "\n" + new_func)

print("get-ai-model.ts patched")
