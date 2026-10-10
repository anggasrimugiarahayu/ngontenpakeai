with open("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx", "r") as f:
    content = f.read()

# Add import
if 'import { getContentCalendarAction }' not in content:
    content = content.replace(
        'import { getBlueprintAction } from "@/app/actions/blueprint";',
        'import { getBlueprintAction } from "@/app/actions/blueprint";\nimport { getContentCalendarAction } from "@/app/actions/toolsData";'
    )

# Use SWR
content = content.replace(
    '  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);',
    '  const { data: blueprint } = useSWR("blueprint", getBlueprintAction);\n  const { data: dbCalendar } = useSWR("contentCalendar", getContentCalendarAction);'
)

# Add useEffect to set initial data
injection = """  useEffect(() => {
    if (dbCalendar) {
      setCalendarData(dbCalendar.data || {});
    }
  }, [dbCalendar]);
"""

content = content.replace(
    '  const [activeScriptData, setActiveScriptData] = useState<any>(null);',
    '  const [activeScriptData, setActiveScriptData] = useState<any>(null);\n\n' + injection
)

with open("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx", "w") as f:
    f.write(content)
