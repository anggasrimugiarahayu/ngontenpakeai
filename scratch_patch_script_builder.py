import re

with open('src/app/api/script-builder/generate/route.ts', 'r') as f:
    content = f.read()

# Add imports if not exist
if "import { promises as fs }" not in content:
    content = "import { promises as fs } from 'fs';\nimport path from 'path';\n" + content

# Replace fetchKnowledgeBase
pattern = re.compile(r'async function fetchKnowledgeBase\(\) \{[\s\S]*?return \{[\s\S]*?\};\n\}')

replacement = """async function fetchKnowledgeBase() {
  const kbDir = path.join(process.cwd(), 'public', 'knowledge_database');
  const [hooksRes, ctaRes] = await Promise.all([
    fs.readFile(path.join(kbDir, 'hooks.txt'), 'utf-8'),
    fs.readFile(path.join(kbDir, 'cta_ctv.txt'), 'utf-8')
  ]);
  return {
    hooks: hooksRes,
    cta: ctaRes
  };
}"""

content = pattern.sub(replacement, content)

with open('src/app/api/script-builder/generate/route.ts', 'w') as f:
    f.write(content)

