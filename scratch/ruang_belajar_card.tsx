                <Link 
                  href={`/ruang-belajar/${ebook.slug}`} 
                  onMouseEnter={() => preload(["ebookDetail", ebook.slug], () => getEbookDetailAction(ebook.slug))}
                  onTouchStart={() => preload(["ebookDetail", ebook.slug], () => getEbookDetailAction(ebook.slug))} key={ebook.id} className="group flex">
                  <div className="flex flex-row items-start w-full hover:border-rn-accent dark:hover:border-rn-accent/50 hover:shadow-xl hover:-translate-y-1.5 hover:shadow-gray-200 dark:hover:shadow-black/50 transition-all duration-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-[16px] sm:rounded-[20px] overflow-hidden relative p-3 sm:p-4 gap-3 sm:gap-4">
                    
                    <div className="w-[100px] sm:w-[120px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-[#1f1f23] border border-gray-200 dark:border-white/5 rounded-[10px] sm:rounded-xl shadow-sm">
                      <div className="aspect-[3/4] relative flex items-center justify-center">
                        {ebook.coverUrl ? (
                          <>
                            <img src={ebook.coverUrl} alt={ebook.title} className="absolute inset-0 w-full h-full object-cover z-0" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10 pointer-events-none" />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 opacity-50" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex-1">
                        <h3 className="text-[17px] font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-rn-accent transition-colors line-clamp-2" title={ebook.title}>
                          {ebook.title}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1.5 mb-2">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{averageRating === "0.0" ? "0" : averageRating}</span>
                          <span className="text-gray-400 font-normal ml-0.5">
                            ({reviewCount} ulasan)
                          </span>
                          <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                          <span className="text-gray-500 font-medium">
                            {buyerCount} pembeli
                          </span>
                        </div>

                        {ebook.description && (
                           <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                             {ebook.description}
                           </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                          <div className={`font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${!isLocked ? 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300' : 'bg-rn-accent/10 text-rn-accent dark:bg-rn-accent/20 dark:text-rn-accent'}`}>
                            {isFree ? "Gratis" : (isPremiumEbook ? "Premium" : "Pro Only")}
                          </div>
                          {isOwned && (
                             <div className="font-bold rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                               Dimiliki
                             </div>
                          )}
                          {ebook.category && (
                            <div className="font-bold rounded px-1.5 py-0.5 text-[9px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              {ebook.category.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-2 flex items-end justify-between">
                        {isOwned ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Dimiliki</span>
                        ) : isFree ? (
                          <span className="text-[17px] font-black text-green-600 dark:text-green-500">Rp 0</span>
                        ) : (
                          <div className="flex flex-col">
                            {ebook.originalPrice && ebook.originalPrice > ebook.price ? (
                              <span className="text-xs sm:text-[13px] font-medium text-gray-400 dark:text-gray-500 line-through leading-none mb-1">
                                Rp {ebook.originalPrice.toLocaleString('id-ID')}
                              </span>
                            ) : null}
                            <span className="text-[17px] font-black text-gray-900 dark:text-white leading-none">
                              Rp {ebook.price ? ebook.price.toLocaleString('id-ID') : '0'}
                            </span>
                            {isProEbook && (
                               <span className="text-[9px] sm:text-[10px] text-rn-accent font-bold mt-1.5 whitespace-nowrap">(Rp 0 khusus PRO)</span>
                            )}
                          </div>
                        )}
