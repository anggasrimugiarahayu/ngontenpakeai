import re

def fix(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Find the start of the modals
    if '{isScriptDatePickerOpen && (' in content:
        start_idx = content.find('{isScriptDatePickerOpen && (')
        content = content[:start_idx] + """
      <ScheduleToCalendarModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        defaultData={scheduleDefaultData}
      />
    </div>
  );
}
"""
        with open(filepath, "w") as f:
            f.write(content)

fix("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
fix("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
