const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// I will completely replace the renderTimeline function with the new progress bar
const newTimelineCode = `
  const renderTimeline = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Langkah {step} dari 3</span>
          <span className="text-sm font-bold text-rn-accent">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-rn-accent h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: \`\${(step / 3) * 100}%\` }}
          ></div>
        </div>
      </div>
    );
  };
`;

const oldTimelineStart = code.indexOf('const renderTimeline = () => {');
const oldTimelineEnd = code.indexOf('const Mockup = () => (');
code = code.substring(0, oldTimelineStart) + newTimelineCode + "\n  " + code.substring(oldTimelineEnd);

// Now I will replace the Mockup component with the code from the old app
const newMockupCode = `
  const Mockup = () => (
    <div className="w-full max-w-[350px] mx-auto rounded-[12px] border border-gray-300 dark:border-white/20 overflow-hidden flex flex-col aspect-[9/19] bg-white dark:bg-black font-sans relative shadow-xl">
      {/* Nav Mockup */}
      <div className="px-4 pt-10 md:pt-12 pb-3 flex items-center justify-between bg-white dark:bg-black z-10 sticky top-0 border-b border-gray-100 dark:border-white/20 shrink-0 transition-colors">
        <ChevronLeft size={24} className="text-gray-900 dark:text-white shrink-0" />
        <div className="flex items-center gap-1 font-bold text-[15px] md:text-[17px] tracking-tight text-gray-900 dark:text-white truncate px-2">
          <span>@{selectedBio.username || 'username'}</span>
          <ChevronDown size={14} className="text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
        </div>
        <Menu size={24} className="text-gray-900 dark:text-white shrink-0" />
      </div>

      {/* Content Mockup */}
      <div className="p-4 flex-1 bg-white dark:bg-black overflow-y-auto scrollbar-hide transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="relative group shrink-0 ml-1">
            <div className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] rounded-full p-[2px] border border-gray-200 dark:border-white/20 overflow-hidden bg-white dark:bg-black">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 border-2 border-white dark:border-black shadow-sm z-10"><Camera size={14} /></button>
          </div>
          <div className="flex-1 flex justify-around text-center ml-2 md:ml-4">
            <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">12</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">posts</p></div>
            <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">1,204</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">followers</p></div>
            <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">432</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">following</p></div>
          </div>
        </div>

        <div className="mb-4 px-1">
          <p className="text-[13px] md:text-[14px] font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">{selectedBio.name || 'Nama Profil'}</p>
          <div className="text-[13px] md:text-[14px] text-gray-900 dark:text-white leading-[1.3] font-normal whitespace-pre-wrap">{selectedBio.bioText || 'Teks bio 3 baris yang mewakili nilai keunikan personal branding Anda akan dimuat di sini...'}</div>
        </div>

        <div className="flex gap-2 mb-5 px-1">
          <div className="flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] transition-all duration-200 border border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none">Edit profile</div>
          <div className="flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] transition-all duration-200 border border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none">Share profile</div>
        </div>

        <div className="flex gap-3 md:gap-4 pb-2 px-1 overflow-hidden">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full border border-gray-300 dark:border-white/40 p-0.5 flex items-center justify-center"><div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-800"></div></div>
                <span className="text-[10px] md:text-[11px] text-gray-800 dark:text-gray-400 font-medium">Highlight</span>
              </div>
            ))}
        </div>
      </div>

      {/* Footer Mockup */}
      <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-white/20 px-6 pt-3 pb-6 md:pb-8 flex justify-between items-center text-gray-900 dark:text-white mt-auto sticky bottom-0 shrink-0 transition-colors">
          <Home size={22} className="md:w-[26px] md:h-[26px]" />
          <Search size={22} className="md:w-[26px] md:h-[26px]" />
          <PlusSquare size={22} className="md:w-[26px] md:h-[26px]" />
          <Video size={22} className="md:w-[26px] md:h-[26px]" />
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-full overflow-hidden border border-gray-300 dark:border-white/40"><img src={avatarUrl} className="w-full h-full object-cover" alt="nav" /></div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
    </div>
  );
`;

const oldMockupStart = code.indexOf('const Mockup = () => (');
const oldMockupEnd = code.indexOf('return (', oldMockupStart);
code = code.substring(0, oldMockupStart) + newMockupCode + "\n  " + code.substring(oldMockupEnd);

// Don't forget to import the missing Lucide icons!
code = code.replace(
  /CheckCircle2, AlertCircle, Loader2, UserCircle, Type, AlignLeft, \n  RefreshCw, Camera, ChevronDown, Trash2, ArrowRight, ArrowLeft, Check/,
  'CheckCircle2, AlertCircle, Loader2, UserCircle, Type, AlignLeft, \n  RefreshCw, Camera, ChevronDown, Trash2, ArrowRight, ArrowLeft, Check, ChevronLeft, Menu, Home, Search, PlusSquare, Video'
);

fs.writeFileSync(file, code);
