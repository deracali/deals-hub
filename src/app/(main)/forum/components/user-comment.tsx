"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  MapPin,
  ChevronDown,
  ArrowRight,
  CornerDownRight,
} from "lucide-react";

import { useParams } from "next/navigation";

/* --------------------------
   Small reusable components
   -------------------------- */

const CommentForm = ({
  placeholder,
  submitText,
  isReply = false,
  onCancel,
  value,
  onChange,
  onSubmit,
  isSubmitting = false,
}: {
  placeholder: string;
  submitText: string;
  isReply?: boolean;
  onCancel?: () => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}) => {
  return (
    <form onSubmit={onSubmit}>
      <textarea
        className="w-full p-4 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 placeholder-gray-400"
        placeholder={placeholder}
        rows={isReply ? 3 : 4}
        value={value}
        onChange={onChange}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit" // triggers form submit event
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          {submitText}
          <CheckCircle size={16} />
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const UserInfo = ({ user }: { user: any }) => (
  <div className="flex items-start justify-between w-full">
    <div className="flex items-start gap-3">
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
        <Image
          src={user.avatar || "https://via.placeholder.com/40"}
          alt={user.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-900">{user.name}</h4>
          {user.isVerified && (
            <CheckCircle size={14} className="text-blue-500" />
          )}
          {user.badge && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.badge.color}`}
            >
              {user.badge.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-gray-700">
            {user.rating}
          </span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-orange-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-1 text-gray-400 text-xs">
      <MapPin size={12} />
      <span>{user.location}</span>
    </div>
  </div>
);

/* --------------------------
   Core recursive Comment component
   -------------------------- */

// Update the destructured props to include updateComment
const Comment = ({
  comment,
  depth = 0,
  refreshComments,
  updateComment, // <--- Add this
}: {
  comment: any;
  depth?: number;
  refreshComments?: () => void;
  updateComment?: (updated: any) => void; // <--- Add this
}) => {
  // ... rest of component
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  const indent = depth * 36;

  const handleReplySubmit = async (
    e: React.FormEvent,
    parentCommentId: string,
  ) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser
        ? JSON.parse(storedUser)
        : { _id: "", name: "Anonymous", photo: "" };

      const payload = {
        comment: replyText,
        author: {
          userId: user._id,
          name: user.name,
          image: user.photo || "",
          isVerified: false,
          reputation: 0,
        },
        postId: comment.postId || "",
        parentCommentId,
      };

      await fetch(
        `${baseURL}/forum/${comment.postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      setReplyText("");
      setReplying(false);

      // ✅ Refresh the comments immediately
      if (refreshComments) refreshComments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleLike = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch(
        `${baseURL}/forum/${comment.postId}/comments/${comment.id}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id }),
        },
      );
      const data = await res.json();

      const updatedComment = {
        ...comment,
        likes: data.likes,
        dislikes: data.dislikes,
        hasUserLiked: data.hasUserLiked,
        hasUserDisliked: data.hasUserDisliked,
      };

      // ✅ update parent state without refetching everything
      if (updateComment) updateComment(updatedComment);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleDislike = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch(
        `${baseURL}/forum/${comment.postId}/comments/${comment.id}/dislike`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id }),
        },
      );
      const data = await res.json();

      // Create the updated object
      const updatedComment = {
        ...comment,
        likes: data.likes,
        dislikes: data.dislikes,
        hasUserLiked: data.hasUserLiked,
        hasUserDisliked: data.hasUserDisliked,
      };

      // Update parent state directly so the list never disappears
      if (updateComment) {
        updateComment(updatedComment);
      }
    } catch (err) {
      console.error("Dislike failed", err);
    }
  };

  return (
    <div
      className="py-6 border-b border-gray-100 last:border-0"
      style={{ marginLeft: indent }}
    >
      <div className="flex flex-col gap-2">
        <UserInfo user={comment.user} />

        <div>
          <p className="text-gray-800 leading-relaxed mt-2">{comment.text}</p>

          <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs font-medium">
            <span className="before:content-['•'] before:mr-2">
              {comment.timestamp}
            </span>
          </div>

          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors"
              type="button"
            >
              <ThumbsUp size={16} />
              <span className="text-sm font-medium">{comment.likes}</span>
            </button>

            <button
              onClick={handleDislike}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors"
              type="button"
            >
              <ThumbsDown size={16} />
              <span className="text-sm font-medium">{comment.dislikes}</span>
            </button>

            {depth === 0 && (
              <button
                className="text-blue-500 text-sm font-medium hover:underline"
                onClick={() => setReplying((v) => !v)}
                type="button"
              >
                Reply
              </button>
            )}

            {replies.length > 0 && (
              <div className="flex items-center gap-1 text-gray-400 text-sm ml-auto">
                <MessageSquare size={16} />
                <span>{replies.length}</span>
              </div>
            )}
          </div>

          {replying && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                <CornerDownRight size={16} />
                <span>Write a reply</span>
              </div>
              <CommentForm
                placeholder="Write your reply..."
                submitText="Submit reply"
                isReply
                onCancel={() => setReplying(false)}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onSubmit={(e) => handleReplySubmit(e, comment.id)} // <-- pass parentCommentId
                isSubmitting={isSubmittingReply}
              />
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4">
              {depth === 0 && (
                <button
                  onClick={() => setShowReplies((s) => !s)}
                  className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:underline mb-4"
                  type="button"
                >
                  {showReplies ? "Hide" : `View all ${replies.length} replies`}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showReplies ? "rotate-180" : ""}`}
                  />
                </button>
              )}

              {showReplies && (
                <div>
                  {replies.map((r: any) => (
                    <Comment
                      key={r.id}
                      comment={r}
                      depth={depth + 1}
                      refreshComments={refreshComments}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------
   CommunityDiscussion - top level
   -------------------------- */

/**
 * Props:
 * - newComment, setNewComment, isSubmittingComment, onSubmitComment are expected to be passed from parent
 * - other props can be provided but are optional
 */
type CommunityDiscussionProps = {
  newComment: string;
  setNewComment: (val: string) => void;
  isSubmittingComment: boolean;
  onSubmitComment: () => Promise<void> | void;
  onLike?: (isPost: boolean, id: string) => void;
  onDislike?: (isPost: boolean, id: string) => void;
  onReport?: (type: "post" | "comment", id: string) => void;
  formatTimeAgo?: (s: string) => string;
  renderContentWithHashtags?: (s: string) => React.ReactNode;
};

const mapApiCommentToUI = (comment: any, postId: string) => ({
  id: comment._id,
  postId, // ✅ KEEP IT
  user: {
    name: comment.author?.name || "Anonymous",
    avatar: comment.author?.image || "https://via.placeholder.com/40",
    isVerified: comment.author?.isVerified || false,
    badge: comment.author?.isVerified
      ? { text: "Trusted", color: "bg-blue-100 text-blue-600" }
      : null,
    rating: 5.0,
    location: "Nigeria",
  },
  text: comment.comment,
  timestamp: new Date(comment.date).toLocaleString(),
  likes: comment.likes ?? 0,
  dislikes: comment.dislikes ?? 0,
  replies: Array.isArray(comment.replies)
    ? comment.replies.map((r: any) => mapApiCommentToUI(r, postId))
    : [],
});

const CommunityDiscussion: React.FC<CommunityDiscussionProps> = ({
  newComment,
  setNewComment,
  isSubmittingComment,
  onSubmitComment,
  onLike,
  onDislike,
  onReport,
  formatTimeAgo,
  renderContentWithHashtags,
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const postId = params.id as string;
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const fetchComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${baseURL}/forum/${postId}/comments`,
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      const normalized = data.map((c: any) => mapApiCommentToUI(c, postId));
      setComments(normalized);
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) return;
    fetchComments();
  }, [postId]);

  const totalLikes = comments.reduce(
    (sum, c) => sum + (Number(c.likes) || 0),
    0,
  );

  // Use the props-provided submit handler (no local duplicate)
  // inside CommunityDiscussion component
  const handleSubmit = async (e: React.FormEvent) => {
    // forward the event to preventDefault AND pass it to parent
    e.preventDefault();
    if (!onSubmitComment) return;

    // pass event through so parent can use e if it expects it
    await onSubmitComment(e);

    // refresh local comments after parent completes posting
    await fetchComments();
  };

  return (
    <div className="bg-white p-0 md:p-6 rounded-2xl shadow-sm max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="font-bold text-gray-900 text-xl sm:text-2xl">
          Community Discussion ({comments.length})
        </h2>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Star size={16} className="text-orange-400" />
          <span className="font-bold text-gray-900 text-sm sm:text-base">
            4.8/5.0
          </span>
          <span className="text-gray-500 text-xs sm:text-sm">(1,200)</span>
        </div>

        <span className="text-gray-400 text-xs sm:text-sm flex-shrink-0">
          • 96% trusted score
        </span>
      </div>

      {/* Main Comment Form */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Drop a comment</h3>
        <CommentForm
          placeholder="Share your thought on the deal"
          submitText={isSubmittingComment ? "Submitting..." : "Submit comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmittingComment}
        />
      </div>

      {/* Comment Stats & View All */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-gray-500">
            <MessageSquare size={18} />
            <span className="font-medium">{comments.length}</span>
          </div>
        </div>
    
      </div>

      {/* Comment Threads */}
      {loading && <p className="text-gray-400 py-6">Loading comments...</p>}

      {/* Replace the old loading logic with this */}
      {loading && comments.length === 0 ? (
        <p className="text-gray-400 py-6">Loading comments...</p>
      ) : (
        <div className={loading ? "opacity-50" : ""}>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              depth={0}
              updateComment={(updated) => {
                setComments((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                );
              }}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6">
        <button
          className="text-blue-500 font-medium hover:underline"
          type="button"
        >
          View all comments
        </button>
      </div>
    </div>
  );
};

export default CommunityDiscussion;
