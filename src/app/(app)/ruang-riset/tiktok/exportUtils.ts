import { TikTokPostItem, TikTokUserProfile } from "./types";
import JSZip from "jszip";

export const TIKTOK_EXPORT_HEADERS = [
  "No",
  "Akun TikTok",
  "Deskripsi / Caption Video",
  "Tipe Konten",
  "Views / Tayangan",
  "Likes / Suka",
  "Comments / Komentar",
  "Shares / Dibagikan",
  "Outlier Score",
  "Tingkat Viralitas",
  "Durasi",
  "Tanggal Publikasi",
  "Link Video",
  "ID Video",
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

export function getTikTokExportRows(videos: TikTokPostItem[], profile: TikTokUserProfile) {
  return videos.map((video, idx) => {
    const tierLabel =
      video.outlierTier === "super_viral"
        ? "Super Viral (>=10x)"
        : video.outlierTier === "viral"
        ? "Viral (>=5x)"
        : video.outlierTier === "high"
        ? "Tinggi (>=2x)"
        : "Normal (<2x)";

    return {
      no: idx + 1,
      channel: `@${profile.username} (${profile.nickname})`,
      title: video.title,
      type: video.isPhoto ? "Photo Slide" : "Video",
      views: video.viewsCount,
      likes: video.likesCount,
      comments: video.commentsCount,
      shares: video.sharesCount || 0,
      outlierScore: video.outlierScore.toFixed(1) + "x",
      tierLabel,
      duration: video.duration || "-",
      published: video.publishedText || "-",
      permalink: video.permalink,
      videoId: video.id,
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

export function exportTikTokToCSV(videos: TikTokPostItem[], profile: TikTokUserProfile) {
  const rows = getTikTokExportRows(videos, profile);
  const headerLine = TIKTOK_EXPORT_HEADERS.map(escapeCSV).join(",");
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
      escapeCSV(r.videoId),
    ].join(",")
  );

  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `Riset_TikTok_${profile.username}_${Date.now()}.csv`);
}

export function exportTikTokToExcel(videos: TikTokPostItem[], profile: TikTokUserProfile) {
  const rows = getTikTokExportRows(videos, profile);
  const tableRows = rows
    .map(
      (r) => `
    <tr>
      <td>${r.no}</td>
      <td>${r.channel}</td>
      <td>${r.title}</td>
      <td>${r.type}</td>
      <td>${r.views}</td>
      <td>${r.likes}</td>
      <td>${r.comments}</td>
      <td>${r.shares}</td>
      <td>${r.outlierScore}</td>
      <td>${r.tierLabel}</td>
      <td>${r.duration}</td>
      <td>${r.published}</td>
      <td><a href="${r.permalink}">${r.permalink}</a></td>
      <td>${r.videoId}</td>
    </tr>`
    )
    .join("");

  const excelContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Riset TikTok @${profile.username}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #000000; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 6px; border: 1px solid #ddd; vertical-align: top; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${TIKTOK_EXPORT_HEADERS.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([excelContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(blob, `Riset_TikTok_${profile.username}_${Date.now()}.xls`);
}

export async function copyTikTokToGoogleSheets(
  videos: TikTokPostItem[],
  profile: TikTokUserProfile
): Promise<boolean> {
  const rows = getTikTokExportRows(videos, profile);
  const headerLine = TIKTOK_EXPORT_HEADERS.join("\t");
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
      cleanTextForTSV(r.videoId),
    ].join("\t")
  );

  const tsvContent = [headerLine, ...dataLines].join("\r\n");

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(tsvContent);
      return true;
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = tsvContent;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error("Gagal menyalin data Google Sheets:", err);
    return false;
  }
}

export function exportTikTokToJSON(videos: TikTokPostItem[], profile: TikTokUserProfile) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile,
    totalVideos: videos.length,
    videos,
  };
  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  triggerDownload(blob, `Riset_TikTok_${profile.username}_${Date.now()}.json`);
}

export async function downloadTikTokMediaBatch(
  videos: TikTokPostItem[],
  profile: TikTokUserProfile,
  onProgress?: (percent: number, text: string) => void
) {
  const zip = new JSZip();
  const folder = zip.folder(`TikTok_${profile.username}`);

  const rows = getTikTokExportRows(videos, profile);
  const headerLine = TIKTOK_EXPORT_HEADERS.map(escapeCSV).join(",");
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
      escapeCSV(r.videoId),
    ].join(",")
  );
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
  folder?.file("data_analisis_tiktok.csv", csvContent);

  let readmeText = `HASIL RISET KONTEN TIKTOK @${profile.username.toUpperCase()}\n`;
  readmeText += `Diunduh pada: ${new Date().toLocaleString("id-ID")}\n\n`;
  readmeText += `RINGKASAN AKUN:\n`;
  readmeText += `- Username: @${profile.username}\n`;
  readmeText += `- Nama: ${profile.nickname}\n`;
  readmeText += `- Pengikut: ${profile.followerCount.toLocaleString("id-ID")}\n`;
  readmeText += `- Total Likes Akun: ${profile.heartCount.toLocaleString("id-ID")}\n`;
  readmeText += `- Rata-rata Views: ${profile.averageViews.toLocaleString("id-ID")}\n`;
  readmeText += `- Rata-rata Engagement: ${profile.averageEngagementRate}%\n`;
  readmeText += `- Top Outlier Multiplier: ${profile.topOutlierMultiplier}x\n\n`;
  readmeText += `DAFTAR KONTEN:\n`;

  videos.forEach((v, i) => {
    readmeText += `[${i + 1}] ${v.title}\n`;
    readmeText += `    - Format: ${v.isPhoto ? "Photo Slide" : "Video"}\n`;
    readmeText += `    - Outlier: ${v.outlierScore.toFixed(1)}x (${v.outlierTier})\n`;
    readmeText += `    - Views: ${v.viewsCount.toLocaleString("id-ID")} | Likes: ${v.likesCount.toLocaleString("id-ID")} | Comments: ${v.commentsCount.toLocaleString("id-ID")}\n`;
    readmeText += `    - Link: ${v.permalink}\n\n`;
  });
  folder?.file("README_RINGKASAN_KONTEN.txt", readmeText);

  const total = videos.length;
  for (let i = 0; i < total; i++) {
    const v = videos[i];
    const pct = Math.round(((i + 1) / total) * 85);
    onProgress?.(pct, `Mengunduh thumbnail ${i + 1} dari ${total}...`);

    if (v.thumbnailUrl) {
      try {
        const proxyUrl = `/api/ruang-riset/image-proxy?url=${encodeURIComponent(v.thumbnailUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const blob = await res.blob();
          const cleanTitle = (v.title || `video_${v.id}`)
            .slice(0, 30)
            .replace(/[^a-zA-Z0-9_-]/g, "_");
          folder?.file(`${i + 1}_${cleanTitle}_${v.id}.jpg`, blob);
        }
      } catch (err) {
        console.warn(`Gagal fetch thumbnail video ${v.id}:`, err);
      }
    }
  }

  onProgress?.(95, "Mengompresi file ZIP...");
  const content = await zip.generateAsync({ type: "blob" });
  triggerDownload(content, `Batch_Riset_TikTok_${profile.username}_${Date.now()}.zip`);
  onProgress?.(100, "Selesai!");
  return true;
}
