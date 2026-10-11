def remove_func(filepath):
    with open(filepath, "r") as f:
        lines = f.readlines()
        
    out = []
    in_func = False
    brace_count = 0
    
    for line in lines:
        if "const handleSaveAgendaFromBuilder = async () => {" in line:
            in_func = True
            brace_count = 1
            continue
            
        if in_func:
            brace_count += line.count('{')
            brace_count -= line.count('}')
            if brace_count == 0:
                in_func = False
            continue
            
        out.append(line)
        
    with open(filepath, "w") as f:
        f.writelines(out)

remove_func("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
remove_func("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
