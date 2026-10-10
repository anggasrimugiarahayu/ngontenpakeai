import sys
import re

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

# Replace renderWaffle
target_waffle = """    const renderWaffle = (percentage: number, colorClass: string, bgColorClass: string) => {
      return (
        <div className="grid grid-cols-10 gap-0.5 w-full max-w-[180px] aspect-square mx-auto mb-4">"""
replace_waffle = """    const renderWaffle = (percentage: number, colorClass: string, bgColorClass: string) => {
      return (
        <div className="grid grid-cols-10 gap-0.5 w-full max-w-[180px] aspect-square mb-4">"""
content = content.replace(target_waffle, replace_waffle)

# Replace the layout
# We will use regex to find the start of the layout:
# <div className="space-y-6 animate-in fade-in duration-300 mt-2">
# ... up to ...
# <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">

pattern = re.compile(
    r'<div className="space-y-6 animate-in fade-in duration-300 mt-2">.*?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">',
    re.DOTALL
)

replacement = """<div className="animate-in fade-in duration-300 mt-2">
        <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
            <div className="text-left max-w-2xl">
               <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Top Mayoritas Karakteristik Audiens</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">
                 Profil dominan audiens Anda berdasarkan jawaban terbanyak dari setiap kategori.
               </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end bg-gray-50 dark:bg-white/5 p-3 px-5 rounded-xl border border-gray-100 dark:border-white/10 shrink-0">
               <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Responden</div>
               <div className="text-2xl font-black text-gray-900 dark:text-white flex items-baseline gap-1.5">
                 {insightsData.total} <span className="text-xs font-bold text-gray-400">User</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">"""

content = pattern.sub(replacement, content)

# Replace "flex flex-col text-center" with "flex flex-col text-left"
content = content.replace('className="flex flex-col text-center"', 'className="flex flex-col text-left"')

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)
print("Patched layout!")

