import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Increase container max-width to give cards more space
content = content.replace('max-w-6xl', 'max-w-7xl')

# Change aspect ratios
content = content.replace('aspect-[344/145] lg:aspect-[4/3]', 'aspect-[16/9]')

# Shorten descriptions
desc_map = {
    'Meracik Positioning & Identity, Brand Foundation, Content & Business Strategy, hingga Audience Psychology secara otomatis dari informasi yang kamu berikan.':
    'Meracik otomatis Brand Foundation, Strategy, dan Audience Psychology dari idemu.',
    
    'Membantu kamu merumuskan halaman profile IG (Username, Headline Name, dan Bio) yang menarik sesuai dengan niche dari Master Blueprint.':
    'Rumuskan profil IG (Username, Headline, Bio) menarik yang sesuai dengan niche secara presisi.',
    
    'Temukan cara termudah mencari ide konten, membuat script, ATM konten, mendesain carousel, dan menyusun content calendar harianmu.':
    'Mudah mencari ide, membuat script, desain carousel, hingga susun content calendar.',
    
    'Buat ebook premium dalam hitungan menit secara otomatis dengan bantuan AI, siap untuk dijual atau jadi lead magnet.':
    'Buat ebook premium dalam hitungan menit, siap untuk dijual atau sebagai lead magnet.'
}

for old, new in desc_map.items():
    content = content.replace(old, new)

# To ensure the SVGs fit properly in 16/9, we might want to tweak the iso-stage widths, but let's test it first.
with open('src/app/page.tsx', 'w') as f:
    f.write(content)
