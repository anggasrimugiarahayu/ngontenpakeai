with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "r") as f:
    content = f.read()

content = content.replace("e.currentTarget.reset();", "")

with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "w") as f:
    f.write(content)
print("Removed e.currentTarget.reset()")
