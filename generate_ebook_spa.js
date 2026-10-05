const fs = require('fs');

const originalPage = fs.readFileSync('temp_ebook_page.txt', 'utf8');

// 1. Generate page.tsx
const newPageCode = `import ReadEbookClient from "./ReadEbookClient";

export const dynamic = "force-dynamic";

export default async function ReadEbookPage({ params }: { params: { slug: string } }) {
  const slug = (await params).slug || params.slug;
  return <ReadEbookClient slug={slug} />;
}
`;
fs.writeFileSync('src/app/(app)/ruang-belajar/[slug]/page.tsx', newPageCode);

// 2. Generate ReadEbookClient.tsx
let clientCode = `"use client";\n\nimport { useState } from "react";\nimport useSWR from "swr";\nimport { getEbookDetailAction } from "@/app/actions/ruangBelajar";\nimport { useRouter } from "next/navigation";\n` + originalPage;

// Remove server imports and prisma
clientCode = clientCode.replace(/import prisma from "(.*?)";\n/g, '');
clientCode = clientCode.replace(/import { headers } from "next\/headers";\n/g, '');
clientCode = clientCode.replace(/import { auth } from "@\/auth";\n/g, '');
clientCode = clientCode.replace(/export const dynamic = "force-dynamic";\n/g, '');

// Rename function and props
clientCode = clientCode.replace(/export default async function ReadEbookPage(.*?) \{/, 'export default function ReadEbookClient({ slug }: { slug: string }) {');

// Remove server data fetching logic
const serverLogicRegex = /  const session = await auth\(\);(.*?)  let isLocked = true;\n  if \(isOwned\) isLocked = false;/s;

const clientLogic = `
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR(["ebookDetail", slug], () => getEbookDetailAction(slug));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !data) {
    return <div className="p-12 text-center animate-pulse flex flex-col items-center justify-center min-h-[50vh]"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div><p className="text-gray-500">Memuat E-Book...</p></div>;
  }

  if (data.notFound) {
    router.push('/ruang-belajar');
    return null;
  }

  const { ebook, isPro, isAdmin, ownedProductIds, userId } = data;
  
  const isFree = ebook.accessLevel === "FREE";
  const isProEbook = ebook.accessLevel === "PRO";
  const isPremiumEbook = ebook.accessLevel === "PREMIUM";
  
  const isOwned = ownedProductIds.includes(ebook.id) || isAdmin;
  let isLocked = !isOwned;
`;

clientCode = clientCode.replace(serverLogicRegex, clientLogic);

// Fix forms with inline server actions
clientCode = clientCode.replace(
  /<form action=\{async \(\) => \{\n                           "use server";\n                           await claimFreeEbook\(ebook.id\);\n                         \}\} className="w-full">/g,
  `<form action={async () => {
                           setIsSubmitting(true);
                           await claimFreeEbook(ebook.id);
                           mutate();
                           setIsSubmitting(false);
                         }} className="w-full">`
);

clientCode = clientCode.replace(
  /<form action=\{async \(\) => \{\n                               "use server";\n                               await claimFreeEbook\(ebook.id\);\n                             \}\} className="w-full flex flex-col gap-3">/g,
  `<form action={async () => {
                               setIsSubmitting(true);
                               await claimFreeEbook(ebook.id);
                               mutate();
                               setIsSubmitting(false);
                             }} className="w-full flex flex-col gap-3">`
);

// Add disabled state to buttons
clientCode = clientCode.replace(/<button type="submit" className="(.*?)"/g, '<button type="submit" disabled={isSubmitting} className="$1 ${isSubmitting ? \'opacity-50 cursor-not-allowed\' : \'\'}"');

fs.writeFileSync('src/app/(app)/ruang-belajar/[slug]/ReadEbookClient.tsx', clientCode);
console.log("Successfully generated SPA pages for Read Ebook");
