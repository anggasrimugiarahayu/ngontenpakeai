import re

text = """[SYSTEM AUTO-SUBMIT] Saya telah menyetujui Outline ini. Tolong jalankan MODE C (Prompt Production) dan cetak Master Prompt berupa block-block terpisah untuk diberikan ke ChatGPT/Claude berdasarkan Outline final berikut:

1.1.1 Perbandingan Akun Besar Dan Kecil
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
    print("Rule 2 (5+ consonants):", match.group())

match3 = re.search(r'(.)\1{3,}', clean)
if match3:
    print("Rule 3 (repetition):", match3.group())

match4 = re.search(r'(asd|qwe|zxc|fgh|jkl|das|dsa|ewq|cxz|dad|adad|sada){2,}', clean)
if match4:
    print("Rule 4 (mash):", match4.group())
