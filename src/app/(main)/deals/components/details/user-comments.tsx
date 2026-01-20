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
  CornerDownRight,
} from "lucide-react";

/* =========================
   Helpers
========================= */

const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return {
      _id: user._id,
      name: user.name,
      image: user.photo,
      isVerified: user.status === "active",
    };
  } catch (e) {
    return null;
  }
};

const mapApiComment = (c: any, dealId: string) => ({
  id: c._id,
  dealId, // Store dealId for API calls
  user: {
    name: c.author?.name || "Anonymous",
    avatar: c.author?.image || "https://via.placeholder.com/40",
    isVerified: c.author?.isVerified || false,
    rating: 5.0,
    location: "Nigeria",
  },
  text: c.comment,
  timestamp: new Date(c.date).toLocaleString(),
  likes: c.likes || 0,
  dislikes: c.dislikes || 0,
  // Ensure we track if the current user has voted
  hasUserLiked: c.hasUserLiked || [],
  hasUserDisliked: c.hasUserDisliked || [],
  replies: Array.isArray(c.replies)
    ? c.replies.map((r: any) => mapApiComment(r, dealId))
    : [],
});

/* =========================
   Comment Form
========================= */
const CommentForm = ({
  placeholder,
  submitText,
  isReply = false,
  onCancel,
  onSubmit,
  value,
  onChange,
  isSubmitting,
}: any) => {
  return (
    <div className="mt-3">
      <textarea
        value={value}
        onChange={onChange}
        className="w-full p-4 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
        placeholder={placeholder}
        rows={isReply ? 3 : 4}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          disabled={isSubmitting || !value?.trim()}
          onClick={onSubmit}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Submitting..." : submitText}
          <CheckCircle size={16} />
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:underline"
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================
   User Info
========================= */
const UserInfo = ({ user }: any) => (
  <div className="flex items-start justify-between w-full">
    <div className="flex items-start gap-3">
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
        <Image
          src={user.avatar}
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
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-gray-700">
            {user.rating.toFixed(1)}
          </span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className="text-orange-400 fill-current"
              />
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

/* =========================
   Recursive Comment
========================= */
const Comment = ({
  comment,
  depth = 0,
  dealId,
  refresh,
  updateComment,
}: any) => {
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const replies = Array.isArray(comment.replies) ? comment.replies : [];
  const indent = depth * 36;

  // ✅ Handle Like / Dislike
  const handleVote = async (action: "like" | "dislike") => {
    const user = getCurrentUser();
    if (!user) return alert(`Please login to ${action}`);

    try {
      const res = await fetch(
        `${baseURL}/deals/${dealId}/comments/${comment.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id }),
        },
      );
      const data = await res.json();

      // Update the state locally for immediate feedback
      if (updateComment) {
        updateComment({
          ...comment,
          likes: data.likes,
          dislikes: data.dislikes,
          hasUserLiked: data.hasUserLiked,
          hasUserDisliked: data.hasUserDisliked,
        });
      }
    } catch (err) {
      console.error(`${action} failed`, err);
    }
  };

  const submitReply = async () => {
    const currentUser = getCurrentUser();
    setIsSubmitting(true);
    try {
      await fetch(`${baseURL}/deals/${dealId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: currentUser,
          comment: replyText,
          parentCommentId: comment.id,
        }),
      });
      setReplyText("");
      setReplying(false);
      refresh?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="py-6 border-b border-gray-100 last:border-0"
      style={{ marginLeft: indent }}
    >
      <UserInfo user={comment.user} />
      <p className="text-gray-800 mt-2 leading-relaxed">{comment.text}</p>
      <div className="text-xs text-gray-400 mt-1">{comment.timestamp}</div>

      <div className="flex items-center gap-6 mt-3">
        {/* Like Button */}
        <button
          onClick={() => handleVote("like")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors"
        >
          <ThumbsUp size={16} />
          <span className="text-sm font-medium">{comment.likes}</span>
        </button>

        {/* Dislike Button */}
        <button
          onClick={() => handleVote("dislike")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors"
        >
          <ThumbsDown size={16} />
          <span className="text-sm font-medium">{comment.dislikes}</span>
        </button>

        <button
          onClick={() => setReplying(!replying)}
          className="text-blue-500 text-sm font-medium hover:underline"
        >
          Reply
        </button>

        {replies.length > 0 && (
          <div className="ml-auto flex items-center gap-1 text-gray-400">
            <MessageSquare size={16} />
            <span className="text-sm">{replies.length}</span>
          </div>
        )}
      </div>

      {replying && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
            <CornerDownRight size={16} />
            <span className="font-medium">Replying to {comment.user.name}</span>
          </div>
          <CommentForm
            placeholder="Write your reply..."
            submitText="Submit reply"
            isReply
            value={replyText}
            onChange={(e: any) => setReplyText(e.target.value)}
            onCancel={() => setReplying(false)}
            onSubmit={submitReply}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-4">
          {depth === 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-blue-500 text-sm mb-3 font-medium"
            >
              {showReplies ? "Hide replies" : `View ${replies.length} replies`}
              <ChevronDown
                size={16}
                className={`transition-transform ${showReplies ? "rotate-180" : ""}`}
              />
            </button>
          )}
          {showReplies &&
            replies.map((r: any) => (
              <Comment
                key={r.id}
                comment={r}
                depth={depth + 1}
                dealId={dealId}
                refresh={refresh}
                updateComment={updateComment}
              />
            ))}
        </div>
      )}
    </div>
  );
};

/* =========================
   Star Rating
========================= */
const StarRating = ({ dealId }: { dealId: string }) => {
  const [rating, setRating] = useState(0);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState(0);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;


  const fetchRating = async () => {
    try {
      const res = await fetch(
        `${baseURL}/deals/${dealId}/rating`,
      );
      const data = await res.json();
      setAverage(data.averageRating || 0);
      setCount(data.ratingsCount || 0);
    } catch (err) {
      console.error("Failed to fetch rating", err);
    }
  };

  useEffect(() => {
    if (dealId) fetchRating();
  }, [dealId]);

  const handleRate = async (value: number) => {
    const user = getCurrentUser();
    if (!user) return alert("Please login to rate this deal");

    setRating(value);

    try {
      const res = await fetch(
        `${baseURL}/deals/${dealId}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            rating: value,
          }),
        },
      );

      const data = await res.json();
      setAverage(data.averageRating);
      setCount(data.ratingsCount);
    } catch (err) {
      console.error("Rating failed", err);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={22}
            className={`cursor-pointer transition-colors ${
              (hover || rating || average) >= star
                ? "text-orange-400 fill-orange-400"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(star)}
          />
        ))}
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-semibold text-gray-900">
          {average.toFixed(1)}
        </span>
        <span className="mx-1">/</span>5
        <span className="ml-2 text-gray-400">({count} ratings)</span>
      </div>
    </div>
  );
};

/* =========================
   CommunityDiscussion
========================= */
const CommunityDiscussion = ({ dealId }: { dealId: string }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;



  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${baseURL}/deals/${dealId}/comments`,
      );
      const data = await res.json();
      setComments(data.map((c: any) => mapApiComment(c, dealId)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dealId) fetchComments();
  }, [dealId]);

  // ✅ Deep update helper to avoid full refresh on Like/Dislike
  const updateCommentInState = (updated: any) => {
    const updateRecursive = (list: any[]): any[] => {
      return list.map((c) => {
        if (c.id === updated.id) return { ...c, ...updated };
        if (c.replies.length > 0)
          return { ...c, replies: updateRecursive(c.replies) };
        return c;
      });
    };
    setComments((prev) => updateRecursive(prev));
  };

  const submitComment = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return alert("You must be logged in to comment");

    setIsSubmitting(true);
    try {
      await fetch(`${baseURL}/deals/${dealId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: currentUser,
          comment: newComment,
          parentCommentId: null,
        }),
      });
      setNewComment("");
      fetchComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="py-10 text-center text-gray-400">
        Loading discussion...
      </div>
    );

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm max-w-6xl mx-auto border border-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Community Discussion ({comments.length})
      </h2>
      <StarRating dealId={dealId} />
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-3">Drop a comment</h3>
        <CommentForm
          placeholder="Share your thought on the deal"
          submitText="Submit comment"
          value={newComment}
          onChange={(e: any) => setNewComment(e.target.value)}
          onSubmit={submitComment}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-gray-500">
            <MessageSquare size={18} />
            <span className="font-semibold">{comments.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-500">
            <ThumbsUp size={18} className="fill-current" />
            <span className="font-semibold">
              {comments.reduce((acc, c) => acc + (c.likes || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            depth={0}
            dealId={dealId}
            refresh={fetchComments}
            updateComment={updateCommentInState}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityDiscussion;
