import re

def clean(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Remove state declarations
    content = re.sub(r'const \[isSavingAgenda, setIsSavingAgenda\] = useState[^;]+;\n?', '', content)
    content = re.sub(r'const \[savedAgendaSuccess, setSavedAgendaSuccess\] = useState[^;]+;\n?', '', content)
    content = re.sub(r'const \[isScriptDatePickerOpen, setIsScriptDatePickerOpen\] = useState[^;]+;\n?', '', content)
    content = re.sub(r'const \[isAgendaFormOpen, setIsAgendaFormOpen\] = useState[^;]+;\n?', '', content)
    content = re.sub(r'const \[currentCalDate, setCurrentCalDate\] = useState[^;]+;\n?', '', content)
    content = re.sub(r'const \[selectedCalDate, setSelectedCalDate\] = useState[^;]+;\n?', '', content)
    
    # Remove agendaForm
    content = re.sub(r'const \[agendaForm, setAgendaForm\] = useState[^;]+;\n?', '', content)
    content = re.sub(r'topic: \'\',\n\s*script: \'\',\n\s*caption: \'\',\n\s*funnelStage: \'TOFU\'\n\s*\}\);\n?', '', content)

    # Remove handleSaveAgendaFromBuilder
    # This is a bit tricky, let's use a regex that matches from `const handleSaveAgendaFromBuilder` to `setIsSavingAgenda(false);\n    }\n  };`
    content = re.sub(r'const handleSaveAgendaFromBuilder = async \(\) => \{.*?\setIsSavingAgenda\(false\);\n\s*\}\n\s*\};\n', '', content, flags=re.DOTALL)
    content = re.sub(r'const handleSaveAgendaFromBuilder = async \(\) => \{.*?\setIsSavingAgenda\(false\);\n\s*\}\n\s*\};', '', content, flags=re.DOTALL)

    with open(filepath, "w") as f:
        f.write(content)

clean("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx")
clean("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx")
