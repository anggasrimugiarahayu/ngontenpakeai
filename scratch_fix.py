import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

target = """                  </div>
                </div>
              )
            </div>"""

replacement = """                  </div>
                </div>
              )}
            </div>"""

content = content.replace(target, replacement)

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
    f.write(content)
