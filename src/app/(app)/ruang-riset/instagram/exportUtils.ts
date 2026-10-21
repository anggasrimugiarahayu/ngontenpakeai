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
