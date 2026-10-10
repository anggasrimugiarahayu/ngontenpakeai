with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'r') as f:
    content = f.read()

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

content = content.replace(helper, "")
content = content.replace('} from "./admin-actions";', '} from "./admin-actions";' + helper)

with open('src/app/(app)/pengaturan/AdminSettingsContent.tsx', 'w') as f:
    f.write(content)
