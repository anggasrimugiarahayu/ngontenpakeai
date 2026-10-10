import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

target = 'const { data } = useSWR("dashboard", getDashboardDataAction);'
replace = 'const { data } = useSWR("dashboard", getDashboardDataAction);\n  const { data: insightsData } = useSWR("insights", getAudienceInsightsAction);'

if target in content:
    content = content.replace(target, replace)
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Patched SWR")
else:
    print("Not found")

