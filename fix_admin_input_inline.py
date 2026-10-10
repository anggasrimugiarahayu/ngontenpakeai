with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "r") as f:
    content = f.read()

# 1. Initialize apiKey as empty string
content = content.replace(
    'const [apiKey, setApiKey] = useState(initialApiKey);',
    'const [apiKey, setApiKey] = useState("");'
)

# 2. Add setApiKey("") in handleSaveApiKey
content = content.replace(
    'setSavedKey(apiKey);\n    toast.success("API Key berhasil disimpan!");',
    'setSavedKey(apiKey);\n    setApiKey("");\n    toast.success("API Key berhasil disimpan!");'
)

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "w") as f:
    f.write(content)

print("Admin inline state patched!")
