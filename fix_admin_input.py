with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "r") as f:
    content = f.read()

# 1. Remove setApiKey initialization from useEffect
content = content.replace(
    'setApiKey(settings?.DEFAULT_GEMINI_API_KEY || "");',
    '// Input starts empty like in User page'
)

# 2. Add setApiKey("") to handleSaveApiKey
content = content.replace(
    'setSavedKey(apiKey.trim());\n    toast.success("API Key berhasil disimpan!");',
    'setSavedKey(apiKey.trim());\n    setApiKey("");\n    toast.success("API Key berhasil disimpan!");'
)

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "w") as f:
    f.write(content)

print("AdminSettingsContent.tsx patched successfully!")
