import pandas as pd
import os
import json

folder = '/Users/anggasrimugiarahayu/Downloads/data'
files = [f for f in os.listdir(folder) if f.endswith('.xlsx') or f.endswith('.csv')]

all_records = []
excluded_title = "AKSES 8 JUTA++ PRODUK DIGITAL SIAP JUAL"

for f in files:
    path = os.path.join(folder, f)
    if f.endswith('.xlsx'):
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)
    
    # Check if expected columns exist
    if 'Buyer Email' not in df.columns:
        continue
        
    for index, row in df.iterrows():
        judul = str(row.get('Judul Barang', ''))
        status = str(row.get('Status', ''))
        email = str(row.get('Buyer Email', '')).strip().lower()
        name = str(row.get('Buyer Name (opsional)', ''))
        phone = str(row.get('Buyer Phone (Opsional)', ''))
        
        if pd.isna(name) or name == 'nan':
            name = ''
        if pd.isna(phone) or phone == 'nan':
            phone = ''
        if pd.isna(email) or email == 'nan' or not email or '@' not in email:
            continue
            
        if status.upper() != 'SUCCESS':
            continue
            
        if excluded_title in judul:
            continue
            
        all_records.append({
            'email': email,
            'name': name,
            'phone': phone,
            'product_lynkid': judul
        })

# deduplicate by email
unique_records = {}
for r in all_records:
    # keep the first occurrence or you can merge
    if r['email'] not in unique_records:
        unique_records[r['email']] = r

final_list = list(unique_records.values())

with open('migration_data.json', 'w') as out:
    json.dump(final_list, out, indent=2)

print(f"Extracted {len(final_list)} unique buyers.")
