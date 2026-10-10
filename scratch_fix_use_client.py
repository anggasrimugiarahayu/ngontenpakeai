import sys

with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'r') as f:
    content = f.read()

# Remove "use client"; from its current position
content = content.replace('"use client";', '')

# Prepend "use client"; at the very top, stripping any leading whitespace
content = '"use client";\n' + content.lstrip()

with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'w') as f:
    f.write(content)

print("Fixed use client positioning.")
