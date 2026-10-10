import re

with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'r') as f:
    content = f.read()

# Replace state and handleSaveApiKey
state_replacement = """  const initialApiKey = settings.find((s:any) => s.key === "DEFAULT_GEMINI_API_KEY")?.value || "";
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [savedKey, setSavedKey] = useState(initialApiKey);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    await saveAppSetting("DEFAULT_GEMINI_API_KEY", apiKey);
    setSavedKey(apiKey);
    alert("API Key berhasil disimpan!");
    setLoading(false);
  };

  const handleDeleteApiKey = async () => {
    if (!confirm("Yakin ingin menghapus API Key Global?")) return;
    setLoading(true);
    await deleteAppSetting("DEFAULT_GEMINI_API_KEY");
    setApiKey("");
    setSavedKey("");
    alert("API Key berhasil dihapus!");
    setLoading(false);
  };

  const getMaskedKey = (key: string) => {
    if (!key) return "";
    if (key.length < 10) return "••••••••••••••••";
    return key.substring(0, 6) + "••••••••••••••••" + key.substring(key.length - 4);
  };"""

state_pattern = re.compile(r'  const \[apiKey, setApiKey\] = useState.*?;\n\n  const handleSaveApiKey = async \(\) => \{\n    setLoading\(true\);\n    await saveAppSetting.*?;\n    alert.*?\n    setLoading\(false\);\n  \};\n', re.DOTALL)
content = state_pattern.sub(state_replacement + "\n", content)

# Now replace the UI block
ui_pattern = re.compile(r'<div className="space-y-4">\n            <div>\n              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Gemini API Key</label>\n              <input \n                type="password" \n                value=\{apiKey\}\n                onChange=\{e => setApiKey\(e\.target\.value\)\}\n                placeholder="AIzaSy\.\.\." \n                className="w-full bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2\.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"\n              />\n            </div>\n            <button \n              onClick=\{handleSaveApiKey\} \n              disabled=\{loading\}\n              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2\.5 rounded-lg text-sm transition-colors disabled:opacity-50"\n            >\n              Simpan API Key\n            </button>\n          </div>')

ui_replacement = """<div className="space-y-4">
            {savedKey && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">API Key Terpasang & Aktif</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-mono mt-0.5">{getMaskedKey(savedKey)}</p>
                  </div>
                </div>
                <button 
                  onClick={handleDeleteApiKey}
                  disabled={loading}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                >
                  Hapus API Key
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {savedKey ? "Ganti API Key Global" : "Masukkan API Key Global Baru"}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Mulai dengan AIzaSy..." 
                  className="w-full flex-1 bg-gray-50 dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
                <button 
                  onClick={handleSaveApiKey} 
                  disabled={loading || !apiKey.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                >
                  {savedKey ? "Timpa (Overwrite)" : "Simpan API Key"}
                </button>
              </div>
              {savedKey && (
                <p className="text-xs text-gray-500 mt-2">
                  Memasukkan dan menyimpan kunci baru akan otomatis menghapus (menimpa) kunci yang lama.
                </p>
              )}
            </div>
          </div>"""

content = ui_pattern.sub(ui_replacement, content)

with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'w') as f:
    f.write(content)

