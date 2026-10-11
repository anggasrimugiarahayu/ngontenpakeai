import re

text = """1.1.1 Perbandingan Akun Besar Dan Kecil
1.1.2 Kualitas Engagement Lebih Utama
1.2 Formula Dasar Rp10 Juta
1.2.1 Perhitungan Sederhana Konversi Penjualan
1.2.2 Menentukan Harga Produk Ideal

BAB 2: Pemetaan Audiens Dan Positioning
2.1 Menentukan Segmentasi Spesifik
2.1.1 Cara Menemukan Masalah Utama
2.1.2 Validasi Keinginan Membeli Pembaca
2.2 Membangun Personal Brand Kuat"""

clean = re.sub(r'\s+', '', text.lower())
print("clean string:", clean)

match = re.search(r'[bcdfghjklmnpqrstvwxyz]{5,}', clean)
if match:
    print("Found 5+ consonants:", match.group())
else:
    print("No 5+ consonants")
