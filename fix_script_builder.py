with open("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx", "r") as f:
    content = f.read()

# Add import
content = content.replace(
    'import { getBlueprintAction } from "@/app/actions/blueprint";',
    'import { getBlueprintAction } from "@/app/actions/blueprint";\nimport { getContentCalendarAction } from "@/app/actions/toolsData";'
)

# Use SWR
content = content.replace(
    '  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);',
    '  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);\n  const { data: dbCalendar } = useSWR("contentCalendar", getContentCalendarAction);'
)

# Update the useEffect for localStorage to sync with DB
content = content.replace(
    '''  useEffect(() => {
    try {
      const saved = localStorage.getItem('calendarData');
      if (saved) setCalendarData(JSON.parse(saved));
    } catch(e) {}
  }, []);''',
    '''  useEffect(() => {
    if (dbCalendar) {
      setCalendarData(dbCalendar.data || {});
    } else {
      try {
        const saved = localStorage.getItem('calendarData');
        if (saved) setCalendarData(JSON.parse(saved));
      } catch(e) {}
    }
  }, [dbCalendar]);'''
)

with open("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx", "w") as f:
    f.write(content)
