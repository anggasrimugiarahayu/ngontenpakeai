import sys
import re

with open('src/app/onboarding/OnboardingClient.tsx', 'r') as f:
    content = f.read()

# Make max-w smaller, reduce padding
content = content.replace(
    'className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden relative"',
    'className="w-full max-w-xl bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 shadow-xl rounded-2xl overflow-hidden relative"'
)

# Reduce padding p-8 md:p-12 -> p-6 md:p-8
content = content.replace(
    'className="p-8 md:p-12"',
    'className="p-6 md:p-8"'
)

# Reduce mb-10 -> mb-6
content = content.replace(
    'className="text-center mb-10"',
    'className="text-center mb-6"'
)

# Reduce title font size text-2xl md:text-3xl -> text-xl md:text-2xl
content = content.replace(
    'className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"',
    'className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"'
)

# Reduce subtitle font size text-sm -> text-xs md:text-sm
content = content.replace(
    'className="text-sm text-gray-500 dark:text-gray-400"',
    'className="text-xs md:text-sm text-gray-500 dark:text-gray-400"'
)

# Reduce gap grid-cols-1 gap-3 -> gap-2
content = content.replace(
    'className="grid grid-cols-1 gap-3"',
    'className="grid grid-cols-1 gap-2"'
)

# Reduce button padding p-4 md:p-5 -> p-3 md:p-4, rounded-2xl -> rounded-xl
content = content.replace(
    'className="flex items-center justify-between w-full p-4 md:p-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 hover:border-rn-accent hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-left group"',
    'className="flex items-center justify-between w-full p-3 md:p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-rn-accent hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-left group"'
)

# Reduce button text size text-sm md:text-base -> text-sm
content = content.replace(
    'className="font-bold text-sm md:text-base"',
    'className="font-bold text-sm"'
)

# Reduce icon size w-5 h-5 -> w-4 h-4 in the map
content = content.replace(
    'w-5 h-5 text-gray-300',
    'w-4 h-4 text-gray-300'
)
# Adjust icons inside the state
content = content.replace('w-5 h-5', 'w-4 h-4')

with open('src/app/onboarding/OnboardingClient.tsx', 'w') as f:
    f.write(content)
print("Patched onboarding/OnboardingClient.tsx")

