const fs = require('fs');
const path = './src/app/(app)/pengaturan/AdminSettingsContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// The block for createProduct is lines 605-632
// The block for updateProduct is lines 853-875

const newCreatePayload = `              await createProduct({
                title: formData.get("title") as string,
                slug: formData.get("slug") as string,
                categoryId: formData.get("categoryId") as string,
                description: formData.get("description") as string,
                coverUrl: uploadedUrls["coverUrlInput"] || formData.get("coverUrl") as string,
                coverUrl2: uploadedUrls["coverUrl2Input"] || formData.get("coverUrl2") as string,
                coverUrl3: uploadedUrls["coverUrl3Input"] || formData.get("coverUrl3") as string,
                fileUrl: formData.get("fileUrl") as string,
                accessLevel: formData.get("accessLevel") as string,
                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",
                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,
                isDownloadable: formData.get("isDownloadable") === "on",
                language: formData.get("language") as string,
                formatType: formData.get("formatType") as string,
                author: formData.get("author") as string,
                pageCount: formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : 0,
                originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0
              });`;

const newUpdatePayload = `              await updateProduct(editingProduct.id, {
                title: formData.get("title") as string,
                slug: formData.get("slug") as string,
                categoryId: formData.get("categoryId") as string,
                description: formData.get("description") as string,
                coverUrl: uploadedUrls["editCoverUrlInput"] || formData.get("coverUrl") as string,
                coverUrl2: uploadedUrls["editCoverUrl2Input"] || formData.get("coverUrl2") as string,
                coverUrl3: uploadedUrls["editCoverUrl3Input"] || formData.get("coverUrl3") as string,
                fileUrl: formData.get("fileUrl") as string,
                accessLevel: formData.get("accessLevel") as string,
                isProOnly: formData.get("accessLevel") === "PRO" || formData.get("accessLevel") === "PREMIUM",
                price: formData.get("price") ? parseInt(formData.get("price") as string) : 0,
                isDownloadable: formData.get("isDownloadable") === "on",
                language: formData.get("language") as string,
                formatType: formData.get("formatType") as string,
                author: formData.get("author") as string,
                pageCount: formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : 0,
                originalPrice: formData.get("originalPrice") ? parseInt(formData.get("originalPrice") as string) : 0
              });`;

content = content.replace(/await createProduct\(\{[\s\S]*?\}\);/, newCreatePayload);
content = content.replace(/await updateProduct\(editingProduct\.id, \{[\s\S]*?\}\);/, newUpdatePayload);

fs.writeFileSync(path, content);
console.log("Replaced payloads");
