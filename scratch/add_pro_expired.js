const fs = require('fs');
const path = './prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

// Add proToolsExpiredAt to User model
content = content.replace(
  /role\s+String\s+@default\("USER"\)/,
  'role             String            @default("USER")\n  proToolsExpiredAt DateTime?         @map("pro_tools_expired_at")'
);

fs.writeFileSync(path, content);
console.log("Updated schema.prisma");
