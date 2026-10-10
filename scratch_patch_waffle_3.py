import sys

with open('src/app/(app)/dashboard/DashboardClient.tsx', 'r') as f:
    content = f.read()

target = "  };\n;\n  };\n\n  return ("
replace = "  };\n\n  return ("

if target in content:
    content = content.replace(target, replace)
    with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
        f.write(content)
    print("Fixed brace issue 1")
else:
    target2 = "  };\n  };\n\n  return ("
    if target2 in content:
        content = content.replace(target2, replace)
        with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
            f.write(content)
        print("Fixed brace issue 2")
    else:
        # Fallback regex
        import re
        content = re.sub(r'  };\n;\n  };\n', '  };\n', content)
        content = re.sub(r'  };\n  };\n', '  };\n', content)
        with open('src/app/(app)/dashboard/DashboardClient.tsx', 'w') as f:
            f.write(content)
        print("Used regex fallback")

