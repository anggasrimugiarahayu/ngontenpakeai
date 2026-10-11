import re

def fix(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # ScriptBuilder
    content = re.sub(
        r'setTimeout\(\(\) => \{\n\s*setScriptActionState\(null\);\n\s*setActiveScriptData\(ver\);\n\s*setIsScriptDatePickerOpen\(true\);\n\s*\}, 200\);',
        r'''setTimeout(() => {
                        setScriptActionState(null);
                        setScheduleDefaultData({
                          topic: ver.judul || '',
                          script: ver.script_sections ? ver.script_sections.map((s:any) => `[${s.label}]\\n${s.content}`).join('\\n\\n') : '',
                          caption: ver.caption || '',
                          funnelStage: 'TOFU'
                        });
                        setIsScheduleModalOpen(true);
                      }, 200);''',
        content,
        flags=re.DOTALL
    )

    # AtmBuilder
    content = re.sub(
        r'setTimeout\(\(\) => \{\n\s*setAtmActionState\(null\);\n\s*setActiveScriptData\(ver\);\n\s*setIsScriptDatePickerOpen\(true\);\n\s*\}, 200\);',
        r'''setTimeout(() => {
                        setAtmActionState(null);
                        let formattedScript = "";
                        try {
                          const parsed = JSON.parse(ver.script);
                          if (Array.isArray(parsed)) {
                            formattedScript = parsed.map((s: any) => `[${s.label}]\\n${s.content}`).join('\\n\\n');
                          } else {
                            formattedScript = ver.script;
                          }
                        } catch(e) {
                          formattedScript = ver.script;
                        }
                        setScheduleDefaultData({
                          topic: ver.topic || ver.judul || '',
                          script: formattedScript,
                          caption: '',
                          funnelStage: 'TOFU'
                        });
                        setIsScheduleModalOpen(true);
                      }, 200);''',
        content,
        flags=re.DOTALL
    )

    with open(filepath, "w") as f:
        f.write(content)

fix("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
fix("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
