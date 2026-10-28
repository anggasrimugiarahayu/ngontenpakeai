export interface FacebookUserProfile {
  username: string;
  name: string;
  avatarUrl: string;
  coverUrl?: string;
  isVerified: boolean;
  biography: string;
  externalUrl?: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  postCount: number;
  averageViews: number;
  averageLikes: number;
  averageEngagementRate: number;
  topOutlierMultiplier: number;
}

export type FacebookFormatFilter = "videos" | "photos";
export type FacebookFilterMode = "videos" | "date";
export type FacebookVideoLimit = 25 | 50 | 100 | "all";
export type FacebookDateFilter = "all" | "1w" | "1m" | "3m" | "6m" | "1y";

export interface FacebookPostItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl?: string;
  permalink: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
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
}

export type FacebookSortOption =
  | "outlier"
  | "views"
  | "likes"
  | "comments"
  | "shares"
  | "oldest"
  | "newest";
