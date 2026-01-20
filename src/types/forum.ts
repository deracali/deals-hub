export interface ForumAuthor {
  id?: string;
  name: string;
  photo: string; // ✅ matches schema
  isVerified: boolean;
  reputation: number;
  email?: string;
}

export type ForumPostType =
  | "question"
  | "scam-report"
  | "general"
  | "deal-discussion";

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  type: ForumPostType;
  author: ForumAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  tags: string[];
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  reportedScamUrl?: string;
  relatedDealId?: string;
}

export interface ForumFilters {
  search?: string;
  type?: ForumPostType | "all";
  sortBy?: "recent" | "popular" | "discussed";
}
