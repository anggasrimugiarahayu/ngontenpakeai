import { InstagramPostItem, InstagramTargetProfile } from "./types";

export function exportPostsToCSV(
  posts: InstagramPostItem[],
  profile: InstagramTargetProfile
) {
  if (!posts || posts.length === 0) return;

  const headers = [
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

  const rows = posts.map((post, idx) => {
    const tierLabel =
      post.outlierTier === "super_viral"
        ? "Super Viral (>=10x)"
        : post.outlierTier === "viral"
        ? "Viral (>=5x)"
        : post.outlierTier === "high"
        ? "Tinggi (>=2x)"
        : "Normal (<2x)";

    return [
      idx + 1,
      escapeCSV(profile.username),
      escapeCSV(post.permalink),
      escapeCSV(post.mediaType),
      post.viewsCount,
      post.likesCount,
      post.commentsCount,
      post.outlierScore.toFixed(1) + "x",
      escapeCSV(tierLabel),
      post.engagementRate.toFixed(2) + "%",
      escapeCSV(post.hookText),
      escapeCSV(post.caption),
      escapeCSV(new Date(post.timestamp).toLocaleDateString("id-ID")),
    ].join(",");
  });

  // Prepend UTF-8 BOM so Excel opens it with proper encoding
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `riset-instagram-${profile.username}-${dateStr}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download a single media file (video MP4 or image JPG) directly to the user's computer.
 */
export async function downloadMediaAsset(url: string, filename: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil media");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return true;
  } catch (err) {
    console.error("Download media error:", err);
    // Fallback: buka di tab baru jika blob download diblokir browser
    window.open(url, "_blank");
    return false;
  }
}

/**
 * Batch download multiple media files sequentially with delay to avoid browser blocking.
 */
export async function downloadBatchMediaAssets(
  posts: InstagramPostItem[],
  username: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (!posts || posts.length === 0) return;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const isVideo = post.mediaType === "VIDEO" && Boolean(post.videoUrl);
    const mediaUrl = isVideo ? post.videoUrl! : post.thumbnailUrl;
    const ext = isVideo ? "mp4" : "jpg";
    const filename = `${username}-${post.shortcode || post.id}.${ext}`;

    if (onProgress) {
      onProgress(i + 1, posts.length);
    }

    await downloadMediaAsset(mediaUrl, filename);

    if (i < posts.length - 1) {
      // Tunggu 400ms antar file agar browser tidak memblokir multi-download
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}

