import re

def fix(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # We need to replace the try-catch and setScheduleDefaultData block
    old_block_pattern = r'let formattedScript = "";\n\s*try \{.*?\n\s*\}\n\s*setScheduleDefaultData\(\{\n\s*topic: ver\.topic \|\| ver\.judul \|\| \'\',\n\s*script: formattedScript,\n\s*caption: \'\',\n\s*funnelStage: \'TOFU\'\n\s*\}\);'
    
    new_block = """let formattedScript = "";
                        if (ver.sections) {
                          ver.sections.forEach((sec: any) => { formattedScript += `[${sec.label}]\\n${sec.content}\\n\\n`; });
                        } else if (ver.hook || ver.bridge || ver.body || ver.cta) {
                          formattedScript = `[HOOK]\\n${ver.hook || ''}\\n\\n[FORESHADOW]\\n${ver.bridge || ''}\\n\\n[BODY]\\n${ver.body || ''}\\n\\n[CTA]\\n${ver.cta || ''}\\n\\n`;
                        } else {
                          formattedScript = ver.script || ver.content || '';
                        }
                        
                        setScheduleDefaultData({
                          topic: ver.judul_internal ? ver.judul_internal.replace(/^Versi\\s*\\d+\\s*[-:]*\\s*/i, '') : (ver.topic || ver.judul || 'Ide Konten'),
                          script: formattedScript.trim(),
                          caption: ver.caption || '',
                          funnelStage: 'TOFU'
                        });"""
                        
    content = re.sub(old_block_pattern, new_block, content, flags=re.DOTALL)

    with open(filepath, "w") as f:
        f.write(content)

fix("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
