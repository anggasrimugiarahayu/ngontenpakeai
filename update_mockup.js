const fs = require('fs');
const file = 'src/app/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add missing state variables and copy handler after `const fileInputRef = useRef<HTMLInputElement>(null);`
const stateInjectStr = `
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditingMockup, setIsEditingMockup] = useState(false);
  const [mockupBtnState, setMockupBtnState] = useState<'edit' | 'share' | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        autoSave(id, selectedBio, suggestions, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyProfile = () => {
    const profileText = \`Username: @\${selectedBio.username || 'username'}\\nName: \${selectedBio.name || 'Nama Profil'}\\nBio:\\n\${selectedBio.bioText || ''}\`;
    navigator.clipboard.writeText(profileText);
    showToast("Profil IG disalin ke clipboard!");
  };
`;
code = code.replace(`  const fileInputRef = useRef<HTMLInputElement>(null);`, stateInjectStr);

// 2. We need to replace the entire Mockup function up to the Footer Mockup.
const oldMockupStart = `  const Mockup = () => (`;
const oldMockupEnd = `      {/* Footer Mockup */}`;

const oldMockupStr = code.substring(code.indexOf(oldMockupStart), code.indexOf(oldMockupEnd));

const newMockupStr = `  const Mockup = () => (
    <div className="w-full max-w-[350px] lg:h-full mx-auto rounded-[12px] border border-gray-300 dark:border-white/20 overflow-hidden flex flex-col aspect-[9/19] bg-white dark:bg-black font-sans relative shadow-xl">
      {/* Nav Mockup */}
      <div className="px-4 pt-10 md:pt-12 pb-3 flex items-center justify-between bg-white dark:bg-black z-10 sticky top-0 border-b border-gray-100 dark:border-white/20 shrink-0 transition-colors">
        <ChevronLeft size={24} className="text-gray-900 dark:text-white shrink-0" />
        <div className="flex items-center gap-1 font-bold text-[15px] md:text-[17px] tracking-tight text-gray-900 dark:text-white truncate px-2">
          {isEditingMockup ? (
            <span>Edit Profile</span>
          ) : (
            <><span>@{selectedBio.username || 'username'}</span><ChevronDown size={14} className="text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" /></>
          )}
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
            <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 border-2 border-white dark:border-black shadow-sm z-10"><Camera size={14} /></button>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
          </div>
          {!isEditingMockup && (
            <div className="flex-1 flex justify-around text-center ml-2 md:ml-4">
              <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">12</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">posts</p></div>
              <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">1,204</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">followers</p></div>
              <div><p className="text-[15px] md:text-[17px] font-bold text-gray-900 dark:text-white leading-tight">432</p><p className="text-[11px] md:text-[13px] text-gray-800 dark:text-gray-400">following</p></div>
            </div>
          )}
        </div>

        <div className="mb-4 px-1">
          {isEditingMockup ? (
            <div className="space-y-4 mt-2 animate-in fade-in duration-200">
              <div>
                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Username</label>
                <div className="flex items-center bg-white dark:bg-black rounded-xl border border-gray-300 dark:border-white/40 shadow-none hover:border-gray-900 dark:hover:border-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px] focus-within:border-gray-900 dark:focus-within:border-white focus-within:bg-indigo-50 dark:focus-within:bg-gray-900 focus-within:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:focus-within:shadow-[3px_3px_0px_0px_#ffffff] focus-within:-translate-x-[2px] focus-within:-translate-y-[2px] px-3 py-2 transition-all duration-200">
                  <span className="text-gray-900 dark:text-white font-bold mr-1 text-[16px] md:text-[14px]">@</span>
                  <input 
                    type="text" value={selectedBio.username} 
                    onChange={(e) => { const val = e.target.value.toLowerCase().replace(/[^a-z]/g, ''); setSelectedBio(prev => ({...prev, username: val})); }}
                    className="outline-none bg-transparent text-[16px] md:text-[14px] font-bold text-gray-900 dark:text-white w-full placeholder-gray-400 dark:placeholder-gray-500" 
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Profile Name</label>
                <input 
                  type="text" maxLength={30} value={selectedBio.name} 
                  onChange={(e) => setSelectedBio(prev => ({...prev, name: e.target.value}))}
                  className="text-[16px] md:text-[14px] font-bold text-gray-900 dark:text-white tracking-tight w-full outline-none bg-white dark:bg-black px-3 py-2 rounded-xl border border-gray-300 dark:border-white/40 shadow-none hover:border-gray-900 dark:hover:border-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px] focus:border-gray-900 dark:focus:border-white focus:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:focus:shadow-[3px_3px_0px_0px_#ffffff] focus:-translate-x-[2px] focus:-translate-y-[2px] focus:bg-indigo-50 dark:focus:bg-gray-900 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500" placeholder="Profil Name IG"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Bio</label>
                  <span className={\`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded border \${selectedBio.bioText.length > 150 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/20'}\`}>{selectedBio.bioText.length}/150</span>
                </div>
                <textarea 
                  rows={4} value={selectedBio.bioText}
                  onChange={(e) => setSelectedBio(prev => ({...prev, bioText: e.target.value}))}
                  className={\`text-[13px] md:text-[14px] text-gray-900 dark:text-white font-bold w-full outline-none bg-white dark:bg-black px-3 py-2 rounded-xl resize-none transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 \${selectedBio.bioText.length > 150 ? 'border border-red-300 dark:border-red-500 focus:border-red-500 focus:bg-red-50 dark:focus:bg-red-900/20 focus:shadow-[3px_3px_0px_0px_#ef4444] dark:focus:shadow-[3px_3px_0px_0px_rgba(239,68,68,0.5)] focus:-translate-x-[2px] focus:-translate-y-[2px]' : 'border border-gray-300 dark:border-white/40 hover:border-gray-900 dark:hover:border-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px] focus:border-gray-900 dark:focus:border-white focus:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:focus:shadow-[3px_3px_0px_0px_#ffffff] focus:-translate-x-[2px] focus:-translate-y-[2px] focus:bg-indigo-50 dark:focus:bg-gray-900 shadow-none'}\`} placeholder="Teks Bio IG"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] md:text-[14px] font-bold text-gray-900 dark:text-white tracking-tight mb-0.5">{selectedBio.name || 'Nama Profil'}</p>
              <div className="text-[13px] md:text-[14px] text-gray-900 dark:text-white leading-[1.3] font-normal whitespace-pre-wrap">{selectedBio.bioText || 'Teks bio 3 baris yang mewakili nilai keunikan personal branding Anda akan dimuat di sini...'}</div>
            </>
          )}
        </div>

        <div className="flex gap-2 mb-5 px-1">
          <div 
            onClick={() => { 
              setMockupBtnState('edit');
              setTimeout(() => {
                if (isEditingMockup) autoSave(id, selectedBio, suggestions, avatarUrl); 
                setIsEditingMockup(!isEditingMockup); 
                setMockupBtnState(null);
              }, 200);
            }}
            className={\`flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] cursor-pointer transition-all duration-200 border \${mockupBtnState === 'edit' ? 'border-gray-900 dark:border-white bg-[#D0E206] dark:bg-[#D0E206] text-gray-900 dark:text-gray-900 shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:shadow-[3px_3px_0px_0px_#ffffff] -translate-x-[2px] -translate-y-[2px]' : 'border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none hover:border-gray-900 dark:hover:border-white hover:bg-white dark:hover:bg-black hover:text-gray-900 dark:hover:text-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px] active:!bg-[#D0E206] active:!border-gray-900 active:!text-gray-900 dark:active:!bg-[#D0E206] dark:active:!border-gray-900 dark:active:!text-gray-900'}\`}
          >{isEditingMockup ? 'Save profile' : 'Edit profile'}</div>
          <div 
            onClick={() => {
              setMockupBtnState('share');
              setTimeout(() => {
                setMockupBtnState(null);
                showToast('Fitur Bagikan Profil akan segera hadir!', 'success');
              }, 200);
            }}
            className={\`flex-1 rounded-xl py-2 text-center font-bold text-[12px] md:text-[13px] cursor-pointer transition-all duration-200 border \${mockupBtnState === 'share' ? 'border-gray-900 dark:border-white bg-[#D0E206] dark:bg-[#D0E206] text-gray-900 dark:text-gray-900 shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:shadow-[3px_3px_0px_0px_#ffffff] -translate-x-[2px] -translate-y-[2px]' : 'border-gray-300 dark:border-white/40 bg-white dark:bg-black text-gray-700 dark:text-white shadow-none hover:border-gray-900 dark:hover:border-white hover:bg-white dark:hover:bg-black hover:text-gray-900 dark:hover:text-white hover:shadow-[3px_3px_0px_0px_rgba(17,24,39,1)] dark:hover:shadow-[3px_3px_0px_0px_#ffffff] hover:-translate-x-[2px] hover:-translate-y-[2px] active:!bg-[#D0E206] active:!border-gray-900 active:!text-gray-900 dark:active:!bg-[#D0E206] dark:active:!border-gray-900 dark:active:!text-gray-900'}\`}
          >Share profile</div>
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
`;
code = code.replace(oldMockupStr, newMockupStr);

// 3. Add the "Copy Profile IG" button right below <Mockup /> in the Right Panel.
const mockupCallTarget = `<Mockup />
          </div>
        </div>
      </div>`;
const mockupCallReplacement = `<Mockup />
            
            {/* Copy Button */}
            <div className="w-full max-w-[350px] mt-4">
              <button 
                onClick={copyProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white bg-white dark:bg-black rounded-full font-bold transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-none dark:hover:shadow-[0px_0px_0px_0px_#ffffff] hover:translate-y-[4px] hover:translate-x-[4px] hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-gray-900 dark:hover:border-white font-heading text-sm md:text-base"
              >
                <Copy className="w-4 h-4" /> Copy Profile IG
              </button>
            </div>
          </div>
        </div>
      </div>`;
code = code.replace(mockupCallTarget, mockupCallReplacement);

// 4. Ensure Copy icon is imported from lucide-react if not already.
if (!code.includes("Copy,")) {
  code = code.replace(/import {([^}]+)} from "lucide-react";/, (match, group) => {
    return `import { Copy, ${group.trim()} } from "lucide-react";`;
  });
}

fs.writeFileSync(file, code);
