import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Make sure recharts has RadarChart imports
if 'RadarChart' not in content:
    content = content.replace(
        'PieChart, Pie, Cell',
        'PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis'
    )

old_render = content.split("const renderInsightsTab = () => {")[1].split("  return (\n    <>\n      <style jsx global>")[0]

new_render = """
    if (!insightsData) return <div className="p-8 text-center text-gray-500">Memuat data insights...</div>;
    if (insightsData.total === 0) return <div className="p-8 text-center text-gray-500 border border-gray-100 dark:border-white/5 rounded-2xl bg-white dark:bg-[#121214]">Belum ada data onboarding dari user.</div>;

    const formatToRadar = (obj: Record<string, number>) => {
      return Object.entries(obj || {}).map(([name, count]) => ({
        subject: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        value: Math.round((count / insightsData.total) * 100),
        count: count
      }));
    };

    // Gabungkan semua data menjadi 1 array memutar
    const radarData = [
      ...formatToRadar(insightsData.niche),
      ...formatToRadar(insightsData.struggle),
      ...formatToRadar(insightsData.platform),
      ...formatToRadar(insightsData.goal)
    ];

    // Untuk legend custom
    const categories = [
      { name: 'Niche / Topik', count: Object.keys(insightsData.niche || {}).length, color: '#f97316' },
      { name: 'Hambatan Utama', count: Object.keys(insightsData.struggle || {}).length, color: '#3b82f6' },
      { name: 'Platform', count: Object.keys(insightsData.platform || {}).length, color: '#10b981' },
      { name: 'Target (Goal)', count: Object.keys(insightsData.goal || {}).length, color: '#8b5cf6' }
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-300 mt-2">
        <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm inline-block min-w-[200px]">
           <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Responden</div>
           <div className="text-3xl font-black text-gray-900 dark:text-white flex items-baseline gap-2">
             {insightsData.total} <span className="text-sm font-medium text-gray-400">User</span>
           </div>
        </div>

        <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
             <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Peta Karakteristik User (Radar)</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Grafik ini menggabungkan semua preferensi user ke dalam satu jaring laba-laba. Semakin ujung titiknya, semakin dominan preferensi tersebut di kalangan user.
             </p>
          </div>

          <div className="w-full h-[500px] md:h-[600px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" strokeOpacity={0.5} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickCount={6}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [`${value}% (${props.payload.count} User)`, 'Dominasi']}
                  labelFormatter={(label: string, payload: any[]) => payload.length > 0 ? payload[0].payload.fullName : label}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--fallback-b1,oklch(var(--b1)/1))', color: 'var(--fallback-bc,oklch(var(--bc)/1))', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Radar 
                  name="Persentase Audiens" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fill="#f97316" 
                  fillOpacity={0.35} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend to explain the dimensions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
             {categories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-gray-100 dark:border-white/5">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                   <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  };
"""

content = content.replace(old_render, "\n" + new_render + "\n")

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)
print("Patched DashboardClient to use Radar Chart")

