import { InstagramPostItem, InstagramTargetProfile } from "./types";
import JSZip from "jszip";

/**
 * Format date strictly as YYYY-MM-DD
 */
export function formatIsoDate(ts: string | number | Date): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const EXPORT_HEADERS = [
  "No",
  "Username",
  "Link Postingan",
  "Tipe Media",
  "Views / Tayangan",
  "Likes",
  "Komentar",
  "Outlier Score",
  "Tingkat Viralitas",
  "Engagement Rate (%)",
  "Hook / Kalimat Pertama",
  "Caption Lengkap",
  "Tanggal Posting",
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

export function getExportRows(posts: InstagramPostItem[], profile: InstagramTargetProfile) {
  return posts.map((post, idx) => {
    const tierLabel =
      post.outlierTier === "super_viral"
        ? "Super Viral (>=10x)"
        : post.outlierTier === "viral"
        ? "Viral (>=5x)"
        : post.outlierTier === "high"
        ? "Tinggi (>=2x)"
        : "Normal (<2x)";

    return {
      no: idx + 1,
      username: profile.username,
      permalink: post.permalink,
      mediaType: post.mediaType,
      viewsCount: post.viewsCount,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      outlierScore: post.outlierScore.toFixed(1) + "x",
      tierLabel,
      engagementRate: post.engagementRate.toFixed(2) + "%",
      hookText: post.hookText || "",
      caption: post.caption || "",
      date: formatIsoDate(post.timestamp),
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

/**
 * EXPORT TO CSV
 */
export async function exportToCSV(
  posts: InstagramPostItem[],
  profile: InstagramTargetProfile,
  action: "download" | "copy" = "download"
): Promise<boolean> {
  if (!posts || posts.length === 0) return false;

  const rows = getExportRows(posts, profile);
  const csvLines = [
    EXPORT_HEADERS.map(escapeCSV).join(","),
    ...rows.map((r) =>
      [
        r.no,
        escapeCSV(r.username),
        escapeCSV(r.permalink),
        escapeCSV(r.mediaType),
        r.viewsCount,
        r.likesCount,
        r.commentsCount,
        escapeCSV(r.outlierScore),
        escapeCSV(r.tierLabel),
        escapeCSV(r.engagementRate),
        escapeCSV(r.hookText),
        escapeCSV(r.caption),
        escapeCSV(r.date),
      ].join(",")
    ),
  ];

  const csvContent = "\uFEFF" + csvLines.join("\n");

  if (action === "copy") {
    await navigator.clipboard.writeText(csvContent);
    return true;
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `riset-instagram-${profile.username}-${formatIsoDate(new Date())}.csv`);
  return true;
}

/**
 * EXPORT TO EXCEL
 */
export async function exportToExcel(
  posts: InstagramPostItem[],
  profile: InstagramTargetProfile,
  action: "download" | "copy" = "download"
): Promise<boolean> {
  if (!posts || posts.length === 0) return false;

  const rows = getExportRows(posts, profile);

  if (action === "copy") {
    // Tab-delimited format is the native format for pasting into Excel
    const tsvLines = [
      EXPORT_HEADERS.join("\t"),
      ...rows.map((r) =>
        [
          r.no,
          r.username,
          r.permalink,
          r.mediaType,
          r.viewsCount,
          r.likesCount,
          r.commentsCount,
          r.outlierScore,
          r.tierLabel,
          r.engagementRate,
          cleanTextForTSV(r.hookText),
          cleanTextForTSV(r.caption),
          r.date,
        ].join("\t")
      ),
    ];
    await navigator.clipboard.writeText(tsvLines.join("\n"));
    return true;
  }

  // Download formatted CSV with UTF-8 BOM so Excel opens columns cleanly
  const csvLines = [
    EXPORT_HEADERS.map(escapeCSV).join(","),
    ...rows.map((r) =>
      [
        r.no,
        escapeCSV(r.username),
        escapeCSV(r.permalink),
        escapeCSV(r.mediaType),
        r.viewsCount,
        r.likesCount,
        r.commentsCount,
        escapeCSV(r.outlierScore),
        escapeCSV(r.tierLabel),
        escapeCSV(r.engagementRate),
        escapeCSV(r.hookText),
        escapeCSV(r.caption),
        escapeCSV(r.date),
      ].join(",")
    ),
  ];

  const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  triggerDownload(
    blob,
    `riset-instagram-${profile.username}-${formatIsoDate(new Date())}-excel.csv`
  );
  return true;
}

/**
 * EXPORT TO GOOGLE SHEETS
 */
export async function exportToGoogleSheets(
  posts: InstagramPostItem[],
  profile: InstagramTargetProfile,
  action: "download" | "copy" = "copy"
): Promise<boolean> {
  if (!posts || posts.length === 0) return false;

  const rows = getExportRows(posts, profile);
  // TSV format is optimal for Google Sheets pasting and importing
  const tsvLines = [
    EXPORT_HEADERS.join("\t"),
    ...rows.map((r) =>
      [
        r.no,
        r.username,
        r.permalink,
        r.mediaType,
        r.viewsCount,
        r.likesCount,
        r.commentsCount,
        r.outlierScore,
        r.tierLabel,
        r.engagementRate,
        cleanTextForTSV(r.hookText),
        cleanTextForTSV(r.caption),
        r.date,
      ].join("\t")
    ),
  ];

  const content = tsvLines.join("\n");

  if (action === "copy") {
    await navigator.clipboard.writeText(content);
    return true;
  }

  const blob = new Blob([content], { type: "text/tab-separated-values;charset=utf-8;" });
  triggerDownload(
    blob,
    `riset-instagram-${profile.username}-${formatIsoDate(new Date())}-googlesheets.tsv`
  );
  return true;
}

/**
 * EXPORT TO JSON
 */
export async function exportToJSON(
  posts: InstagramPostItem[],
  profile: InstagramTargetProfile,
  action: "download" | "copy" = "download"
): Promise<boolean> {
  if (!posts || posts.length === 0) return false;

  const rows = getExportRows(posts, profile);
  const jsonContent = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: {
        username: profile.username,
        fullName: profile.fullName,
        followersCount: profile.followersCount,
        averageViews: profile.averageViews,
        averageLikes: profile.averageLikes,
        topOutlierMultiplier: profile.topOutlierMultiplier,
      },
      posts: rows,
    },
    null,
    2
  );

  if (action === "copy") {
    await navigator.clipboard.writeText(jsonContent);
    return true;
  }

  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  triggerDownload(
    blob,
    `riset-instagram-${profile.username}-${formatIsoDate(new Date())}.json`
  );
  return true;
}

// Backward compatibility alias
export function exportPostsToCSV(posts: InstagramPostItem[], profile: InstagramTargetProfile) {
  return exportToCSV(posts, profile, "download");
}

/**
 * Download a single media file (video MP4 or image JPG) directly to the user's computer.
 */
export async function downloadMediaAsset(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil media");
    const blob = await res.blob();
    triggerDownload(blob, filename);
    return true;
  } catch (err) {
    console.error("Download media error:", err);
    window.open(url, "_blank");
    return false;
  }
}

/**
 * DOWNLOAD ALL MEDIA INTO A SINGLE STRUCTURED ZIP FILE
 * Folder inside ZIP: [username]-posts/[index]-[shortcode].[ext]
 * ZIP Name: media-instagram-[username]-[YYYY-MM-DD].zip
 */
export async function downloadPostsAsZip(
  posts: InstagramPostItem[],
  username: string,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  if (!posts || posts.length === 0) return false;

  const zip = new JSZip();
  const folderName = `${username}-posts`;
  const folder = zip.folder(folderName)!;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const isVideo = post.mediaType === "VIDEO" && Boolean(post.videoUrl);
    const mediaUrl = isVideo ? post.videoUrl! : post.thumbnailUrl;
    const ext = isVideo ? "mp4" : "jpg";
    const postType = isVideo ? "reels" : post.mediaType === "CAROUSEL_ALBUM" ? "carousel" : "photo";
    const rankPrefix = String(i + 1).padStart(2, "0");
    const filename = `${rankPrefix}-${post.shortcode || post.id}-${postType}.${ext}`;

    if (onProgress) {
      onProgress(i + 1, posts.length);
    }

    try {
      const res = await fetch(mediaUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        folder.file(filename, buffer);
      }
    } catch (err) {
      console.warn(`Gagal mengunduh media post #${i + 1}:`, err);
    }
  }

  // Generate zip file with deflate compression
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const zipFilename = `media-instagram-${username}-${formatIsoDate(new Date())}.zip`;
  triggerDownload(zipBlob, zipFilename);
  return true;
}

// Backward compatibility alias
export async function downloadBatchMediaAssets(
  posts: InstagramPostItem[],
  username: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  await downloadPostsAsZip(posts, username, onProgress);
}


