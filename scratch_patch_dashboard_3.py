import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Add Users to lucide-react import
if "Users," not in content:
    content = content.replace(
        'import { Package, Users, ShoppingCart,',
        'import { Package, Users, ShoppingCart,'
    )
    # Wait, maybe Users is already imported, let's check.
    
    # We can just blindly add it if it's missing, but it might be there.
    # We'll just define the render function.

render_insights = """
  const renderInsightsTab = () => {
    if (!insightsData) return <div className="p-8 text-center text-gray-500">Memuat data insights...</div>;

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

    const formatDataForChart = (obj: Record<string, number>) => {
      return Object.entries(obj || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const nicheData = formatDataForChart(insightsData.niche);
    const struggleData = formatDataForChart(insightsData.struggle);
    const platformData = formatDataForChart(insightsData.platform);
    const goalData = formatDataForChart(insightsData.goal);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
             <div className="text-gray-500 text-xs font-bold mb-1">TOTAL DATA MASUK</div>
             <div className="text-2xl font-black text-gray-900 dark:text-white">{insightsData.total} User</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Niche Pie Chart */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribusi Niche / Topik</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={nicheData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                    {nicheData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {nicheData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Struggle Bar Chart */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ranking Hambatan Terbesar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={struggleData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Utama</h3>
            <div className="space-y-4">
              {platformData.map((entry, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{entry.name}</span>
                    <span className="text-gray-500">{Math.round((entry.value / insightsData.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(entry.value / insightsData.total) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Distribution */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Target / Tujuan User</h3>
            <div className="space-y-4">
              {goalData.map((entry, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-gray-700 dark:text-gray-300 line-clamp-1 mr-2">{entry.name}</span>
                    <span className="text-gray-500">{Math.round((entry.value / insightsData.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(entry.value / insightsData.total) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
"""

insert_pos = content.find("  return (\n    <>\n      <ClientLayout")
if insert_pos == -1:
    insert_pos = content.find("  return (\n    <div")

if insert_pos != -1:
    content = content[:insert_pos] + render_insights + "\n" + content[insert_pos:]
    
    # Also render the tab content
    render_target = "{activeTab === 'orders' && renderOrdersTab()}"
    render_replacement = "{activeTab === 'orders' && renderOrdersTab()}\n      {activeTab === 'insights' && renderInsightsTab()}"
    content = content.replace(render_target, render_replacement)
    
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Injected Insights tab logic")
else:
    print("Could not find return statement")

