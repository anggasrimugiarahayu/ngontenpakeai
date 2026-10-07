const fs = require('fs');
const path = './src/app/(app)/pengaturan/admin-actions.ts';
let content = fs.readFileSync(path, 'utf8');

// We don't really need to patch admin-actions.ts because it just takes `...restData` and passes it to `prisma.digitalProduct.create` and `update`.
// Let's verify this.
