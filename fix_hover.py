with open("src/app/(app)/ruang-ngonten/ClientLayout.tsx", "r") as f:
    content = f.read()

import_str = """import { getDashboardDataAction } from "@/app/actions/dashboard";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";
import { getBlueprintAction } from "@/app/actions/blueprint";
import { getBioBuilderAction, getContentCalendarAction } from "@/app/actions/toolsData";"""

# replace the imports
old_imports = """import { getDashboardDataAction } from "@/app/actions/dashboard";
import { getPengaturanDataAction } from "@/app/actions/pengaturan";
import { getRuangBelajarDataAction } from "@/app/actions/ruangBelajar";"""

if old_imports in content:
    content = content.replace(old_imports, import_str)
else:
    print("WARNING: Could not find old imports.")

old_handle = """const handleHoverPrefetch = (href: string) => {
  if (href === '/dashboard') {
    preload("dashboard", getDashboardDataAction);
  } else if (href === '/pengaturan') {
    preload("pengaturan", getPengaturanDataAction);
  } else if (href === '/ruang-belajar') {
    preload("ruangBelajar", getRuangBelajarDataAction);
  }
};"""

new_handle = """const handleHoverPrefetch = (href: string) => {
  if (href === '/dashboard') {
    preload("dashboard", getDashboardDataAction);
  } else if (href === '/pengaturan') {
    preload("pengaturan", getPengaturanDataAction);
  } else if (href === '/ruang-belajar') {
    preload("ruangBelajar", getRuangBelajarDataAction);
  } else if (href.startsWith('/ruang-ngonten/')) {
    preload("blueprint", getBlueprintAction);
    
    if (href === '/ruang-ngonten/bio-builder') {
      preload("bioBuilder", getBioBuilderAction);
    } else if (href === '/ruang-ngonten/content-calendar' || href === '/ruang-ngonten/script-builder' || href === '/ruang-ngonten/atm-builder') {
      preload("contentCalendar", getContentCalendarAction);
    }
  }
};"""

if old_handle in content:
    content = content.replace(old_handle, new_handle)
else:
    print("WARNING: Could not find old handleHoverPrefetch.")

with open("src/app/(app)/ruang-ngonten/ClientLayout.tsx", "w") as f:
    f.write(content)
