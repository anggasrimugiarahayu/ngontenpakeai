import sys

with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'r') as f:
    content = f.read()

# Make sure date-fns is imported
if "import { format } from 'date-fns';" not in content:
    content = 'import { format } from "date-fns";\nimport { id } from "date-fns/locale";\nimport Link from "next/link";\n' + content

search = """export function PlanUsageSection({ isPro, userData }: { isPro: boolean, userData?: any }) {
  const [features, setFeatures] = useState(userData?.features || []);
  const [usages, setUsages] = useState<any[]>(userData?.usages || []);



  const usageMap = usages.reduce((acc: any, usage: any) => {
    acc[usage.featureId] = usage.count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan & Penggunaan</h2>
          {isPro && (
            <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Pro
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Penggunaan fitur dan kuota aktif kamu.</p>
      </div>

      <div className="space-y-4">
        {features.map((feature: any) => (
          <div key={feature.id} className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {usageMap[feature.id] || 0} digunakan ({isPro ? "Unlimited" : "Terbatas"})
            </span>
          </div>
        ))}
        {features.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">Belum ada fitur tersedia.</div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400">
        {isPro ? "Aktif, berlaku hingga 3 Oktober 2026" : "Paket Free (Terbatas)"}
      </div>
    </div>
  );
}"""

replace = """export function PlanUsageSection({ isPro, userData }: { isPro: boolean, userData?: any }) {
  const features = userData?.features || [];
  const usages = userData?.usages || [];
  const ownedEbooks = userData?.ownedEbooks || [];
  const proExpiredAt = userData?.proExpiredAt ? new Date(userData.proExpiredAt) : null;

  const usageMap = usages.reduce((acc: any, usage: any) => {
    acc[usage.featureId] = usage.count;
    return acc;
  }, {} as Record<string, number>);

  const isNearlyExpired = proExpiredAt && (proExpiredAt.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plan & Penggunaan</h2>
            {isPro ? (
              <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Pro
              </span>
            ) : (
              <span className="bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Free
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPro && proExpiredAt 
              ? `Masa Aktif: Berlaku hingga ${format(proExpiredAt, 'd MMMM yyyy', { locale: id })}`
              : "Status: Paket Free (Terbatas)"
            }
          </p>
        </div>
        
        {!isPro ? (
          <Link href="/?pricing=true" className="px-4 py-2 bg-rn-accent text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
            Upgrade ke Pro
          </Link>
        ) : isNearlyExpired ? (
          <Link href="/?pricing=true" className="px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity">
            Perpanjang Paket
          </Link>
        ) : null}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">📊 Kuota AI Tools</h3>
        <div className="space-y-3">
          {features.map((feature: any) => (
            <div key={feature.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-700 dark:text-gray-300">{feature.name}</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                {isPro 
                  ? `${usageMap[feature.id] || 0}x generasi (Unlimited)` 
                  : `${usageMap[feature.id] || 0} / 3 digunakan`
                }
              </span>
            </div>
          ))}
          {features.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada fitur AI tersedia.</div>
          )}
        </div>
      </div>

      {ownedEbooks.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">📚 Akses Permanen (Ebook)</h3>
          <ul className="space-y-2">
            {ownedEbooks.map((title: string, index: number) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rn-accent"></span>
                {title} <span className="text-gray-400 text-xs">(Akses Selamanya)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}"""

if search in content:
    content = content.replace(search, replace)
    with open('src/app/(app)/pengaturan/SettingsClientData.tsx', 'w') as f:
        f.write(content)
    print("Patched SettingsClientData.tsx")
else:
    print("Search not found")

