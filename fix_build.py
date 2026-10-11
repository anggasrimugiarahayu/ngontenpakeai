import re

def fix(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # The handleSaveAgendaFromBuilder function is still there!
    # Let's remove it entirely
    content = re.sub(r'const handleSaveAgendaFromBuilder = async \(\) => \{.*?\setIsSavingAgenda\(false\);\n\s*\}\n\s*\};\n', '', content, flags=re.DOTALL)
    
    # Just in case, let's also remove any remaining onClick={() => setIsScriptDatePickerOpen(true)}
    content = re.sub(r'onClick=\{\(\) => setIsScriptDatePickerOpen\(true\)\}', 'onClick={() => {}}', content)

    # Atm builder doesn't have handleSaveAgendaFromBuilder, it has handleSaveAgendaFromAtm?
    content = re.sub(r'const handleSaveAgendaFromAtm = async \(\) => \{.*?\setIsSavingAgenda\(false\);\n\s*\}\n\s*\};\n', '', content, flags=re.DOTALL)

    # In ATM builder, there might be missing ScheduleToCalendarModal import
    if 'ScheduleToCalendarModal' not in content and 'AtmBuilderClient' in filepath:
        content = content.replace(
            'import React, { useState, useEffect, useRef } from "react";',
            'import React, { useState, useEffect, useRef } from "react";\nimport ScheduleToCalendarModal from "@/components/ui/ScheduleToCalendarModal";'
        )

    with open(filepath, "w") as f:
        f.write(content)

fix("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
fix("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
