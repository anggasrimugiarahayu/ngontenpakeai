import re

def process_match(m):
    dark_classes_str = m.group(1)
    light_classes_str = m.group(2)
    
    light_classes = light_classes_str.split()
    dark_classes = dark_classes_str.split()
    
    dark_classes_prefixed = ["dark:" + c for c in dark_classes]
    
    return " ".join(light_classes + dark_classes_prefixed)

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Replace ${isDark ? "..." : "..."}
content = re.sub(r'\$\{isDark \? "([^"]+)" : "([^"]+)"\}', process_match, content)

with open("src/app/page.tsx", "w") as f:
    f.write(content)
