with open("src/app/(app)/ruang-ngonten/content-calendar/ContentCalendarClient.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'const [calendarData, setCalendarData] = useState<Record<string, any>>(initialData || {});',
    'const [calendarData, setCalendarData] = useState<Record<string, any>>(initialData?.data || {});'
)

content = content.replace(
    '''  useEffect(() => {
    if (initialData) {
      setCalendarData(initialData);
    }
  }, [initialData]);''',
    '''  useEffect(() => {
    if (initialData) {
      setCalendarData(initialData.data || {});
    }
  }, [initialData]);'''
)

with open("src/app/(app)/ruang-ngonten/content-calendar/ContentCalendarClient.tsx", "w") as f:
    f.write(content)
