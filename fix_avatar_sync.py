with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "r") as f:
    content = f.read()

injection = """
  // Sync session userImage to avatarUrl when session loads (if still placeholder)
  useEffect(() => {
    if (userImage && avatarUrl.includes('placehold.co')) {
      setAvatarUrl(userImage);
    }
  }, [userImage, avatarUrl]);
"""

# Insert it after the first useEffect
content = content.replace(
    '  const [loadingStep, setLoadingStep] = useState<"username" | "name" | "bio" | null>(null);',
    injection + '\n  const [loadingStep, setLoadingStep] = useState<"username" | "name" | "bio" | null>(null);'
)

# Also fix the initialData useEffect so it handles the case where DB saved the placeholder
content = content.replace(
    'setAvatarUrl(initialData.avatarUrl || userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");',
    'setAvatarUrl((initialData.avatarUrl && !initialData.avatarUrl.includes("placehold.co")) ? initialData.avatarUrl : (userImage || "https://placehold.co/150x150/e2e8f0/475569?text=Photo"));'
)

with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "w") as f:
    f.write(content)
