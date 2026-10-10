import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# 1. Fix Tab Button
target_button = """        <button
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
replace_button = """        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg border ${
            activeTab === 'insights'
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          Insights
        </button>"""
content = content.replace(target_button, replace_button)


# 2. Fix renderInsightsTab()
old_render = content.split("const renderInsightsTab = () => {")[1].split("  return (\n    <>\n      <style jsx global>")[0]

new_render = """
    if (!insightsData) return <div className="p-8 text-center text-gray-500">Memuat data insights...</div>;
    if (insightsData.total === 0) return <div className="p-8 text-center text-gray-500 border border-gray-100 dark:border-white/5 rounded-2xl bg-white dark:bg-[#121214]">Belum ada data onboarding dari user.</div>;

    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
    const GRADIENTS = [
      'from-orange-500 to-amber-400',
      'from-blue-500 to-cyan-400',
      'from-emerald-500 to-teal-400',
      'from-violet-500 to-purple-400'
    ];

    const formatDataForChart = (obj: Record<string, number>) => {
      return Object.entries(obj || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const nicheData = formatDataForChart(insightsData.niche);
    const struggleData = formatDataForChart(insightsData.struggle);
    const platformData = formatDataForChart(insightsData.platform);
    const goalData = formatDataForChart(insightsData.goal);

    return (
      <div className="space-y-6 animate-in fade-in duration-300 mt-2">
        <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm inline-block min-w-[200px]">
           <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Responden</div>
           <div className="text-3xl font-black text-gray-900 dark:text-white flex items-baseline gap-2">
             {insightsData.total} <span className="text-sm font-medium text-gray-400">User</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Niche Donut Chart */}
          <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
              Distribusi Niche / Topik
            </h3>
            <div className="h-60 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={nicheData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={85} 
                    innerRadius={60} 
                    paddingAngle={4}
                    stroke="none"
                  >
                    {nicheData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--fallback-b1,oklch(var(--b1)/1))', color: 'var(--fallback-bc,oklch(var(--bc)/1))', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-800 dark:text-gray-200 leading-none">{nicheData.length > 0 ? nicheData[0].value : 0}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Top Niche</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {nicheData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-white/10">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="font-medium">{entry.name} <span className="text-gray-400">({entry.value})</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Struggle Bar Chart */}
          <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Ranking Hambatan Utama
            </h3>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={struggleData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--fallback-b1,oklch(var(--b1)/1))', color: 'var(--fallback-bc,oklch(var(--bc)/1))', fontSize: '12px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} barSize={28}>
                    {struggleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
              Platform Favorit
            </h3>
            <div className="space-y-5">
              {platformData.map((entry, index) => {
                const percentage = Math.round((entry.value / insightsData.total) * 100) || 0;
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{entry.name}</span>
                      <div className="text-right">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{percentage}%</span>
                        <span className="text-[10px] text-gray-400 ml-1">({entry.value})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${GRADIENTS[index % GRADIENTS.length]}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Distribution */}
          <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-violet-500 rounded-full"></span>
              Target (Goals) Utama
            </h3>
            <div className="space-y-5">
              {goalData.map((entry, index) => {
                const percentage = Math.round((entry.value / insightsData.total) * 100) || 0;
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-1 pr-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{entry.name}</span>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-gray-900 dark:text-white">{percentage}%</span>
                        <span className="text-[10px] text-gray-400 ml-1">({entry.value})</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${GRADIENTS[(index+2) % GRADIENTS.length]}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
"""

content = content.replace(old_render, new_render)
with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)
print("Patched rendering logic")
