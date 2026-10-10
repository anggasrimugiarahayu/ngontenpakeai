import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Let's count { and }
opening = content.count('{')
closing = content.count('}')

print(f"Opening: {opening}, Closing: {closing}")

if closing > opening:
    print("Too many closing braces. Attempting to fix.")
    # let's just remove the last '}'
    content = content[:-1]
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)

