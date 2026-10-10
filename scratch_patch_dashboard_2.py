import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Add insights state
state_search = "const [data, setData] = useState<any>(null);"
state_replace = "const [data, setData] = useState<any>(null);\n  const [insightsData, setInsightsData] = useState<any>(null);"
content = content.replace(state_search, state_replace)

# Fetch insights
fetch_search = """      const result = await getDashboardDataAction();
      setData(result);"""
fetch_replace = """      const [result, insights] = await Promise.all([getDashboardDataAction(), getAudienceInsightsAction()]);
      setData(result);
      setInsightsData(insights);"""
content = content.replace(fetch_search, fetch_replace)

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)

print("Pre-patched dashboard fetch")

