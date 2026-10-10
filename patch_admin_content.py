with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "r") as f:
    content = f.read()

# Add import
content = content.replace(
    'setDefaultModel,',
    'setDefaultModel,\n  setFallbackModel,'
)

# Add fallback badge
badge_code = """
                      {model.isFallback && (
                        <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Cadangan</span>
                      )}
"""
content = content.replace(
    '<span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Default</span>\n                      )}',
    '<span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Default</span>\n                      )}' + badge_code
)

# Add fallback button
btn_code = """
                    {!model.isFallback && model.isActive && (
                      <button 
                        onClick={async () => { await setFallbackModel(model.id); mutate("pengaturan"); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        Set Alternatif
                      </button>
                    )}
"""
content = content.replace(
    'Set Default\n                      </button>\n                    )}',
    'Set Default\n                      </button>\n                    )}\n' + btn_code
)

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "w") as f:
    f.write(content)

print("AdminSettingsContent.tsx patched")
