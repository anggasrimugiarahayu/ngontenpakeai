import re

def fix(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    start_str = '{/* Pop-up Pilih Tanggal Tayang */}'
    if start_str in content:
        start_idx = content.find(start_str)
        # Find the last </div>
        end_idx = content.rfind('</div>')
        if end_idx != -1:
            end_idx = content.rfind('</div>', 0, end_idx) # go one level up
            
            # actually let's just do a regex
            # Everything from {/* Pop-up Pilih Tanggal Tayang */} up to the last </div>
            new_content = content[:start_idx] + """
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
                f.write(new_content)

fix("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
fix("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
