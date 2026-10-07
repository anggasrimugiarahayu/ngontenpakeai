const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCardRegex = /<div key=\{prod\.id\} className="group flex flex-row items-start[\s\S]*?<\/div>[\s]*<\/div>[\s]*<\/div>[\s]*<\/div>/;

const newCard = `<div key={prod.id} className="flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] overflow-hidden relative p-3 sm:p-4 gap-3 sm:gap-4">
                
                <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">
                  <div className="aspect-[3/4] relative flex items-center justify-center">
                    {prod.coverUrl ? (
                      <>
                        <img src={prod.coverUrl} alt={prod.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 py-1 h-full min-h-[133px] sm:min-h-[160px]">
                  <div className="flex-1">
                    <h3 className="text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors line-clamp-2" title={prod.title}>
                      {prod.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1.5 mb-2">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span>5.0</span>
                      <span className="text-gray-400 font-normal ml-0.5">
                        (Banyak ulasan)
                      </span>
                    </div>

                    {prod.description && (
                       <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                         {prod.description}
                       </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                      <div className={\`font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider \${prod.accessLevel === 'FREE' ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300' : 'bg-rn-accent/10 text-rn-accent dark:bg-rn-accent/20 dark:text-rn-accent'}\`}>
                        {prod.accessLevel === 'FREE' ? "Gratis" : (prod.accessLevel === 'PREMIUM' ? "Premium" : "PRO")}
                      </div>
                      <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {prod.category?.name || 'PRODUK DIGITAL'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 flex items-end justify-between">
                    <div className="flex flex-col">
                        {(prod.accessLevel === "PREMIUM" || prod.accessLevel === "PRO") && prod.originalPrice && prod.originalPrice > prod.price ? (
                          <span className="text-xs sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">
                            Rp {prod.originalPrice.toLocaleString('id-ID')}
                          </span>
                        ) : null}
                        <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                          {(prod.accessLevel === "PREMIUM" || prod.accessLevel === "PRO") ? \`Rp \${(prod.price || 0).toLocaleString("id-ID")}\` : "Rp 0"}
                        </span>
                        {prod.accessLevel === "PRO" && (
                           <span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5 whitespace-nowrap">(Rp 0 khusus PRO)</span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <button 
                        onClick={() => setEditingProduct(prod)} 
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-[10px] sm:text-xs font-bold"
                      >
                        <Edit className="w-3.5 h-3.5" /> <span>Edit</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('Yakin ingin menghapus E-book ini?')) {
                            await deleteProduct(prod.id);
                            mutate("pengaturan");
                          }
                        }} 
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-[10px] sm:text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>`;

if (!oldCardRegex.test(content)) {
  console.log("Could not find old card regex");
} else {
  content = content.replace(oldCardRegex, newCard);
  fs.writeFileSync(path, content);
  console.log("Card replaced successfully");
}
