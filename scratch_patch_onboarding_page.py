import sys

with open('src/app/onboarding/page.tsx', 'r') as f:
    content = f.read()

search = 'className="min-h-screen bg-gray-50 dark:bg-[#09090b] flex items-center justify-center p-4"'
replace = 'className="flex-1 flex items-center justify-center p-4 w-full"'

if search in content:
    content = content.replace(search, replace)
    with open('src/app/onboarding/page.tsx', 'w') as f:
        f.write(content)
    print("Patched onboarding/page.tsx")
else:
    print("Could not find search string in page.tsx")
