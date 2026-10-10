import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# I will replace the entire renderInsightsTab function.
# Let's extract everything from "  const renderInsightsTab = () => {" to the end of the function.
import re

# Find the start of the function
start_marker = "  const renderInsightsTab = () => {"
if start_marker not in content:
    print("Could not find renderInsightsTab")
    sys.exit(1)

start_idx = content.find(start_marker)

# We need to find the matching closing brace for this function.
# But it's easier to just replace everything up to the final return statement or just before `return (` of the main component
# Since renderInsightsTab is just before `return (` of DashboardClient
end_marker = "    );\n  };\n\n  return ("
if end_marker not in content:
    # maybe it's just "  };\n\n  return ("
    end_marker = "  };\n\n  return ("

if end_marker not in content:
    print("Could not find end marker")
    sys.exit(1)

end_idx = content.find(end_marker, start_idx) + len("  };\n")

new_func = """  const renderInsightsTab = () => {
    if (!insightsData) return <div className="p-8 text-center text-gray-500">Memuat data insights...</div>;
    if (insightsData.total === 0) return <div className="p-8 text-center text-gray-500 border border-gray-100 dark:border-white/5 rounded-2xl bg-white dark:bg-[#121214]">Belum ada data onboarding dari user.</div>;

    const getTopWinner = (obj: Record<string, number>) => {
      const entries = Object.entries(obj || {});
      if (entries.length === 0) return { name: '-', count: 0, percentage: 0 };
      const top = entries.sort((a, b) => b[1] - a[1])[0];
      return {
        name: top[0],
        count: top[1],
        percentage: Math.round((top[1] / insightsData.total) * 100) || 0
      };
    };

    const topNiche = getTopWinner(insightsData.niche);
    const topStruggle = getTopWinner(insightsData.struggle);
    const topPlatform = getTopWinner(insightsData.platform);
    const topGoal = getTopWinner(insightsData.goal);

    const renderWaffle = (percentage: number, colorClass: string, bgColorClass: string) => {
      return (
        <div className="grid grid-cols-10 gap-0.5 w-full max-w-[180px] aspect-square mx-auto mb-4">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-full h-full rounded-[1px] ${
                100 - i <= percentage ? colorClass : bgColorClass
              }`}
            />
          ))}
        </div>
      );
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-300 mt-2">
        <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm inline-block min-w-[200px]">
           <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Responden</div>
           <div className="text-3xl font-black text-gray-900 dark:text-white flex items-baseline gap-2">
             {insightsData.total} <span className="text-sm font-medium text-gray-400">User</span>
           </div>
        </div>

        <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
             <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Top Mayoritas Karakteristik Audiens</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Profil dominan audiens Anda berdasarkan jawaban terbanyak dari setiap kategori.
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            
            {/* Waffle 1: Niche */}
            <div className="flex flex-col text-center">
              {renderWaffle(topNiche.percentage, "bg-[#4a5d23]", "bg-[#e5eadb]")}
              <div className="text-4xl font-black text-[#4a5d23] mb-2">{topNiche.percentage}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                audiens Anda tertarik pada topik <br/><strong className="text-gray-900 dark:text-white">{topNiche.name}</strong>
              </p>
            </div>

            {/* Waffle 2: Struggle */}
            <div className="flex flex-col text-center">
              {renderWaffle(topStruggle.percentage, "bg-[#cc0000]", "bg-[#f5ccff]")}
              <div className="text-4xl font-black text-[#cc0000] mb-2">{topStruggle.percentage}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                mengaku paling sering mengalami hambatan <br/><strong className="text-gray-900 dark:text-white">{topStruggle.name}</strong>
              </p>
            </div>

            {/* Waffle 3: Platform */}
            <div className="flex flex-col text-center">
              {renderWaffle(topPlatform.percentage, "bg-[#3399ff]", "bg-[#dbeafe]")}
              <div className="text-4xl font-black text-[#3399ff] mb-2">{topPlatform.percentage}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                memilih fokus membangun aset di <br/><strong className="text-gray-900 dark:text-white">{topPlatform.name}</strong>
              </p>
            </div>

            {/* Waffle 4: Goal */}
            <div className="flex flex-col text-center">
              {renderWaffle(topGoal.percentage, "bg-[#f59e0b]", "bg-[#fef3c7]")}
              <div className="text-4xl font-black text-[#f59e0b] mb-2">{topGoal.percentage}%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                memiliki target utama untuk bisa <br/><strong className="text-gray-900 dark:text-white">{topGoal.name}</strong>
              </p>
            </div>

          </div>
        </div>
      </div>
    );
  };\n"""

new_content = content[:start_idx] + new_func + content[end_idx:]

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(new_content)
print("Patched DashboardClient to use Waffle Chart")

