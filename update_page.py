import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Remove Ebook Card
content = re.sub(r'\{\/\* EBOOK CARD \*\/\}.*?(?=\{\/\* TOOLS CARD \*\/|\{\/\* E-LEARNING CARD \*\/)', '', content, flags=re.DOTALL)

# Remove Tools Card
content = re.sub(r'\{\/\* TOOLS CARD \*\/\}.*?(?=\{\/\* E-LEARNING CARD \*\/)', '', content, flags=re.DOTALL)

# Let's change Ruang Ngonten to Ngonten Pakai AI
content = content.replace('Ruang Ngonten', 'Ngonten Pakai AI')
content = content.replace('ruangcreativemuslim', 'ngontenpakaiai')

# Let's remove the pricing section altogether, or just remove the specific packages.
# The user wants "hanya LPnya saya dan terapkan di ngonten pake ai ini"
# Let's just remove the Ebook and Tools pricing cards
content = re.sub(r'\{\/\* PAKET EBOOK BASIC \*\/\}.*?(?=\{\/\* PAKET TOOLS \*\/)', '', content, flags=re.DOTALL)
content = re.sub(r'\{\/\* PAKET TOOLS \*\/\}.*?(?=\{\/\* PAKET EBOOK LENGKAP \*\/)', '', content, flags=re.DOTALL)
content = re.sub(r'\{\/\* PAKET EBOOK LENGKAP \*\/\}.*?(?=<\/div>\s*<\/main>\s*\)} )', '', content, flags=re.DOTALL)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
