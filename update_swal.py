import re

files = [
    "src/app/(app)/pengaturan/ApiKeyForm.tsx",
    "src/app/(app)/pengaturan/AdminSettingsContent.tsx"
]

new_helper = """const confirmSwal = async (text: string) => {
  const result = await Swal.fire({
    title: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Lanjutkan',
    cancelButtonText: 'Batal',
    width: '360px',
    padding: '1.5rem',
    buttonsStyling: false,
    customClass: {
      popup: 'font-sans rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121214]',
      title: 'text-base font-semibold text-gray-900 dark:text-white pt-2',
      htmlContainer: 'text-sm text-gray-500 dark:text-gray-400 m-0',
      icon: 'border-orange-500 text-orange-500 scale-75 mt-4 mb-0', 
      actions: 'w-full flex gap-3 mt-6',
      confirmButton: 'flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors',
      cancelButton: 'flex-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors',
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
