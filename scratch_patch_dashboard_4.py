import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

render_insights = """
  const renderInsightsTab = () => {
    if (!insightsData) return <div className="p-8 text-center text-gray-500">Memuat data insights...</div>;
    if (insightsData.total === 0) return <div className="p-8 text-center text-gray-500 border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-[#121214]">Belum ada data onboarding dari user.</div>;

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

    const formatDataForChart = (obj: Record<string, number>) => {
      return Object.entries(obj || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const nicheData = formatDataForChart(insightsData.niche);
    const struggleData = formatDataForChart(insightsData.struggle);
    const platformData = formatDataForChart(insightsData.platform);
    const goalData = formatDataForChart(insightsData.goal);

    return (
      <div className="space-y-6 animate-in fade-in duration-300 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
             <div className="text-gray-500 text-xs font-bold mb-1 uppercase">Total User Mengisi Data</div>
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
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--fallback-b1,oklch(var(--b1)/1))', color: 'var(--fallback-bc,oklch(var(--bc)/1))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {nicheData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="font-medium">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Struggle Bar Chart */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ranking Hambatan Utama</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={struggleData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.1} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]}>
                    {struggleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ea580c' : '#fb923c'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Favorit</h3>
            <div className="space-y-4 mt-6">
              {platformData.map((entry, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{entry.name}</span>
                    <span className="text-gray-500 font-medium">{Math.round((entry.value / insightsData.total) * 100)}% ({entry.value})</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(entry.value / insightsData.total) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Distribution */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Target (Goals) Terbesar</h3>
            <div className="space-y-4 mt-6">
              {goalData.map((entry, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-700 dark:text-gray-300 line-clamp-1 pr-2">{entry.name}</span>
                    <span className="text-gray-500 font-medium shrink-0">{Math.round((entry.value / insightsData.total) * 100)}% ({entry.value})</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(entry.value / insightsData.total) * 100}%` }}></div>
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

target = "  return (\n    <>\n      <style jsx global>"
if target in content:
    content = content.replace(target, render_insights + "\n" + target)
    content = content.replace("{activeTab === 'orders' && renderOrdersTab()}", "{activeTab === 'orders' && renderOrdersTab()}\n      {activeTab === 'insights' && renderInsightsTab()}")
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Injected Insights properly.")
else:
    print("Target not found.")

