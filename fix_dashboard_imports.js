const fs = require('fs');
const path = './src/app/(app)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import useSWR')) {
  content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport useSWR from 'swr';\nimport { getDashboardDataAction } from '@/app/actions/dashboard';"
  );
  fs.writeFileSync(path, content);
  console.log("Fixed DashboardClient");
}
