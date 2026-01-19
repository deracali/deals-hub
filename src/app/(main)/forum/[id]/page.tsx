"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

import {
  ArrowLeft,
  Share2,
  Flag,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  TrendingUp,
  Pin,
  Eye,
  CheckCircle2,
  MessageSquare,
  AlertOctagon,
  X,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/general/header";
import { stringToColor } from "@/utils/colorUtils";
import CommentsSection from "../components/user-comment";

// --- Interfaces (Kept exactly as provided) ---
interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    reputation: number;
  };
  createdAt: string;
  likes: number;
  dislikes: number;
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  isReported: boolean;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  type: "question" | "scam-report" | "general" | "deal-discussion";
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
    reputation: number;
  };
  createdAt: string;
  likeUserIds: string[]; // NEW
  dislikeUserIds: string[];
  comments: Comment[];
  views: number;
  isPinned: boolean;
  tags: string[];
  hasUserLiked: boolean;
  hasUserDisliked: boolean;
  reportedScamUrl?: string;
  relatedDealId?: string;
  isReported: boolean;
}

const getAuthorAvatar = (author: any) => {
  if (!author) return null;

  const candidates = [
    author.photo,
    author.image,
    author.avatar,
    author.picture,
    author.imageUrl,
    author.profilePicture,
  ];

  return (
    candidates.find(
      (src) => typeof src === "string" && src.trim().length > 0,
    ) || null
  );
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idFromParams =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const [post, setPost] = useState<ForumPost>({
    id: "",
    title: "",
    content: "",
    type: "general",
    author: {
      name: "",
      avatar: "",
      isVerified: false,
      reputation: 0,
    },
    createdAt: "",
    likes: 0,
    dislikes: 0,
    comments: [],
    views: 0,
    isPinned: false,
    tags: [],
    hasUserLiked: false,
    hasUserDisliked: false,
    isReported: false,
  });

  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // --- Logic & Handlers (Kept exactly as provided) ---
  const fetchPost = useCallback(async () => {
    if (!idFromParams) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${baseURL}/forum/get-by-id/${encodeURIComponent(idFromParams)}`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch post (status ${res.status})`);
      }
      const data = await res.json();

      const storedUser = localStorage.getItem("user");
      let userId = "";
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser?._id || "";
        } catch {
          userId = "";
        }
      }

      const likeUserIds = Array.isArray(data.likes)
        ? data.likes.map((u: any) => u._id || u)
        : [];
      const dislikeUserIds = Array.isArray(data.dislikes)
        ? data.dislikes.map((u: any) => u._id || u)
        : [];

      const mapped: ForumPost = {
        id: data._id || data.id || idFromParams,
        title: data.title || data.slug || "Untitled",
        content: data.content || data.body || data.description || "",
        type: (data.type as ForumPost["type"]) || "general",
        author: {
          name:
            data.author?.name ||
            data.createdBy?.name ||
            data.authorName ||
            "Unknown",
          avatar:
            getAuthorAvatar(data.author) ||
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
          isVerified: Boolean(data.author?.isVerified || false),
          reputation: data.author?.reputation || 0,
        },
        createdAt:
          data.createdAt || data.created_at || new Date().toISOString(),
        likes: Array.isArray(data.likes)
          ? data.likes.length
          : typeof data.likes === "number"
            ? data.likes
            : 0,
        dislikes: Array.isArray(data.dislikes)
          ? data.dislikes.length
          : typeof data.dislikes === "number"
            ? data.dislikes
            : 0,
        comments: (data.comments || []).map((c: any) => ({
          id: c._id || c.id || `${Math.random()}`,
          content: c.content || c.body || "",
          author: {
            name: c.user?.name || c.author?.name || "User",
            avatar:
              c.user?.avatar ||
              c.author?.avatar ||
              "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
            isVerified: Boolean(
              c.user?.isVerified || c.author?.isVerified || false,
            ),
            reputation: c.user?.reputation || c.author?.reputation || 0,
          },
          createdAt: c.createdAt || c.created_at || new Date().toISOString(),
          likes: likeUserIds.length,
          dislikes: dislikeUserIds.length,
          hasUserLiked: likeUserIds.includes(userId),
          hasUserDisliked: dislikeUserIds.includes(userId),
          likeUserIds,
          dislikeUserIds,
          isReported: false,
        })),
        views: data.views ?? 0,
        isPinned: Boolean(data.isPinned || data.pinned || false),
        tags: data.tags || [],
        hasUserLiked: false,
        hasUserDisliked: false,
        reportedScamUrl: data.reportedScamUrl || data.reported_url || undefined,
        relatedDealId: data.relatedDealId || data.relatedDeal || undefined,
        isReported: Boolean(data.isReported || false),
      };
      console.log("Mapped Post Author Avatar:", mapped.author.avatar);
      setPost(mapped);
    } catch (err: any) {
      setError(err.message || "Unknown error fetching post");
    } finally {
      setLoading(false);
    }
  }, [idFromParams]);

  useEffect(() => {
    if (!idFromParams) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchPost();
    })();
    return () => {
      cancelled = true;
    };
  }, [idFromParams, fetchPost]);

  const getPostTypeColor = (type: ForumPost["type"]) => {
    switch (type) {
      case "scam-report":
        return "bg-red-50 hover:bg-red-100 text-red-500";
      case "question":
        return "bg-blue-50 hover:bg-blue-100 text-blue-500";
      case "deal-discussion":
        return "bg-green-50 hover:bg-green-100 text-green-500";
      case "general":
      default:
        return "bg-gray-50 hover:bg-gray-100 text-gray-600";
    }
  };

  const handleLike = async (postId: string) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const userId = JSON.parse(storedUser)?._id;
    if (!userId) return;

    setPost((prev) => {
      if (!prev) return prev;

      const likesSet = new Set(prev.likeUserIds);
      const dislikesSet = new Set(prev.dislikeUserIds);

      if (likesSet.has(userId)) {
        likesSet.delete(userId);
      } else {
        likesSet.add(userId);
        dislikesSet.delete(userId); // remove opposite vote
      }

      return {
        ...prev,
        likes: likesSet.size,
        dislikes: dislikesSet.size,
        hasUserLiked: likesSet.has(userId),
        hasUserDisliked: dislikesSet.has(userId),
        likeUserIds: Array.from(likesSet),
        dislikeUserIds: Array.from(dislikesSet),
      };
    });

    try {
      await fetch(`${baseURL}/forum/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch {
      fetchPost(); // rollback
    }
  };

  const handleDislike = async (postId: string) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const userId = JSON.parse(storedUser)?._id;
    if (!userId) return;

    setPost((prev) => {
      if (!prev) return prev;

      const likesSet = new Set(prev.likeUserIds);
      const dislikesSet = new Set(prev.dislikeUserIds);

      if (dislikesSet.has(userId)) {
        dislikesSet.delete(userId);
      } else {
        dislikesSet.add(userId);
        likesSet.delete(userId); // remove opposite vote
      }

      return {
        ...prev,
        likes: likesSet.size,
        dislikes: dislikesSet.size,
        hasUserLiked: likesSet.has(userId),
        hasUserDisliked: dislikesSet.has(userId),
        likeUserIds: Array.from(likesSet),
        dislikeUserIds: Array.from(dislikesSet),
      };
    });

    try {
      await fetch(`${baseURL}/forum/${postId}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch {
      fetchPost(); // rollback
    }
  };

  const fetchComments = useCallback(async () => {
    if (!idFromParams) return;

    try {
      const res = await fetch(
        `${baseURL}/forum/${encodeURIComponent(idFromParams)}/comments`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch comments (${res.status})`);
      }

      const data = await res.json();

      const mappedComments: Comment[] = data.map((c: any) => ({
        id: c._id,
        content: c.comment,
        author: {
          name: c.author?.name || "User",
          avatar:
            c.author?.avatar ||
            "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
          isVerified: Boolean(c.author?.isVerified),
          reputation: c.author?.reputation || 0,
        },
        createdAt: c.date,
        likes: Array.isArray(c.likes) ? c.likes.length : c.likes || 0,
        dislikes: Array.isArray(c.dislikes)
          ? c.dislikes.length
          : c.dislikes || 0,
        hasUserLiked: false,
        hasUserDisliked: false,
        isReported: false,
        // 🔥 keep replies if nested
        replies: c.replies || [],
      }));

      setComments(mappedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  }, [idFromParams]);

  useEffect(() => {
    if (!idFromParams) return;
    fetchPost();
    fetchComments();
  }, [idFromParams, fetchPost, fetchComments]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !idFromParams) return;

    setIsSubmittingComment(true);
    setError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser
        ? JSON.parse(storedUser)
        : { _id: "", name: "Anonymous", photo: "" };

      const payload = {
        comment: newComment,
        author: {
          userId: user._id,
          name: user.name,
          image: user.photo || "",
          isVerified: false,
          reputation: 0,
        },
        postId: idFromParams,
      };

      const res = await fetch(
        `${baseURL}/forum/${encodeURIComponent(idFromParams)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(
          text || `Failed to post comment (status ${res.status})`,
        );
      }

      await fetchComments();
      setNewComment(""); // Clear input
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      setError(err.message || "Failed to submit comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReport = (type: "post" | "comment", id: string) => {
    setReportTarget({ type, id });
    setShowReportModal(true);
  };

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(\s|^)(#\w+)/g);
    return parts.map((part, index) => {
      if (
        part &&
        (part as string).startsWith &&
        (part as string).startsWith("#")
      ) {
        return (
          <span
            key={index}
            className="text-blue-500 hover:text-blue-600 cursor-pointer"
            onClick={() => {
              router.push(
                `/forum?search=${encodeURIComponent(part as string)}`,
              );
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Format Views for display (e.g. 500.5k)
  const formatViews = (views: number) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
    return views;
  };

  const avatarSrc = getAuthorAvatar(post.author);

  return (
    <div className="min-h-screen bg-white">
      {/* Retaining Header but page styling matches image below it */}
      <Header />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2" />
            <p className="text-gray-500">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 text-red-700">
            Error: {error}
          </div>
        )}

        {/* Post Content */}
        {!loading && !error && post && (
          <div className="mb-10">
            {/* Author / Top Section */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Avatar */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={post.author.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                      style={{
                        backgroundColor: stringToColor(post.author.name || "U"),
                      }}
                    >
                      {(post.author.name || "U").charAt(0)}
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex flex-col min-w-0">
                  {/* Name + Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                      {(post.author.name || "User").split(" ")[0]}{" "}
                      {/* Only first name */}
                    </span>
                    {post.author.isVerified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />
                    )}
                    <span className="bg-blue-50 text-blue-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm tracking-wide">
                      Trusted
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-2 text-gray-400 text-xs mt-1 flex-wrap">
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{formatViews(post.views)} views</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Rep & Report Button */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-400 font-medium">
                  + {post.author.reputation || 0} rep
                </span>
                <button
                  onClick={() => handleReport("post", post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${getPostTypeColor(post.type)}`}
                >
                  <AlertOctagon className="w-3 h-3" />
                  <span>
                    {post.type === "scam-report"
                      ? "Scam report"
                      : post.type === "question"
                        ? "Question"
                        : post.type === "deal-discussion"
                          ? "Deal discussion"
                          : "General post"}
                  </span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {post.title}
            </h1>

            {/* Content Text */}
            <div className="text-gray-600 text-[15px] leading-relaxed mb-5 whitespace-pre-wrap">
              {post.content}
            </div>

            {/* Scam URL Warning Box */}
            {post.type === "scam-report" && post.reportedScamUrl && (
              <div className="border border-red-500 bg-[#FFF5F5] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="text-red-800 font-medium text-sm mb-1">
                      Reported Scam URL:
                    </div>
                    <a
                      href="#"
                      className="text-red-500 text-sm font-medium hover:underline break-all"
                    >
                      {post.reportedScamUrl}
                    </a>
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      ⚠️ Do not visit this URL. It has been reported as a scam.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Deal Link (Preserved logic) */}
            {post.relatedDealId && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 text-sm text-green-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Related to:{" "}
                  <a
                    href={`/deal/${post.relatedDealId}`}
                    className="font-semibold underline"
                  >
                    View Deal
                  </a>
                </span>
              </div>
            )}

            {/* Hashtags as blue text links */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-blue-500 hover:text-blue-600 font-medium text-sm cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/forum?search=${encodeURIComponent("#" + tag)}`,
                      )
                    }
                  >
                    #{tag}
                  </span>
                ))}
                {/* Preserving logic for tags in content vs tags array */}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-b border-gray-100 py-3">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    post.hasUserLiked
                      ? "text-green-600"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  <ThumbsUp
                    className={`w-5 h-5 ${post.hasUserLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">{post.likes}</span>
                </button>

                <button
                  onClick={() => handleDislike(post.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    post.hasUserDisliked
                      ? "text-red-600"
                      : "text-gray-500 hover:text-red-600"
                  }`}
                >
                  <ThumbsDown
                    className={`w-5 h-5 ${post.hasUserDisliked ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">{post.dislikes}</span>
                </button>
              </div>

              <button
                onClick={() => handleReport("post", post.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Comments Section */}
        {!loading && !error && post && (
          <CommentsSection
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            isSubmittingComment={isSubmittingComment}
            onSubmitComment={handleSubmitComment}
            onLike={handleLike}
            onDislike={handleDislike}
            onReport={handleReport}
            formatTimeAgo={formatTimeAgo}
            renderContentWithHashtags={renderContentWithHashtags}
          />
        )}
      </div>

      {/* Report Modal (Kept exactly as provided) */}
      {showReportModal && (
        <ReportModal
          target={reportTarget}
          onClose={() => {
            setShowReportModal(false);
            setReportTarget(null);
          }}
          onSubmit={async (reason) => {
            if (!reportTarget) return;
            try {
              const url = `http://localhost:5000/api/forum/${reportTarget.id}/report`;
              const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  targetType: reportTarget.type,
                  reason,
                }),
              });
              if (!res.ok) {
                const errorText = await res.text().catch(() => "");
                throw new Error(
                  `Failed to report (${res.status}): ${errorText}`,
                );
              }
              const data = await res.json();
              console.log("Report submitted successfully:", data);
              alert("Report submitted successfully.");
            } catch (err: any) {
              console.error("Error submitting report:", err);
              alert(`Error submitting report: ${err.message}`);
            } finally {
              setShowReportModal(false);
              setReportTarget(null);
            }
          }}
        />
      )}
    </div>
  );
}

// Report Modal Component (Unchanged)
interface ReportModalProps {
  target: { type: "post" | "comment"; id: string } | null;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

function ReportModal({ target, onClose, onSubmit }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    "Spam or unwanted content",
    "Harassment or bullying",
    "False information",
    "Inappropriate content",
    "Scam or fraud (not properly marked)",
    "Violation of community guidelines",
    "Other (please specify)",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const reason =
        selectedReason === "Other (please specify)"
          ? customReason
          : selectedReason;
      onSubmit(reason);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Report {target?.type === "post" ? "Post" : "Comment"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Why are you reporting this {target?.type}?
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center group cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mr-3 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      {reason}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === "Other (please specify)" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify:
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> False reports may result in account
                restrictions. Only report content that genuinely violates our
                community guidelines.
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !selectedReason ||
                  isSubmitting ||
                  (selectedReason === "Other (please specify)" &&
                    !customReason.trim())
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
