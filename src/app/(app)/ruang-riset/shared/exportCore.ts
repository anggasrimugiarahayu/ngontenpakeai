/**
 * Core Export Utilities untuk Ruang Riset (Instagram, YouTube, TikTok, Facebook)
 */

export function formatIsoDate(ts: string | number | Date): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function escapeCSV(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '""';
  const stringified = String(str).replace(/"/g, '""');
  return `"${stringified}"`;
}

export function cleanTextForTSV(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return "";
  return String(str).replace(/[\t\r\n]+/g, " ").trim();
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function buildCsvContent(headers: string[], rows: (string | number)[][]): string {
  const csvLines = [
    headers.map(escapeCSV).join(","),
    ...rows.map((r) => r.map((cell) => (typeof cell === "number" ? cell : escapeCSV(cell))).join(",")),
  ];
  return "\uFEFF" + csvLines.join("\n");
}

export function buildTsvContent(headers: string[], rows: (string | number)[][]): string {
  const tsvLines = [
    headers.join("\t"),
    ...rows.map((r) => r.map((cell) => cleanTextForTSV(cell)).join("\t")),
  ];
  return tsvLines.join("\n");
}

export async function copyContentToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(content);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to copy content to clipboard:", err);
    return false;
  }
}
