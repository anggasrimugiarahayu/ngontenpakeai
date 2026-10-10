with open("src/app/(app)/ruang-ngonten/[[...slug]]/page.tsx", "r") as f:
    page_content = f.read()

page_content = page_content.replace(
    'return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} nicheReferences={nicheReferences} />;',
    'return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} nicheReferences={nicheReferences} userImage={session?.user?.image} />;'
)

with open("src/app/(app)/ruang-ngonten/[[...slug]]/page.tsx", "w") as f:
    f.write(page_content)

with open("src/app/(app)/ruang-ngonten/WorkspaceApp.tsx", "r") as f:
    app_content = f.read()

app_content = app_content.replace(
    'nicheReferences?: any[];\n}',
    'nicheReferences?: any[];\n  userImage?: string | null;\n}'
)

app_content = app_content.replace(
    'export default function WorkspaceApp({ hasBlueprint, dbFeatures, isPro, isLoggedIn, nicheReferences }: Props) {',
    'export default function WorkspaceApp({ hasBlueprint, dbFeatures, isPro, isLoggedIn, nicheReferences, userImage }: Props) {'
)

app_content = app_content.replace(
    '<BioBuilderClient />',
    '<BioBuilderClient userImage={userImage} />'
)

with open("src/app/(app)/ruang-ngonten/WorkspaceApp.tsx", "w") as f:
    f.write(app_content)

print("Workspace patched for userImage")
