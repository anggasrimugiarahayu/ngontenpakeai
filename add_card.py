import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# 1. Replace grid layout
content = content.replace('grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl')

# 2. Add 4th card
# The 3rd card ends at:
#                 </p>
#               </div>
#             </div>
#           </div>
#         </main>

target_end = """                </p>
              </div>
            </div>"""

new_card = """                </p>
              </div>
            </div>

            {/* EBOOK BUILDER CARD */}
            <div
              className={`group relative flex flex-col justify-start rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-xl cursor-default z-0 overflow-hidden ${isDark ? "bg-[#18181b] border-white/5 shadow-black/50 hover:border-blue-500/50" : "bg-white border-gray-200 shadow-gray-200 hover:border-blue-400"}`}
            >
              <span className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 shadow-sm z-10">
                New Product
              </span>
              <div className="relative w-full overflow-hidden aspect-[344/145] lg:aspect-[4/3] rounded-lg">
                <div
                  data-active="true"
                  className={`iso-stage pointer-events-none absolute -z-10 aspect-[1642/1200] max-w-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out group-hover:scale-[1.05] ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  style={{ top: "50%", left: "50%", width: "290%" }}
                >
                  <svg viewBox="0 0 1642 1200" className="size-full" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><g strokeOpacity="0.18" strokeWidth="3" strokeDasharray="3 14"><line x1="21" y1="0" x2="21" y2="1200"></line><line x1="101" y1="0" x2="101" y2="1200"></line><line x1="181" y1="0" x2="181" y2="1200"></line><line x1="261" y1="0" x2="261" y2="1200"></line><line x1="341" y1="0" x2="341" y2="1200"></line><line x1="421" y1="0" x2="421" y2="1200"></line><line x1="501" y1="0" x2="501" y2="1200"></line><line x1="581" y1="0" x2="581" y2="1200"></line><line x1="661" y1="0" x2="661" y2="1200"></line><line x1="741" y1="0" x2="741" y2="1200"></line><line x1="821" y1="0" x2="821" y2="1200"></line><line x1="901" y1="0" x2="901" y2="1200"></line><line x1="981" y1="0" x2="981" y2="1200"></line><line x1="1061" y1="0" x2="1061" y2="1200"></line><line x1="1141" y1="0" x2="1141" y2="1200"></line><line x1="1221" y1="0" x2="1221" y2="1200"></line><line x1="1301" y1="0" x2="1301" y2="1200"></line><line x1="1381" y1="0" x2="1381" y2="1200"></line><line x1="1461" y1="0" x2="1461" y2="1200"></line><line x1="1541" y1="0" x2="1541" y2="1200"></line><line x1="1621" y1="0" x2="1621" y2="1200"></line><line x1="0" y1="40" x2="1642" y2="40"></line><line x1="0" y1="120" x2="1642" y2="120"></line><line x1="0" y1="200" x2="1642" y2="200"></line><line x1="0" y1="280" x2="1642" y2="280"></line><line x1="0" y1="360" x2="1642" y2="360"></line><line x1="0" y1="440" x2="1642" y2="440"></line><line x1="0" y1="520" x2="1642" y2="520"></line><line x1="0" y1="600" x2="1642" y2="600"></line><line x1="0" y1="680" x2="1642" y2="680"></line><line x1="0" y1="760" x2="1642" y2="760"></line><line x1="0" y1="840" x2="1642" y2="840"></line><line x1="0" y1="920" x2="1642" y2="920"></line><line x1="0" y1="1000" x2="1642" y2="1000"></line><line x1="0" y1="1080" x2="1642" y2="1080"></line><line x1="0" y1="1160" x2="1642" y2="1160"></line></g><g transform="translate(821 600)"><g transform="translate(-12 0)"><g className="sc-rise-10"><circle cx="-200" cy="-22" r="30" fill="currentColor" fillOpacity="0.06" strokeOpacity="0.75" strokeWidth="5"></circle><path d="M-212 -22 L-206 -33 L-200 -19 L-194 -33 L-188 -22" strokeWidth="5" strokeOpacity="0.8" className="sc-draw-50" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></path><rect x="-212" y="6" width="24" height="15" rx="3" fill="currentColor" fillOpacity="0.12" strokeOpacity="0.7" strokeWidth="4"></rect><line x1="-206" y1="25" x2="-194" y2="25" strokeWidth="5" strokeOpacity="0.6"></line><g className="sc-pop-90"><path d="M-200 -60 L-200 -74" strokeWidth="6" strokeOpacity="0.7"></path></g><g className="sc-pop-105"><path d="M-226 -44 L-236 -54" strokeWidth="6" strokeOpacity="0.7"></path></g><g className="sc-pop-120"><path d="M-174 -44 L-164 -54" strokeWidth="6" strokeOpacity="0.7"></path></g></g><g className="sc-rise-150"><g transform="translate(-160 -10)"><g className="sc-flow" style={{ animationDelay: '' }}><path d="M0 -12 L11 0 L0 12" strokeWidth="7" strokeOpacity="0.8"></path></g></g><g transform="translate(-144 -10)"><g className="sc-flow" style={{ animationDelay: '' }}><path d="M0 -12 L11 0 L0 12" strokeWidth="7" strokeOpacity="0.8"></path></g></g><g transform="translate(-128 -10)"><g className="sc-flow" style={{ animationDelay: '' }}><path d="M0 -12 L11 0 L0 12" strokeWidth="7" strokeOpacity="0.8"></path></g></g></g><g className="sc-rise-180"><rect x="-95" y="-100" width="210" height="190" rx="16" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.7" strokeWidth="5"></rect><g className="sc-pop-210"><text x="-70" y="-70" fontSize="24" fontWeight="700" fill="currentColor" fillOpacity="0.85" stroke="none" dominantBaseline="central" letterSpacing="0.68">EBOOK</text></g><line x1="38" y1="-70" x2="110" y2="-70" strokeWidth="11" strokeOpacity="0.3" className="sc-draw-230" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="-44" x2="90" y2="-44" strokeWidth="3" strokeOpacity="0.35" className="sc-draw-250" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="-18" x2="55" y2="-18" strokeWidth="10" strokeOpacity="0.6" className="sc-draw-280" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="8" x2="85" y2="8" strokeWidth="10" strokeOpacity="0.6" className="sc-draw-305" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><line x1="-70" y1="34" x2="35" y2="34" strokeWidth="10" strokeOpacity="0.6" className="sc-draw-330" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line></g><g className="sc-rise-360"><rect x="75" y="-50" width="190" height="150" rx="16" fill={isDark ? "#18181b" : "#ffffff"} strokeOpacity="0.8" strokeWidth="5"></rect><rect x="69" y="-56" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><rect x="259" y="-56" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><rect x="259" y="94" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><rect x="69" y="94" width="12" height="12" fill="currentColor" stroke="none" opacity="0.85"></rect><g className="sc-pop-390"><text x="95" y="-24" fontSize="28" fontWeight="600" fill="currentColor" fillOpacity="0.6" stroke="none" dominantBaseline="central" letterSpacing="0.56">Pro</text></g><g><line x1="128" y1="4" x2="210" y2="4" strokeWidth="10" strokeOpacity="0.65" className="sc-draw-395" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(107 4)"><g className="sc-pop-410"><rect x="-11" y="-11" width="22" height="22" rx="6" strokeOpacity="0.55" strokeWidth="4"></rect></g><g className="sc-pop-490"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="oklch(0.75 0.13 150)" fillOpacity="0.18" stroke="oklch(0.75 0.13 150)" strokeOpacity="0.95" strokeWidth="4"></rect><path d="M-6 0 L-2 4 L7 -5" stroke="oklch(0.75 0.13 150)" strokeWidth="5"></path></g></g></g><g><line x1="128" y1="34" x2="240" y2="34" strokeWidth="10" strokeOpacity="0.65" className="sc-draw-415" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(107 34)"><g className="sc-pop-430"><rect x="-11" y="-11" width="22" height="22" rx="6" strokeOpacity="0.55" strokeWidth="4"></rect></g><g className="sc-pop-530"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="oklch(0.75 0.13 150)" fillOpacity="0.18" stroke="oklch(0.75 0.13 150)" strokeOpacity="0.95" strokeWidth="4"></rect><path d="M-6 0 L-2 4 L7 -5" stroke="oklch(0.75 0.13 150)" strokeWidth="5"></path></g></g></g><g><line x1="128" y1="64" x2="188" y2="64" strokeWidth="10" strokeOpacity="0.65" className="sc-draw-435" pathLength="1" strokeDasharray="1" strokeDashoffset="1"></line><g transform="translate(107 64)"><g className="sc-pop-450"><rect x="-11" y="-11" width="22" height="22" rx="6" strokeOpacity="0.55" strokeWidth="4"></rect></g><g className="sc-pop-570"><rect x="-11" y="-11" width="22" height="22" rx="6" fill="oklch(0.75 0.13 150)" fillOpacity="0.18" stroke="oklch(0.75 0.13 150)" strokeOpacity="0.95" strokeWidth="4"></rect><path d="M-6 0 L-2 4 L7 -5" stroke="oklch(0.75 0.13 150)" strokeWidth="5"></path></g></g></g></g></g></g></svg>
                </div>
              </div>
              <div className="relative mt-4 space-y-1">
                <h2
                  className={`font-heading text-lg font-bold leading-snug transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Ebook Builder
                </h2>
                <p
                  className={`text-sm leading-relaxed transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Buat ebook premium dalam hitungan menit secara otomatis dengan bantuan AI, siap untuk dijual atau jadi lead magnet.
                </p>
              </div>
            </div>"""

if target_end in content:
    content = content.replace(target_end, new_card)
else:
    print("Could not find target_end")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

