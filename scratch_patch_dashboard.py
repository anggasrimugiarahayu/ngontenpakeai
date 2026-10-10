import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Add getAudienceInsightsAction to imports
if "getAudienceInsightsAction" not in content:
    content = content.replace(
        'import { getDashboardDataAction, getDashboardOrdersAction } from "@/app/actions/dashboard";',
        'import { getDashboardDataAction, getDashboardOrdersAction, getAudienceInsightsAction } from "@/app/actions/dashboard";'
    )

# Add tabs
tabs_search = """  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'orders', label: 'Sales & Orders', icon: <ShoppingCart className="w-4 h-4" /> }
  ];"""
tabs_replace = """  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'orders', label: 'Sales & Orders', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Users className="w-4 h-4" /> }
  ];"""
if tabs_search in content:
    content = content.replace(tabs_search, tabs_replace)

# Make sure PieChart, Cell are imported from recharts
if "PieChart" not in content:
    content = content.replace(
        'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";',
        'import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";'
    )

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)

print("Pre-patched dashboard")

