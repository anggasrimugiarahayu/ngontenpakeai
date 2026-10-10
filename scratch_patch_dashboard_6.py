import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

target = """        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
            activeTab === 'orders'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Orders
        </button>"""

replacement = """        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
            activeTab === 'orders'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border flex items-center gap-2 ${
            activeTab === 'insights'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Insights
        </button>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Injected Insights tab button")
else:
    print("Target not found. Let's try flexible search.")
    target2 = "Orders\n        </button>"
    if target2 in content:
        content = content.replace(target2, "Orders\n        </button>\n" + replacement.split("Orders\n        </button>")[1])
        with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
            f.write(content)
        print("Injected Insights tab button via flexible search")
    else:
        print("Still not found.")

