import re

with open("src/app/api/ebook-builder/generate/route.ts", "r") as f:
    content = f.read()

# Add import
content = content.replace(
    'import { getApiKey } from "@/lib/get-api-key";',
    'import { getApiKey } from "@/lib/get-api-key";\nimport { getDefaultAiModel } from "@/lib/get-ai-model";'
)

# Remove default value from destructuring
content = content.replace(
    'model = "gemini-2.5-flash",',
    'model,'
)

# Add fallback using getDefaultAiModel
content = content.replace(
    'const currentKey = apiKey || process.env.GEMINI_API_KEY;',
    'const selectedModel = model || await getDefaultAiModel("gemini-2.5-flash");\n    const currentKey = apiKey || process.env.GEMINI_API_KEY;'
)

# Update generateContent call
content = content.replace(
    'model: model,',
    'model: selectedModel,'
)

with open("src/app/api/ebook-builder/generate/route.ts", "w") as f:
    f.write(content)

print("ebook-builder patched!")
