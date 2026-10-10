import re

files = [
    "src/app/(app)/pengaturan/ApiKeyForm.tsx",
    "src/app/(app)/pengaturan/AdminSettingsContent.tsx"
]

new_helper = """const confirmSwal = async (text: string) => {
  const result = await Swal.fire({
    title: text,
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    width: '320px',
    padding: '1.25rem',
    buttonsStyling: false,
    customClass: {
      popup: 'font-sans rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121214] shadow-xl',
      title: 'text-sm font-medium text-gray-900 dark:text-white leading-relaxed',
      actions: 'w-full flex gap-2 mt-5 mb-0',
      confirmButton: 'flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors',
      cancelButton: 'flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-lg text-sm transition-colors',
    }
  });
  return result.isConfirmed;
};"""

pattern = re.compile(r'const confirmSwal = async \(text: string\) => \{[\s\S]*?return result\.isConfirmed;\n\};')

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    content = pattern.sub(new_helper, content)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")
