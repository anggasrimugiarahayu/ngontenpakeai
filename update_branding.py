with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace texts
content = content.replace('Ruang Ngonten', 'Ngonten Pakai AI')
content = content.replace('ruangcreativemuslim', 'ngontenpakaiai')

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
