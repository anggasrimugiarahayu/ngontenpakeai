with open("src/app/(app)/ruang-ngonten/ebook-builder/EbookBuilderClient.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '''    const { data, error } = await fetchAI('/api/ebook-builder/generate', {
      prompt: promptText,
      history: historyCtx,
      blueprint: blueprintData,
      model: selectedModel
    });''',
    '''    const { data, error } = await fetchAI('/api/ebook-builder/generate', {
      prompt: promptText,
      history: historyCtx,
      blueprint: blueprintData,
      model: selectedModel,
      isShortcut: promptText.includes('[SYSTEM AUTO-SUBMIT]')
    });'''
)

with open("src/app/(app)/ruang-ngonten/ebook-builder/EbookBuilderClient.tsx", "w") as f:
    f.write(content)

with open("src/hooks/useAIChat.ts", "r") as f:
    content_chat = f.read()

content_chat = content_chat.replace(
    'if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(clean)) return true;',
    'if (/[bcdfghjklmnpqrstvwxyz]{6,}/.test(clean)) return true;'
)

with open("src/hooks/useAIChat.ts", "w") as f:
    f.write(content_chat)
