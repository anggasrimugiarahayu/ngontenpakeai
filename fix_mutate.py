with open("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import useSWR from "swr";',
    'import useSWR, { mutate } from "swr";'
)

content = content.replace(
    '''      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newCalendarData })
      });''',
    '''      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newCalendarData })
      });
      mutate("contentCalendar");'''
)

with open("src/app/(app)/ruang-ngonten/script-builder/ScriptBuilderClient.tsx", "w") as f:
    f.write(content)


with open("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx", "r") as f:
    content2 = f.read()

content2 = content2.replace(
    'import useSWR from "swr";',
    'import useSWR, { mutate } from "swr";'
)

content2 = content2.replace(
    '''      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newCalendarData })
      });''',
    '''      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newCalendarData })
      });
      mutate("contentCalendar");'''
)

with open("src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx", "w") as f:
    f.write(content2)

with open("src/app/(app)/ruang-ngonten/content-calendar/ContentCalendarClient.tsx", "r") as f:
    content3 = f.read()

if 'mutate("contentCalendar")' not in content3:
    content3 = content3.replace(
        'import useSWR from "swr";',
        'import useSWR, { mutate } from "swr";'
    )
    content3 = content3.replace(
        '''      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newData })
      });''',
        '''      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarData: newData })
      });
      mutate("contentCalendar");'''
    )
    with open("src/app/(app)/ruang-ngonten/content-calendar/ContentCalendarClient.tsx", "w") as f:
        f.write(content3)
