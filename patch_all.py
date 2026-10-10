import re

# 1. Patch ApiKeyForm.tsx
with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "r") as f:
    user_content = f.read()

# Add useEffect import
user_content = user_content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

# Add currentKey state
user_content = user_content.replace(
    'const [keyValue, setKeyValue] = useState("");',
    'const [keyValue, setKeyValue] = useState("");\n  const [currentKey, setCurrentKey] = useState<string | null>(apiKey || null);\n\n  useEffect(() => {\n    if (apiKey !== undefined) {\n      setCurrentKey(apiKey || null);\n    }\n  }, [apiKey]);'
)

# Update handleSave to set currentKey
user_content = user_content.replace(
    'toast.success("API Key berhasil disimpan!");',
    'toast.success("API Key berhasil disimpan!");\n      setCurrentKey(keyValue);'
)

# Update handleDelete to clear currentKey
user_content = user_content.replace(
    'toast.success("API Key berhasil dihapus!");',
    'toast.success("API Key berhasil dihapus!");\n      setCurrentKey(null);'
)

# Replace apiKey with currentKey in rendering
user_content = user_content.replace('{apiKey ? (', '{currentKey ? (')
user_content = user_content.replace('maskKey(apiKey)', 'maskKey(currentKey)')

with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "w") as f:
    f.write(user_content)

# 2. Patch AdminSettingsContent.tsx
with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "r") as f:
    admin_content = f.read()

admin_content = admin_content.replace(
    '<input\n                type="text"\n                value={apiKey}',
    '<input\n                type="password"\n                value={apiKey}'
)

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "w") as f:
    f.write(admin_content)

print("Both files patched successfully!")
