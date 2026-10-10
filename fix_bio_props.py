with open("src/app/(app)/ruang-ngonten/WorkspaceApp.tsx", "r") as f:
    app_content = f.read()

app_content = app_content.replace(
    '<BioBuilderClient userImage={userImage} />',
    '<BioBuilderClient />'
)

with open("src/app/(app)/ruang-ngonten/WorkspaceApp.tsx", "w") as f:
    f.write(app_content)

with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "r") as f:
    bio_content = f.read()

bio_content = bio_content.replace(
    'export default function BioBuilderClient() {',
    'export default function BioBuilderClient() {\n  const { data: session } = useSession();\n  const userImage = session?.user?.image;'
)

with open("src/app/(app)/ruang-ngonten/bio-builder/BioBuilderClient.tsx", "w") as f:
    f.write(bio_content)

print("Props fixed")
