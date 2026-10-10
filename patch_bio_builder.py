with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "r") as f:
    content = f.read()

# 1. Update Props
content = content.replace(
    'export default function BioBuilderClient({ initialData }: { initialData?: any }) {',
    'export default function BioBuilderClient({ initialData, userImage }: { initialData?: any, userImage?: string | null }) {'
)

# 2. Update default avatar
content = content.replace(
    'const [avatarUrl, setAvatarUrl] = useState("https://placehold.co/150x150/e2e8f0/475569?text=Photo");',
    'const [avatarUrl, setAvatarUrl] = useState(userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");'
)

# 3. Update useEffect default avatar
content = content.replace(
    'setAvatarUrl(initialData.avatarUrl || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");',
    'setAvatarUrl(initialData.avatarUrl || userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");'
)

# 4. Replace handleAvatarUpload with compression logic
old_handle_upload = """
  const handleAvatarUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const resStr = ev.target.result as string;
          setAvatarUrl(resStr);
          autoSave(id, selectedBio, suggestions, resStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };
"""

new_handle_upload = """
  const handleAvatarUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            // Set max dimensions
            const MAX_WIDTH = 250;
            const MAX_HEIGHT = 250;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height *= MAX_WIDTH / width));
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width *= MAX_HEIGHT / height));
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Compress heavily
            const resStr = canvas.toDataURL("image/jpeg", 0.6);
            setAvatarUrl(resStr);
            autoSave(id, selectedBio, suggestions, resStr);
          };
          img.src = ev.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };
"""

content = content.replace(old_handle_upload.strip(), new_handle_upload.strip())

with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "w") as f:
    f.write(content)

print("BioBuilderClient patched")
