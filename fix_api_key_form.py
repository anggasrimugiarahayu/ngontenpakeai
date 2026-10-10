import re

with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "r") as f:
    content = f.read()

# Add react-hot-toast import
if "react-hot-toast" not in content:
    content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport toast from "react-hot-toast";')

# Remove message state and add keyValue state
content = re.sub(
    r'const \[message, setMessage\] = useState[^\n]+;\n',
    r'const [keyValue, setKeyValue] = useState("");\n',
    content
)

# Fix handleSave
handleSave_new = """const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateApiKey(formData);

    if (result.success) {
      toast.success("API Key berhasil disimpan!");
      setKeyValue("");
      e.currentTarget.reset();
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsLoading(false);
  };"""
content = re.sub(r'const handleSave = async.*?setIsLoading\(false\);\n  };', handleSave_new, content, flags=re.DOTALL)

# Fix handleDelete
handleDelete_new = """const handleDelete = async () => {
    if (!await confirmSwal("Apakah kamu yakin ingin menghapus API Key ini? Fitur AI akan kembali menggunakan limit dari sistem Ngonten Pakai AI.")) {
      return;
    }

    setIsLoading(true);

    const result = await deleteApiKey();
    if (result.success) {
      toast.success("API Key berhasil dihapus!");
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
    setIsLoading(false);
  };"""
content = re.sub(r'const handleDelete = async.*?setIsLoading\(false\);\n  };', handleDelete_new, content, flags=re.DOTALL)

# Fix input field
input_old = """<input
            type="password"
            name="apiKey"
            placeholder="AIzaSy..."
            required
            className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />"""
input_new = """<input
            type="password"
            name="apiKey"
            placeholder="AIzaSy..."
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            required
            className="flex-1 w-full px-4 py-2.5 md:py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />"""
content = content.replace(input_old, input_new)

# Fix button disable state
button_old = """disabled={isLoading}"""
button_new = """disabled={isLoading || !keyValue.trim()}"""
content = content.replace(button_old, button_new, 1)

# Remove message div
content = re.sub(r'\{message && \([\s\S]*?</div>\n\s*\)\}\n', '', content)

with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "w") as f:
    f.write(content)
print("ApiKeyForm.tsx has been updated!")
