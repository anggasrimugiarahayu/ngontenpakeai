import re

def refactor_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # 1. Add Import
    if 'ScheduleToCalendarModal' not in content:
        content = content.replace(
            'import React, { useState, useEffect, useRef } from "react";',
            'import React, { useState, useEffect, useRef } from "react";\nimport ScheduleToCalendarModal from "@/components/ui/ScheduleToCalendarModal";'
        )
    
    # 2. Inject Modal state
    modal_state = """
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDefaultData, setScheduleDefaultData] = useState<{topic: string, script: string, caption?: string, funnelStage?: string} | null>(null);
"""
    if 'isScheduleModalOpen' not in content:
        content = content.replace(
            'const [activeScriptData, setActiveScriptData] = useState<any>(null);',
            'const [activeScriptData, setActiveScriptData] = useState<any>(null);\n' + modal_state
        )

    # 3. Replace the button click in ScriptBuilder (has msg and vidx)
    # The old button did: setIsScriptDatePickerOpen(true) and setActiveScriptData(v)
    if 'ScriptBuilderClient' in filepath:
        content = re.sub(
            r'onClick=\{\(\) => \{[^}]*setIsScriptDatePickerOpen\(true\)[^}]*\}\}',
            r'''onClick={() => {
                      setScheduleDefaultData({
                        topic: v.judul,
                        script: v.script_sections ? v.script_sections.map((s:any) => `[${s.label}]\\n${s.content}`).join('\\n\\n') : '',
                        caption: v.caption || '',
                        funnelStage: 'TOFU'
                      });
                      setIsScheduleModalOpen(true);
                    }}''',
            content,
            flags=re.DOTALL
        )
    elif 'AtmBuilderClient' in filepath:
        content = re.sub(
            r'onClick=\{\(\) => \{[^}]*setIsScriptDatePickerOpen\(true\)[^}]*\}\}',
            r'''onClick={() => {
                      let formattedScript = "";
                      try {
                        const parsed = JSON.parse(v.script);
                        if (Array.isArray(parsed)) {
                          formattedScript = parsed.map((s: any) => `[${s.label}]\\n${s.content}`).join('\\n\\n');
                        } else {
                          formattedScript = v.script;
                        }
                      } catch(e) {
                        formattedScript = v.script;
                      }
                      setScheduleDefaultData({
                        topic: v.topic || v.judul || '',
                        script: formattedScript,
                        caption: '',
                        funnelStage: 'TOFU'
                      });
                      setIsScheduleModalOpen(true);
                    }}''',
            content,
            flags=re.DOTALL
        )

    # 4. Remove old JSX modals (DatePicker and AgendaForm)
    # We can just remove everything from `{/* Pop-up Pilih Tanggal Tayang */}` down to the end of the file except the closing tags
    # Or just replace the old modals with the new `<ScheduleToCalendarModal />`
    
    # Let's find a safe anchor
    if '{/* Pop-up Pilih Tanggal Tayang */}' in content:
        start_idx = content.find('{/* Pop-up Pilih Tanggal Tayang */}')
        end_idx = content.rfind('</div>\n    </div>\n  );\n}')
        if end_idx == -1:
            end_idx = content.rfind('</div>\n    </div>\n  )\n}')
        if start_idx != -1 and end_idx != -1:
            content = content[:start_idx] + """
      <ScheduleToCalendarModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        defaultData={scheduleDefaultData}
      />
""" + content[end_idx:]

    with open(filepath, "w") as f:
        f.write(content)

refactor_file("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
refactor_file("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
