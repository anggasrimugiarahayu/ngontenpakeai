import { YouTubeVideoItem, YouTubeChannelProfile } from "./types";
import JSZip from "jszip";

export const YOUTUBE_EXPORT_HEADERS = [
  "No",
  "Channel",
  "Judul Video",
  "Tipe Konten",
  "Views / Tayangan",
  "Likes / Suka",
  "Comments / Komentar",
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

export function getYouTubeExportRows(videos: YouTubeVideoItem[], profile: YouTubeChannelProfile) {
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
      channel: profile.title,
      title: video.title,
      type: video.isShorts ? "YouTube Shorts" : "Long Video",
      views: video.viewsCount,
      likes: video.likesCount,
      comments: video.commentsCount,
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

export function exportYouTubeToCSV(videos: YouTubeVideoItem[], profile: YouTubeChannelProfile) {
  const rows = getYouTubeExportRows(videos, profile);
  const headerLine = YOUTUBE_EXPORT_HEADERS.map(escapeCSV).join(",");
  const dataLines = rows.map((r) =>
    [
      r.no,
      escapeCSV(r.channel),
      escapeCSV(r.title),
      escapeCSV(r.type),
      r.views,
      r.likes,
      r.comments,
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
  triggerDownload(blob, `Riset_YouTube_${profile.customUrl.replace(/[^a-zA-Z0-9_]/g, "")}_${Date.now()}.csv`);
}

export function exportYouTubeToExcel(videos: YouTubeVideoItem[], profile: YouTubeChannelProfile) {
  const rows = getYouTubeExportRows(videos, profile);
  const tableRows = rows
    .map(
      (r) => `
    <tr>
      <td>${r.no}</td>
      <td>${escapeHTML(r.channel)}</td>
      <td>${escapeHTML(r.title)}</td>
      <td>${escapeHTML(r.type)}</td>
      <td>${r.views}</td>
      <td>${r.likes}</td>
      <td>${r.comments}</td>
      <td>${escapeHTML(r.outlierScore)}</td>
      <td>${escapeHTML(r.tierLabel)}</td>
      <td>${escapeHTML(r.duration)}</td>
      <td>${escapeHTML(r.published)}</td>
      <td><a href="${r.permalink}">${r.permalink}</a></td>
      <td>${escapeHTML(r.videoId)}</td>
    </tr>`
    )
    .join("");

  const excelXml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Riset YouTube</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
    <style>
      th { background-color: #EF4444; color: #FFFFFF; font-weight: bold; border: 1px solid #CCCCCC; padding: 8px; }
      td { border: 1px solid #E5E7EB; padding: 6px; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          ${YOUTUBE_EXPORT_HEADERS.map((h) => `<th>${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </body>
  </html>`;

  const blob = new Blob([excelXml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  triggerDownload(blob, `Riset_YouTube_${profile.customUrl.replace(/[^a-zA-Z0-9_]/g, "")}_${Date.now()}.xls`);
}

export async function copyYouTubeToGoogleSheets(videos: YouTubeVideoItem[], profile: YouTubeChannelProfile): Promise<boolean> {
  const rows = getYouTubeExportRows(videos, profile);
  const headerLine = YOUTUBE_EXPORT_HEADERS.join("\t");
  const dataLines = rows.map((r) =>
    [
      r.no,
      cleanTextForTSV(r.channel),
      cleanTextForTSV(r.title),
      cleanTextForTSV(r.type),
      r.views,
      r.likes,
      r.comments,
      cleanTextForTSV(r.outlierScore),
      cleanTextForTSV(r.tierLabel),
      cleanTextForTSV(r.duration),
      cleanTextForTSV(r.published),
      cleanTextForTSV(r.permalink),
      cleanTextForTSV(r.videoId),
    ].join("\t")
  );

  const tsvText = [headerLine, ...dataLines].join("\n");
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(tsvText);
    return true;
  }
  return false;
}

export function exportYouTubeToJSON(videos: YouTubeVideoItem[], profile: YouTubeChannelProfile) {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    channel: profile,
    totalVideos: videos.length,
    videos: videos,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, `Riset_YouTube_${profile.customUrl.replace(/[^a-zA-Z0-9_]/g, "")}_${Date.now()}.json`);
}

export async function downloadYouTubeMediaBatch(
  videos: YouTubeVideoItem[],
  profile: YouTubeChannelProfile,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  const zip = new JSZip();
  const safeHandle = profile.customUrl.replace(/[^a-zA-Z0-9_]/g, "") || "channel";
  const root = zip.folder(`youtube-${safeHandle}`);
  if (!root) return false;

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    if (onProgress) onProgress(i + 1, videos.length);
    const cleanTitle = (video.title || "video").slice(0, 30).replace(/[^a-zA-Z0-9_ -]/g, "").trim();
    const folderName = `${String(i + 1).padStart(2, "0")}_${video.id}_${cleanTitle}`;
    const vidFolder = root.folder(folderName);
    if (!vidFolder) continue;

    // Fetch thumbnail via image proxy or direct
    try {
      if (video.thumbnailUrl) {
        const proxyUrl = `/api/ruang-riset/image-proxy?url=${encodeURIComponent(video.thumbnailUrl)}`;
        const thumbRes = await fetch(proxyUrl);
        if (thumbRes.ok) {
          const buf = await thumbRes.arrayBuffer();
          vidFolder.file("thumbnail.jpg", buf);
        }
      }
    } catch (e) {
      console.warn("Failed fetching thumbnail:", e);
    }

    // Video details text file
    const infoText = [
      `Channel: ${profile.title} (${profile.customUrl})`,
      `Judul: ${video.title}`,
      `Link Video: ${video.permalink}`,
      `Views: ${video.viewsText} (${video.viewsCount})`,
      `Outlier Score: ${video.outlierScore.toFixed(1)}x (${video.outlierTier})`,
      `Tipe: ${video.isShorts ? "Shorts" : "Long Video"}`,
      `Durasi: ${video.duration}`,
      `Tanggal: ${video.publishedText}`,
    ].join("\n");
    vidFolder.file("info.txt", infoText);
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  triggerDownload(zipBlob, `YouTube_Media_${safeHandle}_${Date.now()}.zip`);
  return true;
}

function escapeHTML(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
