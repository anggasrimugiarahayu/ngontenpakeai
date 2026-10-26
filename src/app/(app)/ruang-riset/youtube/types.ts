export interface YouTubeChannelProfile {
  channelId: string;
  customUrl: string; // e.g. @kokbisa
  title: string;
  avatarUrl: string;
  bannerUrl?: string;
  description: string;
  subscriberCount: number;
  subscriberCountText: string;
  videoCount: number;
  viewCount: number;
  averageViews: number;
  topOutlierMultiplier: number;
}

export type YouTubeFormatFilter = "all" | "shorts" | "videos";
export type YouTubeFilterMode = "format" | "limit" | "date";
export type YouTubeVideoLimit = 25 | 50 | 100 | "all";
export type YouTubeDateFilter = "all" | "1w" | "1m" | "3m" | "6m" | "1y";

export interface YouTubeVideoItem {
  id: string; // videoId
  title: string;
  description?: string;
  thumbnailUrl: string;
  permalink: string; // https://youtube.com/watch?v=... or https://youtube.com/shorts/...
  viewsCount: number;
  viewsText: string;
  publishedText: string;
  timestamp: string; // ISO date or published time
  duration: string; // e.g. "3:42" or "0:45"
  durationSeconds: number;
  isShorts: boolean;
  outlierScore: number;
  outlierTier: "super_viral" | "viral" | "high" | "normal";
}

export type YouTubeSortOption =
  | "outlier"
  | "views"
  | "newest"
  | "oldest";
