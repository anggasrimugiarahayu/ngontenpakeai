with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'export default function BioBuilderClient() {\n  const { data: session } = useSession();\n  const userImage = session?.user?.image;',
    'export default function BioBuilderClient() {'
)

content = content.replace(
    'const { data: session } = useSession();',
    'const { data: session } = useSession();\n  const userImage = session?.user?.image;'
)

with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "w") as f:
    f.write(content)
