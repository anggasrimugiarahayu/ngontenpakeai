with open("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
imports = []
use_client_found = False

for line in lines:
    if line.strip() == '"use client";' or line.strip() == "'use client';":
        use_client_found = True
        new_lines.insert(0, line)
    elif line.startswith('import ScheduleToCalendarModal'):
        imports.append(line)
    else:
        new_lines.append(line)

# Insert the missing import after "use client";
if use_client_found:
    for imp in imports:
        new_lines.insert(1, imp)
else:
    new_lines.insert(0, '"use client";\n')
    for imp in imports:
        new_lines.insert(1, imp)

with open("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx", "w") as f:
    f.writelines(new_lines)
