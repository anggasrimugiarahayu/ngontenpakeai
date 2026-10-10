with open("src/app/(app)/ruang-ngonten/[[...slug]]/page.tsx", "r") as f:
    page_content = f.read()

page_content = page_content.replace(
    'const dbFeatures = await getCachedFeatures();',
    'const dbFeatures = await getCachedFeatures();\n  const nicheReferences = await prisma.nicheReference.findMany({ select: { id: true, nama: true, data: true } });'
)

page_content = page_content.replace(
    'return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} />;',
    'return <WorkspaceApp hasBlueprint={hasBlueprint} dbFeatures={dbFeatures} isPro={isPro} isLoggedIn={isLoggedIn} nicheReferences={nicheReferences} />;'
)

with open("src/app/(app)/ruang-ngonten/[[...slug]]/page.tsx", "w") as f:
    f.write(page_content)


with open("src/app/(app)/ruang-ngonten/WorkspaceApp.tsx", "r") as f:
    app_content = f.read()

app_content = app_content.replace(
    'isLoggedIn?: boolean;\n}',
    'isLoggedIn?: boolean;\n  nicheReferences?: any[];\n}'
)

app_content = app_content.replace(
    'export default function WorkspaceApp({ hasBlueprint, dbFeatures, isPro, isLoggedIn }: Props) {',
    'export default function WorkspaceApp({ hasBlueprint, dbFeatures, isPro, isLoggedIn, nicheReferences }: Props) {'
)

app_content = app_content.replace(
    '<MasterBlueprintClient />',
    '<MasterBlueprintClient nicheReferences={nicheReferences} />'
)

with open("src/app/(app)/ruang-ngonten/WorkspaceApp.tsx", "w") as f:
    f.write(app_content)

print("Files patched successfully")
