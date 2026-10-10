import sys

with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'r') as f:
    content = f.read()

# Replace the heading
search = '<h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">📊 Kuota AI Tools</h3>'
replace = '<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Kuota AI Tools</h3>'

if search in content:
    content = content.replace(search, replace)
    with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'w') as f:
        f.write(content)
    print("Fixed Kuota AI Tools UI.")
else:
    print("Could not find the heading.")
