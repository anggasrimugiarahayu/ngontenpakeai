import sys

with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'r') as f:
    content = f.read()

search = '<h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">📚 Akses Permanen (Ebook)</h3>'
replace = '<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Akses Permanen (Ebook)</h3>'

if search in content:
    content = content.replace(search, replace)
    with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'w') as f:
        f.write(content)
    print("Fixed Ebook UI.")
else:
    print("Could not find the Ebook heading.")
