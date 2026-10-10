with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pengaturan API Key Global</h2>' in line:
        start_idx = i - 1 # include <div className="mb-6">
    if start_idx != -1 and '</div>' in line and i > start_idx + 10:
        # We need to find the end of this block. Let's just find the exact block boundary.
        pass

# It's better to just read the whole file and find start/end strings.
