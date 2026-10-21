export interface InstagramTargetProfile {
  username: string;
  fullName: string;
  profilePicUrl: string;
  isVerified: boolean;
  biography: string;
  externalUrl?: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  averageViews: number; // Baseline average views for Reels/Videos
  averageLikes: number;
  averageComments: number;
  averageEngagementRate: number; // in percent
  topOutlierMultiplier: number;
}

export type MediaType = "VIDEO" | "IMAGE" | "CAROUSEL_ALBUM";

export interface InstagramPostItem {
  id: string;
  shortcode: string;
  permalink: string;
  caption: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  timestamp: string; // ISO string
  outlierScore: number; // e.g. 1.2, 5.4, 12.8
  outlierTier: "super_viral" | "viral" | "high" | "normal";
  engagementRate: number; // in percent
  hookText: string;
  aspectRatio?: string;
}

export type SortOption =
  | "outlier"
  | "views"
  | "likes"
  | "comments"
  | "newest"
  | "oldest";

export type FormatFilter = "all" | "reels" | "posts";
