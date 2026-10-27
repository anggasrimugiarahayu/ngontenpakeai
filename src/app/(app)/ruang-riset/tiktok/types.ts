export interface TikTokUserProfile {
  username: string;
  nickname: string;
  avatarUrl: string;
  isVerified: boolean;
  signature: string;
  bioLink?: string;
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
  averageViews: number;
  averageLikes: number;
  averageEngagementRate: number;
  topOutlierMultiplier: number;
}

export type TikTokFormatFilter = "videos" | "photos";
export type TikTokFilterMode = "videos" | "date";
export type TikTokVideoLimit = 25 | 50 | 100 | "all";
export type TikTokDateFilter = "all" | "1w" | "1m" | "3m" | "6m" | "1y";

export interface TikTokPostItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  permalink: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsText: string;
  publishedText: string;
  timestamp: string;
  duration: string;
  durationSeconds: number;
  isPhoto: boolean;
  photoUrls?: string[];
  outlierScore: number;
  outlierTier: "super_viral" | "viral" | "high" | "normal";
  hookText: string;
  musicTitle?: string;
  musicAuthor?: string;
}

export type TikTokSortOption =
  | "outlier"
  | "views"
  | "likes"
  | "shares"
  | "comments"
  | "saves"
  | "oldest"
  | "newest";
