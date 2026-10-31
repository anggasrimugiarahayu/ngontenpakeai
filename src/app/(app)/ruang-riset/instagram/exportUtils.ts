import { InstagramPostItem, InstagramTargetProfile } from "./types";
import JSZip from "jszip";
import {
  formatIsoDate,
  escapeCSV,
  cleanTextForTSV,
  triggerDownload,
} from "../shared/exportCore";
export { formatIsoDate };

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
  "Caption Lengkap",
  "Tanggal Posting",
];

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
      caption: post.caption || "",
      date: formatIsoDate(post.timestamp),
    };
  });
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
 * Folder inside ZIP:
 * [username]-posts/
 *   ├── 01-[shortcode]-[type]/
 *   │     ├── video.mp4 (atau slide-01.jpg, slide-02.jpg...)
 *   │     └── caption.txt
 *   ├── 02-[shortcode]-[type]/
 *   │     └── ...
 * ZIP Name: media-instagram-[username]-[YYYY-MM-DD].zip
 */
export async function downloadPostsAsZip(
  posts: InstagramPostItem[],
  username: string,
  onProgress?: (current: number, total: number) => void
): Promise<boolean> {
  if (!posts || posts.length === 0) return false;

  const zip = new JSZip();
  const rootFolderName = `${username}-posts`;
  const rootFolder = zip.folder(rootFolderName)!;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const isVideo = post.mediaType === "VIDEO" && Boolean(post.videoUrl);
    const isCarousel =
      post.mediaType === "CAROUSEL_ALBUM" &&
      Array.isArray(post.carouselMedia) &&
      post.carouselMedia.length > 0;
    const postType = isVideo ? "reels" : isCarousel ? "carousel" : "photo";
    const rankPrefix = String(i + 1).padStart(2, "0");
    const subfolderName = `${rankPrefix}-${post.shortcode || post.id}-${postType}`;
    const postFolder = rootFolder.folder(subfolderName)!;

    if (onProgress) {
      onProgress(i + 1, posts.length);
    }

    try {
      if (isVideo && post.videoUrl) {
        // Unduh video mp4
        const res = await fetch(post.videoUrl);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          postFolder.file("video.mp4", buffer);
        }
        // Juga unduh cover jika ada
        if (post.thumbnailUrl) {
          try {
            const coverRes = await fetch(post.thumbnailUrl);
            if (coverRes.ok) {
              const coverBuf = await coverRes.arrayBuffer();
              postFolder.file("cover.jpg", coverBuf);
            }
          } catch {
            // ignore
          }
        }
      } else if (isCarousel && post.carouselMedia) {
        // Unduh semua slide carousel ke dalam foldernya
        for (let s = 0; s < post.carouselMedia.length; s++) {
          const slideUrl = post.carouselMedia[s];
          try {
            const res = await fetch(slideUrl);
            if (res.ok) {
              const buffer = await res.arrayBuffer();
              const slideNum = String(s + 1).padStart(2, "0");
              postFolder.file(`slide-${slideNum}.jpg`, buffer);
            }
          } catch (e) {
            console.warn(`Gagal mengunduh slide #${s + 1}:`, e);
          }
        }
      } else if (post.thumbnailUrl) {
        // Single image
        const res = await fetch(post.thumbnailUrl);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          postFolder.file("photo.jpg", buffer);
        }
      }

      // Tambahkan teks caption & metadata postingan di file caption.txt
      const captionText = [
        `Link Postingan: ${post.permalink}`,
        `Tipe Media: ${post.mediaType}`,
        `Views: ${post.viewsCount}`,
        `Likes: ${post.likesCount}`,
        `Comments: ${post.commentsCount}`,
        `Outlier Score: ${post.outlierScore}x (${post.outlierTier})`,
        `Engagement Rate: ${post.engagementRate}%`,
        `Tanggal Posting: ${formatIsoDate(post.timestamp)}`,
        "",
        "========================================",
        "CAPTION LENGKAP:",
        "========================================",
        post.caption || "(Tanpa Caption)",
      ].join("\n");
      postFolder.file("caption.txt", captionText);
    } catch (err) {
      console.warn(`Gagal memproses media post #${i + 1}:`, err);
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


