import re

with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'r') as f:
    content = f.read()

content = content.replace("        </div>\n      {/* Tab: Model AI */}", "        </div>\n      )}\n\n      {/* Tab: Model AI */}")

with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'w') as f:
    f.write(content)

