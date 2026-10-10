import re

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "r") as f:
    content = f.read()

# Fix handleAddModel
content = content.replace(
    'await createAiModel(newModel);',
    'await createAiModel(newModel);\n    mutate("pengaturan");'
)

# Fix toggleModel
content = content.replace(
    'onClick={() => toggleModel(model.id, !model.isActive)}',
    'onClick={async () => { await toggleModel(model.id, !model.isActive); mutate("pengaturan"); }}'
)

# Fix setDefaultModel
content = content.replace(
    'onClick={() => setDefaultModel(model.id)}',
    'onClick={async () => { await setDefaultModel(model.id); mutate("pengaturan"); }}'
)

# Fix deleteModel
content = content.replace(
    'deleteModel(model.id);',
    'await deleteModel(model.id);\n                          mutate("pengaturan");'
)

with open("src/app/(app)/pengaturan/AdminSettingsContent.tsx", "w") as f:
    f.write(content)

print("Admin models interactivity patched!")
