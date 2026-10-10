with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "r") as f:
    admin = f.read()

admin = admin.replace(
    'placeholder="AIzaSy..."',
    'placeholder="AIzaSy..."\n                autoComplete="new-password"\n                name="adminApiKey"'
)

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "w") as f:
    f.write(admin)

with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "r") as f:
    user = f.read()

user = user.replace(
    'name="apiKey"',
    'name="apiKey"\n            autoComplete="new-password"'
)

with open("src/app/(app)/pengaturan/ApiKeyForm.tsx", "w") as f:
    f.write(user)

print("Autofill prevented!")
