const fs = require('fs');
const path = './src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const useEffectHook = `
  useEffect(() => {
    if (initialData) {
      setId(initialData.id);
      setSelectedBio({
        username: initialData.username || "",
        name: initialData.profileName || "",
        bioText: initialData.bioText || ""
      });
      setAvatarUrl(initialData.avatarUrl || "https://placehold.co/150x150/e2e8f0/475569?text=Photo");
      setSuggestions({
        usernames: initialData.suggestions?.usernames || null,
        names: initialData.suggestions?.names || null,
        bios: initialData.suggestions?.bios || null
      });
      if (initialData.profileName) setStep(3);
      else if (initialData.username) setStep(2);
      else setStep(1);
    }
  }, [initialData]);
`;

content = content.replace(
  'const [loadingStep, setLoadingStep] = useState<"username" | "name" | "bio" | null>(null);',
  useEffectHook + '\n  const [loadingStep, setLoadingStep] = useState<"username" | "name" | "bio" | null>(null);'
);

fs.writeFileSync(path, content);
console.log("Patched BioBuilderClient useEffect");
