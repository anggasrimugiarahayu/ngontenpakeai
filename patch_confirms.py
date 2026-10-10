import re
import os

files = [
    "src/app/(app)/pengaturan/ApiKeyForm.tsx",
    "src/app/(app)/pengaturan/AdminSettingsContent.tsx"
]

helper = """
import Swal from 'sweetalert2';
const confirmSwal = async (text: string) => {
  const isDark = document.documentElement.classList.contains('dark');
  const result = await Swal.fire({
    title: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    background: isDark ? '#18181b' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
  });
  return result.isConfirmed;
};
"""

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    if "confirm(" not in content:
        continue

    # Add helper after imports
    # Find last import
    last_import_idx = content.rfind("import ")
    if last_import_idx != -1:
        end_of_line = content.find("\n", last_import_idx)
        content = content[:end_of_line] + "\n" + helper + content[end_of_line:]
    else:
        content = helper + "\n" + content

    # Replace onClick={() => { if (confirm ... ) with onClick={async () => { if (await confirmSwal ... )
    # This is tricky with regex, we can just globally replace `confirm(` with `await confirmSwal(`.
    # And manually fix any non-async closures if tsc complains.
    content = re.sub(r'confirm\(([^)]+)\)', r'await confirmSwal(\1)', content)
    
    # Check for `onClick={() => {` that now have `await` inside them
    # We will just do a brute force replace for onClick={() => { if (await
    content = content.replace("onClick={() => {\n                        if (await", "onClick={async () => {\n                        if (await")

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")
