import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Add getAudienceInsightsAction to imports
target_import = "import { getDashboardDataAction, getDashboardOrdersAction } from '@/app/actions/dashboard';"
replace_import = "import { getDashboardDataAction, getDashboardOrdersAction, getAudienceInsightsAction } from '@/app/actions/dashboard';"
if target_import in content:
    content = content.replace(target_import, replace_import)

# Replace tabs array
target_tabs = """  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'orders', label: 'Sales & Orders', icon: <ShoppingCart className="w-4 h-4" /> }
  ];"""
replace_tabs = """  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'orders', label: 'Sales & Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Users className="w-4 h-4" /> }
  ];"""
if target_tabs in content:
    content = content.replace(target_tabs, replace_tabs)

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)

print("Patched imports and tabs")
