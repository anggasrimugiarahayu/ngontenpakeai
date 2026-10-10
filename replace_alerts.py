import re
import os

files = [
    "src/app/(app)/ruang-ngonten/atm-builder/AtmBuilderClient.tsx",
    "src/app/(app)/pengaturan/AdminSettingsContent.tsx",
    "src/app/(app)/pengaturan/PricingConfigSection.tsx",
    "src/app/(app)/feedback/page.tsx",
    "src/app/(app)/ruang-belajar/[slug]/ReviewSection.tsx",
    "src/app/(app)/ruang-belajar/[slug]/EbookActions.tsx",
    "src/app/(app)/dashboard/WhatsAppModal.tsx"
]

def is_success_message(msg):
    msg = msg.lower()
    return "berhasil" in msg or "dibuat!" in msg or "disimpan!" in msg or "dihapus" in msg or "terima kasih" in msg

def process_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    if "alert(" not in content:
        return
        
    # Inject import if not there
    if 'import toast' not in content:
        # Find first import or just put at top
        match = re.search(r'^import .*$', content, re.MULTILINE)
        if match:
            content = content[:match.start()] + 'import toast from "react-hot-toast";\n' + content[match.start():]
        else:
            content = 'import toast from "react-hot-toast";\n' + content
            
    # Find all alert("...") or alert('...') calls
    # We will use regex to find alert( ) and replace based on the string inside
    
    def replacer(m):
        full_match = m.group(0)
        string_content = m.group(1) # with quotes
        inner_string = string_content[1:-1]
        
        if is_success_message(inner_string):
            return f"toast.success({string_content})"
        else:
            # Maybe warning or error. If it contains "Lengkapi" or "Pilih" it's warning/error
            return f"toast.error({string_content})"
            
    # regex matches alert("something") or alert('something')
    # it must match only literal strings for safety
    content = re.sub(r'alert\(\s*(["\'][^"\']+["\'])\s*\)', replacer, content)
    
    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Patched {filepath}")

for f in files:
    process_file(f)

