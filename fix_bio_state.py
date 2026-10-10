with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatarUrl || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");',
    'const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatarUrl || userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");'
)

with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "w") as f:
    f.write(content)
