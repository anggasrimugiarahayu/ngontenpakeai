import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Replacements
replacements = [
    (
        'audiens Anda tertarik pada topik <br/><strong className="text-gray-900 dark:text-white">{topNiche.name}</strong>',
        'Audiens Anda tertarik pada topik <br/><strong className="text-gray-900 dark:text-white">({topNiche.name})</strong>'
    ),
    (
        'mengaku paling sering mengalami hambatan <br/><strong className="text-gray-900 dark:text-white">{topStruggle.name}</strong>',
        'Mengaku paling sering mengalami hambatan <br/><strong className="text-gray-900 dark:text-white">({topStruggle.name})</strong>'
    ),
    (
        'memilih fokus membangun aset di <br/><strong className="text-gray-900 dark:text-white">{topPlatform.name}</strong>',
        'Memilih fokus membangun aset di <br/><strong className="text-gray-900 dark:text-white">({topPlatform.name})</strong>'
    ),
    (
        'memiliki target utama untuk bisa <br/><strong className="text-gray-900 dark:text-white">{topGoal.name}</strong>',
        'Memiliki target utama untuk bisa <br/><strong className="text-gray-900 dark:text-white">({topGoal.name})</strong>'
    )
]

for target, replacement in replacements:
    if target in content:
        content = content.replace(target, replacement)
        print(f"Patched: {target[:20]}...")
    else:
        print(f"Failed to find: {target[:20]}...")

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)

