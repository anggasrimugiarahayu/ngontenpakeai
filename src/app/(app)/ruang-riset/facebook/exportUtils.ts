import { FacebookPostItem, FacebookUserProfile } from "./types";
import JSZip from "jszip";

export const FACEBOOK_EXPORT_HEADERS = [
  "No",
  "Halaman Facebook",
  "Deskripsi / Caption Postingan",
  "Tipe Konten",
  "Views / Tayangan",
  "Likes / Reaksi",
  "Comments / Komentar",
  "Shares / Dibagikan",
  "Outlier Score",
  "Tingkat Viralitas",
  "Durasi",
  "Tanggal Publikasi",
  "Link Postingan",
  "ID Postingan",
];

const escapeCSV = (str: string | number | undefined | null) => {
  if (str === undefined || str === null) return '""';
  const stringified = String(str).replace(/"/g, '""');
  return `"${stringified}"`;
};

const cleanTextForTSV = (str: string | number | undefined | null) => {
  if (str === undefined || str === null) return "";
  return String(str).replace(/[\t\r\n]+/g, " ").trim();
};

export function getFacebookExportRows(
  posts: FacebookPostItem[],
  profile: FacebookUserProfile
) {
  return posts.map((post, idx) => {
    const tierLabel =
      post.outlierTier === "super_viral"
        ? "Super Viral (>=10x)"
        : post.outlierTier === "viral"
        ? "Viral (>=4x)"
        : post.outlierTier === "high"
        ? "Tinggi (>=1.8x)"
        : "Normal (<1.8x)";

    return {
      no: idx + 1,
      channel: `@${profile.username} (${profile.name})`,
      title: post.title,
      type: post.isPhoto ? "Foto / Postingan" : "Reels / Video",
      views: post.viewsCount,
      likes: post.likesCount,
      comments: post.commentsCount,
      shares: post.sharesCount || 0,
      outlierScore: post.outlierScore.toFixed(1) + "x",
      tierLabel,
      duration: post.duration || "-",
      published: post.publishedText || "-",
      permalink: post.permalink,
      postId: post.id,
    };
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadMediaAsset(
  url: string,
  filename: string
): Promise<boolean> {
  try {
    let fetchUrl = url;
    if (
      !url.startsWith("/api/ruang-riset/image-proxy") &&
      (url.includes("fbcdn.net") || url.includes("facebook.com"))
    ) {
      fetchUrl = `/api/ruang-riset/image-proxy?url=${encodeURIComponent(url)}`;
    }
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error("Gagal mengambil media");
    const blob = await res.blob();
    triggerDownload(blob, filename);
    return true;
  } catch (err) {
    console.error("downloadMediaAsset error:", err);
    return false;
  }
}

export function exportFacebookToCSV(
  posts: FacebookPostItem[],
  profile: FacebookUserProfile
) {
  const rows = getFacebookExportRows(posts, profile);
  const headerLine = FACEBOOK_EXPORT_HEADERS.map(escapeCSV).join(",");
  const dataLines = rows.map((r) =>
    [
      r.no,
      escapeCSV(r.channel),
      escapeCSV(r.title),
      escapeCSV(r.type),
      r.views,
      r.likes,
      r.comments,
      r.shares,
      escapeCSV(r.outlierScore),
      escapeCSV(r.tierLabel),
      escapeCSV(r.duration),
      escapeCSV(r.published),
      escapeCSV(r.permalink),
      escapeCSV(r.postId),
    ].join(",")
  );

  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(
    blob,
    `Riset_Facebook_${profile.username}_${Date.now()}.csv`
  );
}

export function exportFacebookToExcel(
  posts: FacebookPostItem[],
  profile: FacebookUserProfile
) {
  const rows = getFacebookExportRows(posts, profile);
  const escapeHTML = (val: string | number) =>
    String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; }
        th { background-color: #1877F2; color: #FFFFFF; font-weight: bold; padding: 10px; border: 1px solid #CBD5E1; text-align: left; }
        td { padding: 8px 10px; border: 1px solid #E2E8F0; vertical-align: top; }
        tr:nth-child(even) td { background-color: #F8FAFC; }
        .viral { color: #E11D48; font-weight: bold; }
        .num { text-align: right; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            ${FACEBOOK_EXPORT_HEADERS.map((h) => `<th>${escapeHTML(h)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
  `;

  rows.forEach((r) => {
    const isViral =
      r.tierLabel.includes("Viral") || r.tierLabel.includes("Tinggi");
    tableHTML += `
      <tr>
        <td class="num">${r.no}</td>
        <td>${escapeHTML(r.channel)}</td>
        <td>${escapeHTML(r.title)}</td>
        <td>${escapeHTML(r.type)}</td>
        <td class="num">${r.views}</td>
        <td class="num">${r.likes}</td>
        <td class="num">${r.comments}</td>
        <td class="num">${r.shares}</td>
        <td class="${isViral ? "viral" : ""}">${escapeHTML(r.outlierScore)}</td>
        <td class="${isViral ? "viral" : ""}">${escapeHTML(r.tierLabel)}</td>
        <td>${escapeHTML(r.duration)}</td>
        <td>${escapeHTML(r.published)}</td>
        <td><a href="${escapeHTML(r.permalink)}">${escapeHTML(r.permalink)}</a></td>
        <td>${escapeHTML(r.postId)}</td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + tableHTML], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(
    blob,
    `Riset_Facebook_${profile.username}_${Date.now()}.xls`
  );
}

export async function exportFacebookToGoogleSheets(
  posts: FacebookPostItem[],
  profile: FacebookUserProfile
): Promise<boolean> {
  const rows = getFacebookExportRows(posts, profile);
  const headerLine = FACEBOOK_EXPORT_HEADERS.map(cleanTextForTSV).join("\t");
  const dataLines = rows.map((r) =>
    [
      r.no,
      cleanTextForTSV(r.channel),
      cleanTextForTSV(r.title),
      cleanTextForTSV(r.type),
      r.views,
      r.likes,
      r.comments,
      r.shares,
      cleanTextForTSV(r.outlierScore),
      cleanTextForTSV(r.tierLabel),
      cleanTextForTSV(r.duration),
      cleanTextForTSV(r.published),
      cleanTextForTSV(r.permalink),
      cleanTextForTSV(r.postId),
    ].join("\t")
  );

  const tsvContent = [headerLine, ...dataLines].join("\r\n");

  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsvContent);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = tsvContent;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      copied = document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch {
      copied = false;
    }
  }

  window.open("https://docs.google.com/spreadsheets/create", "_blank");
  return copied;
}

export async function downloadFacebookMediaBatch(
  posts: FacebookPostItem[],
  profile: FacebookUserProfile,
  onProgress?: (percent: number, statusText: string) => void
): Promise<boolean> {
  const zip = new JSZip();
  const folder = zip.folder(`Riset_Facebook_${profile.username}`);

  onProgress?.(5, "Menyiapkan ringkasan data CSV...");

  const rows = getFacebookExportRows(posts, profile);
  const headerLine = FACEBOOK_EXPORT_HEADERS.map(escapeCSV).join(",");
  const dataLines = rows.map((r) =>
    [
      r.no,
      escapeCSV(r.channel),
      escapeCSV(r.title),
      escapeCSV(r.type),
      r.views,
      r.likes,
      r.comments,
      r.shares,
      escapeCSV(r.outlierScore),
      escapeCSV(r.tierLabel),
      escapeCSV(r.duration),
      escapeCSV(r.published),
      escapeCSV(r.permalink),
      escapeCSV(r.postId),
    ].join(",")
  );
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  folder?.file("data_analisis_facebook.csv", csvContent);

  let readmeText = `HASIL RISET KONTEN FACEBOOK @${profile.username.toUpperCase()}\n`;
  readmeText += `Diunduh pada: ${new Date().toLocaleString("id-ID")}\n\n`;
  readmeText += `RINGKASAN HALAMAN:\n`;
  readmeText += `- Username: @${profile.username}\n`;
  readmeText += `- Nama Halaman: ${profile.name}\n`;
  readmeText += `- Pengikut: ${profile.followersCount.toLocaleString("id-ID")}\n`;
  readmeText += `- Rata-rata Views: ${profile.averageViews.toLocaleString("id-ID")}\n`;
  readmeText += `- Rata-rata Engagement: ${profile.averageEngagementRate}%\n`;
  readmeText += `- Top Outlier Multiplier: ${profile.topOutlierMultiplier}x\n\n`;
  readmeText += `DAFTAR KONTEN:\n`;

  posts.forEach((v, i) => {
    readmeText += `[${i + 1}] ${v.title}\n`;
    readmeText += `    - Format: ${v.isPhoto ? "Foto / Postingan" : "Reels / Video"}\n`;
    readmeText += `    - Outlier: ${v.outlierScore.toFixed(1)}x (${v.outlierTier})\n`;
    readmeText += `    - Views: ${v.viewsCount.toLocaleString("id-ID")} | Likes: ${v.likesCount.toLocaleString("id-ID")} | Comments: ${v.commentsCount.toLocaleString("id-ID")} | Shares: ${(v.sharesCount || 0).toLocaleString("id-ID")}\n`;
    readmeText += `    - Link: ${v.permalink}\n\n`;
  });
  folder?.file("README_RINGKASAN_KONTEN.txt", readmeText);

  const total = posts.length;
  for (let i = 0; i < total; i++) {
    const v = posts[i];
    const pct = Math.round(((i + 1) / total) * 85);
    onProgress?.(pct, `Mengunduh thumbnail ${i + 1} dari ${total}...`);

    if (v.thumbnailUrl) {
      try {
        const fetchUrl = v.thumbnailUrl.startsWith("/api/ruang-riset/image-proxy")
          ? v.thumbnailUrl
          : `/api/ruang-riset/image-proxy?url=${encodeURIComponent(v.thumbnailUrl)}`;
        const res = await fetch(fetchUrl);
        if (res.ok) {
          const blob = await res.blob();
          const cleanTitle = (v.title || `post_${v.id}`)
            .slice(0, 30)
            .replace(/[^a-zA-Z0-9_-]/g, "_");
          folder?.file(`${i + 1}_${cleanTitle}_${v.id}.jpg`, blob);
        }
      } catch (err) {
        console.warn(`Gagal fetch thumbnail post ${v.id}:`, err);
      }
    }
  }

  onProgress?.(95, "Mengompresi file ZIP...");
  const content = await zip.generateAsync({ type: "blob" });
  triggerDownload(
    content,
    `Batch_Riset_Facebook_${profile.username}_${Date.now()}.zip`
  );
  onProgress?.(100, "Selesai!");
  return true;
}
