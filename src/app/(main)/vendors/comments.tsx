"use client";

import React, { useEffect, useState } from "react";
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

/* =========================
   Helpers & Mapping
========================= */

const getCurrentUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return {
      userId: u._id,
      name: u.name,
      image: u.photo,
      isVerified: u.status === "active",
      reputation: 100,
    };
  } catch {
    return null;
  }
};

const mapApiComment = (c: any, vendorId: string) => ({
  id: c._id,
  vendorId, // Store this to build the API URL
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
  hasUserLiked: c.hasUserLiked || [],
  hasUserDisliked: c.hasUserDisliked || [],
  replies: Array.isArray(c.replies)
    ? c.replies.map((r: any) => mapApiComment(r, vendorId))
    : [],
});

/* =========================
   Sub-Components
========================= */

const CommentForm = ({
  placeholder,
  submitText,
  isReply,
  onCancel,
  onSubmit,
  value,
  onChange,
  isSubmitting,
}: any) => (
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
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg disabled:opacity-50"
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
   Recursive Comment Component
========================= */

const Comment = ({ comment, depth, vendorId, refresh, updateComment }: any) => {
  const [showReplies, setShowReplies] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const replies = comment.replies || [];
  const indent = depth * 36;

  const handleAction = async (action: "like" | "dislike") => {
    try {
      const user = getCurrentUser();
      if (!user) return alert("Please log in to vote.");

      const res = await fetch(
        `${baseURL}/vendors/${vendorId}/comments/${comment.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId }),
        },
      );
      const data = await res.json();

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
    setIsSubmitting(true);
    const user = getCurrentUser();
    try {
      await fetch(`${baseURL}/vendors/${vendorId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user,
          comment: replyText,
          parentCommentId: comment.id,
        }),
      });
      setReplyText("");
      setReplying(false);
      refresh();
    } catch (err) {
      console.error(err);
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
        <button
          onClick={() => handleAction("like")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-green-500 transition-colors"
        >
          <ThumbsUp size={16} />
          <span className="text-sm font-medium">{comment.likes}</span>
        </button>

        <button
          onClick={() => handleAction("dislike")}
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
            <span>Replying to {comment.user.name}</span>
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
                vendorId={vendorId}
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
   Main Discussion Component
========================= */

const CommunityDiscussion = ({ vendorId }: { vendorId: string }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${baseURL}/vendors/${vendorId}/comments`,
      );
      const data = await res.json();
      setComments(data.map((c: any) => mapApiComment(c, vendorId)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchComments();
  }, [vendorId]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    const user = getCurrentUser();
    try {
      await fetch(`${baseURL}/vendors/${vendorId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user,
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

  // ✅ Recursive helper to update a single comment deep in the tree
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

  if (loading)
    return (
      <div className="py-10 text-center text-gray-400 animate-pulse">
        Loading discussion...
      </div>
    );

  return (
  <div className="bg-white font-sans mb-20">
    <div className="container mx-auto px-4">
      <div className="p-6 md:p-8 rounded-2xl shadow-sm border border-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Community Discussion ({comments.length})
      </h2>

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

      <div className="border-b border-gray-100 pb-6 mb-6 flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex items-center gap-1.5 text-gray-500">
            <MessageSquare size={18} />
            <span className="font-semibold">{comments.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-500">
            <ThumbsUp size={18} className="fill-current" />
            <span className="font-semibold">
              {comments.reduce((a, c) => a + (c.likes || 0), 0)}
            </span>
          </div>
        </div>
        <button className="flex items-center gap-1 text-blue-500 font-semibold hover:underline">
          View all reviews
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-2">
        {comments.map((c) => (
          <Comment
            key={c.id}
            comment={c}
            depth={0}
            vendorId={vendorId}
            refresh={fetchComments}
            updateComment={updateCommentInState}
          />
        ))}
      </div>
    </div>
    </div>
    </div>
  );
};

export default CommunityDiscussion;
