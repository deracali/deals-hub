"use client";

import { useState, useEffect } from "react";
import Header from "@/components/general/header";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  MessageCircle,
  Share2,
  Flag,
  Search,
  TrendingUp,
  Bell,
  ShieldQuestion,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Pin,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  X,
  Tag,
  Info,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ForumPost } from "@/types/forum";
import { fetchForumPosts, createForumPost } from "@/services/forum";
import { stringToColor } from "@/utils/colorUtils";

// resolves a real author image or returns undefined so UI can show initials
const resolveAuthorPhoto = (author: any): string | undefined => {
  if (!author) return undefined;
  const candidates = [
    author.photo,
    author.image,
    author.avatar,
    author.picture,
    author.imageUrl,
    author.profilePicture,
  ];
  const raw = candidates.find((c) => c && String(c).trim() !== "");
  if (!raw) return undefined;
  const s = String(raw).trim();
  const placeholderPatterns = [
    "pexels.com/photos/220453/pexels-photo-220453.jpeg",
    "example.com/placeholder-image.jpg",
  ];
  if (placeholderPatterns.some((p) => s.includes(p))) return undefined;
  return s;
};

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [page, setPage] = useState(1);
const [pages, setPages] = useState(1);
const [loadingMore, setLoadingMore] = useState(false);

  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: ForumPost["type"];
  } | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const postCounts = {
    all: posts.length,
    question: posts.filter((p) => p.type === "question").length,
    "scam-report": posts.filter((p) => p.type === "scam-report").length,
    "deal-discussion": posts.filter((p) => p.type === "deal-discussion").length,
    general: posts.filter((p) => p.type === "general").length,
  };

  // transform backend post shape -> ForumPost
  const mapServerPost = (p: any): ForumPost => {
    return {
      id: p._id ?? String(Math.random()),
      title: p.title ?? "",
      content: p.content ?? "",
      type: (p.type as ForumPost["type"]) ?? "general",
      author: {
        name: p.author?.name ?? "Unknown",
        photo: resolveAuthorPhoto(p.author),
        isVerified: !!p.author?.isVerified,
        reputation: p.author?.reputation ?? 0,
      },
      createdAt: p.createdAt ?? new Date().toISOString(),
      likes: Array.isArray(p.likes) ? p.likes.length : Number(p.likes) || 0,
      dislikes: Array.isArray(p.dislikes)
        ? p.dislikes.length
        : Number(p.dislikes) || 0,
      hasUserLiked: Boolean(p.hasUserLiked),
      hasUserDisliked: Boolean(p.hasUserDisliked),

      comments: Array.isArray(p.comments) ? p.comments : [],
      views: p.views ?? 0,
      isPinned: !!p.isPinned,
      tags: Array.isArray(p.tags) ? p.tags : p.tags ? [String(p.tags)] : [],
      reportedScamUrl: p.reportedScamUrl ?? "",
      relatedDealId: p.relatedDealId ?? null,
      isReported: !!p.isReported,
    };
  };


  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const res = await fetchForumPosts(1, 10);

      setPosts(res.posts);
      setPage(res.page);
      setPages(res.pages);
      setLoading(false);
    };
    loadPosts();
  }, []);


  const loadMorePosts = async () => {
    if (page >= pages || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await fetchForumPosts(nextPage, 10);


    setPosts(prev => [...prev, ...res.posts]);
    setPage(res.page);
    setLoadingMore(false);
  };

  const handleReportSubmit = async (reason: string) => {
    if (!reportTarget) return;

    setIsReporting(true);

    try {
      const url = `${baseURL}/forum/${reportTarget.id}/report`;
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
        throw new Error(`Failed to report (${res.status}): ${errorText}`);
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
      setReportReason("");
      setIsReporting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("Please log in to like or dislike posts!");
        return;
      }

      const { id: userId } = JSON.parse(storedUser);

      const res = await fetch(
        `${baseURL}/forum/${postId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      const updated = await res.json();

      // 🔁 Update ONLY the clicked post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: updated.likes ?? p.likes,
                dislikes: updated.dislikes ?? p.dislikes,
                hasUserLiked: updated.hasUserLiked ?? p.hasUserLiked,
                hasUserDisliked: updated.hasUserDisliked ?? p.hasUserDisliked,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDislike = async (postId: string) => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
  alert("Please log in to like or dislike posts!");
  return;
}

      const { id: userId } = JSON.parse(storedUser);

      const res = await fetch(
        `${baseURL}/forum/${postId}/dislike`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      const updated = await res.json();

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: updated.likes,
                dislikes: updated.dislikes,
                hasUserLiked: updated.hasUserLiked,
                hasUserDisliked: updated.hasUserDisliked,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Error disliking post:", err);
    }
  };





  // helper to normalize the search query
  const normalizeQuery = (s: string) =>
    (s || "").toString().trim().toLowerCase().replace(/^#/, "");

  // SEARCH + TYPE filter
  const filteredPosts = posts.filter((post) => {
    const q = normalizeQuery(searchTerm);
    const matchesType = selectedType === "all" || post.type === selectedType;

    if (!q) return matchesType;

    const inTitle = post.title.toLowerCase().includes(q);
    const inContent = post.content.toLowerCase().includes(q);
    const inTags = (post.tags || []).some((tag) =>
      tag.toLowerCase().includes(q),
    );
    const inAuthor = post.author?.name?.toLowerCase().includes(q);

    return matchesType && (inTitle || inContent || inTags || inAuthor);
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "popular") {
      return b.likes - b.dislikes - (a.likes - a.dislikes);
    }
    if (sortBy === "discussed") {
      return b.comments - a.comments;
    }
    return 0;
  });

  const renderContentWithHashtags = (content: string) => {
    const parts = content.split(/(\s|^)(#\w+)/g);
    return parts.map((part, index) => {
      if (part && part.startsWith && part.startsWith("#")) {
        const clean = part.replace(/^#/, "");
        return (
          <span
            key={index}
            className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
            onClick={() => setSearchTerm(clean)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "scam-report":
        return <AlertTriangle className="w-4 h-4 text-white" />;
      case "question":
        return <HelpCircle className="w-4 h-4" />;
      case "deal-discussion":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <Header />

      {/* Hero / Header Section */}
      {/* Hero / Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Mobile Back Button (Visible only on small screens) */}
          <div className="sm:hidden mb-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">Back</span>
            </button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Custom Icon Container (The orange/white box) */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-[#FFF4ED] border border-[#FFDCC3] rounded-2xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/Frame 2147223395.png" // Ensure this path matches your image asset
                    alt="Forum Icon"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Text Details */}
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                  Community Forum
                </h1>
                <p className="text-gray-500 text-sm mt-1 leading-tight max-w-[240px] sm:max-w-none">
                  Share experiences, ask questions, and help keep our community
                  safe
                </p>

                {/* Community Guidelines Link */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowGuidelines(!showGuidelines)}
                    className="flex items-center gap-1.5 text-blue-500 text-sm font-medium mt-3 hover:underline"
                  >
                    <Info className="w-4 h-4" />
                    Community guidelines
                  </button>
                </div>
              </div>
            </div>

            {/* Blue Plus Button */}
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-[#0085FF] hover:bg-blue-600 text-white rounded-2xl w-14 h-14 sm:w-auto sm:h-12 sm:px-6 flex items-center justify-center shadow-lg shadow-blue-100 transition-all shrink-0"
            >
              <Plus className="w-8 h-8 sm:mr-2" />
              <span className="hidden sm:inline font-bold">Create a post</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Sort Section (Updated for mobile layout) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Search for post or keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-14 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-700"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0085FF] text-white p-3 rounded-xl hover:bg-blue-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="w-fit">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="recent">Most recents</option>
                <option value="popular">Popular</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 flex flex-col text-[8px]">
                <span>▲</span>
                <span className="-mt-1">▼</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl bg-white mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-8 hidden md:block">
            {/* Community Stats */}
            <div className="bg-transparent space-y-4 px-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Community Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Posts</span>
                  <span className="font-bold text-gray-900">
                    {posts.length.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active Users</span>
                  <span className="font-bold text-gray-900">456</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Scam Reports</span>
                  <span className="font-bold text-gray-900">
                    {posts.filter((p) => p.type === "scam-report").length || 89}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Post Types Navigation */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Post Types
              </h3>
              <div className="space-y-1">
                {[
                  {
                    id: "all",
                    name: "All posts",
                    count: postCounts.all,
                    icon: Bell,
                    color: "text-blue-500",
                  },
                  {
                    id: "question",
                    name: "Questions",
                    count: postCounts.question,
                    icon: ShieldQuestion,
                    color: "text-green-500",
                  },
                  {
                    id: "scam-report",
                    name: "Scam reports",
                    count: postCounts["scam-report"],
                    icon: AlertTriangle,
                    color: "text-red-500",
                  },
                  {
                    id: "deal-discussion",
                    name: "Deal discussions",
                    count: postCounts["deal-discussion"],
                    icon: Tag,
                    color: "text-orange-500",
                  },
                  {
                    id: "general",
                    name: "General",
                    count: postCounts.general,
                    icon: MessageSquare,
                    color: "text-blue-400",
                  },
                ].map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedType === type.id
                          ? "bg-gray-50 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`w-4 h-4 ${type.color}`} />
                        <span className="text-gray-500">{type.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {type.count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forum Rules Widget */}
            <div className="bg-[#eff6ff] border-[1.5px] border-[#3b82f6] rounded-[20px] p-5 w-fit">
              {/* Header: Very tight gap and specific font weight */}
              <div className="flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4 text-[#3b82f6]" />
                <h3 className="text-[15px] font-semibold text-black">
                  Forum Rules
                </h3>
              </div>

              {/* List: whitespace-nowrap prevents breaking, list-inside keeps bullets tight to text */}
              <ul className="text-[14px] text-black space-y-0.5 list-disc list-inside">
                <li className="whitespace-nowrap">
                  Be respectful and constructive
                </li>
                <li className="whitespace-nowrap">No spam or self-promotion</li>
                <li className="whitespace-nowrap">
                  External links only for scam reports
                </li>
                <li className="whitespace-nowrap">
                  Verify information before posting
                </li>
                <li className="whitespace-nowrap">
                  Report suspicious activity
                </li>
              </ul>
            </div>
          </div>

          {/* MAIN FEED */}
          <div className="lg:col-span-9 space-y-6">

            {/* Posts Feed */}
            <div className="space-y-6">
              {sortedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow relative"
                >
                  {/* Post Header: Avatar + Meta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {post.author?.photo ? (
                          <img
                            src={post.author.photo}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm"
                            style={{
                              backgroundColor: stringToColor(
                                post.author?.name || "User",
                              ),
                            }}
                          >
                            {(post.author?.name || "U").charAt(0)}
                          </div>
                        )}
                        {post.author?.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-[2px] border-2 border-white">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
  {post.author?.name.split(" ")[0]}{" "}
  {post.author?.name === "Slyce" ? "(YOU)" : ""}
</span>

                          {/* Verified Badge / Reputation Pill */}
                          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Trusted
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 gap-1">
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />{" "}
                            {post.views > 1000
                              ? `${(post.views / 1000).toFixed(1)}k`
                              : post.views}{" "}
                            views
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
    {post.type === "scam-report" && (
      <span className="bg-red-50 text-red-500 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 border border-red-100">
        <AlertTriangle className="w-3 h-3" /> Scam 
      </span>
    )}

    {post.type === "question" && (
      <span className="bg-green-50 text-green-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
        <HelpCircle className="w-3 h-3" /> Question
      </span>
    )}

    {post.type === "general" && (
      <span className="bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
        <MessageSquare className="w-3 h-3" /> Discussion
      </span>
    )}

    {post.type === "deal-discussion" && (
      <span className="bg-orange-50 text-orange-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
        <Tag className="w-3 h-3" /> Deal
      </span>
    )}
  </div>

                  </div>

                  {/* Title & Content */}
                  <div className="mb-4">
                    <Link href={`/forum/${post.id}`}>
                      <h2 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                    </Link>
                    <Link href={`/forum/${post.id}`}>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {renderContentWithHashtags(post.content)}
                    </p>
                    </Link>

                    {/* Inline Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-blue-500 text-xs font-medium cursor-pointer hover:underline"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SCAM ALERT BOX (Conditional) */}
                  {post.type === "scam-report" && post.reportedScamUrl && (
                    <div className="mb-5 rounded-xl overflow-hidden border border-red-200">
                      <div className="bg-red-50 p-3 flex flex-col sm:flex-row sm:items-center gap-2 text-red-700 text-sm">
                        <div className="flex items-center gap-2 font-semibold min-w-fit">
                          <AlertTriangle className="w-4 h-4" />
                          Reported Scam URL:
                        </div>
                        <a
                          href={post.reportedScamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all bg-white/50 px-2 py-1 rounded border border-red-100 text-red-700 underline hover:text-red-900"
                        >
                          {post.reportedScamUrl}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      {/* Likes */}
                      <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded hover:bg-white transition-colors ${post.hasUserLiked ? "text-green-600" : "text-gray-600"}`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {post.likes}
                        </button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <button
                          onClick={() => handleDislike(post.id)}
                          className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded hover:bg-white transition-colors ${post.hasUserDisliked ? "text-red-600" : "text-gray-600"}`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {post.dislikes}
                        </button>
                      </div>

                      {/* Comments */}
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                        <MessageSquare className="w-4 h-4" />
                        {post.comments.length}
                      </div>


                    </div>

                    <button
                      onClick={() => {
                        setReportTarget({ id: post.id, type: post.type });
                        setShowReportModal(true);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-xs"
                    >
                      <Flag className="w-4 h-4" />
                      <span className="hidden sm:inline">Report post</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {sortedPosts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No posts found
                </h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find anything matching your search.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}

            {/* This code goes right after your posts list ends */}
            {page < pages && (
              <div className="flex justify-center mt-8 mb-12">
                <Button
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-8 py-6 rounded-2xl font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>{loadingMore ? "Loading..." : "Load more posts"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODALS */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={(newPost) => {
            setPosts((prev) => [
              {
                ...newPost,
                likes: 0,
                dislikes: 0,
                hasUserLiked: false,
                hasUserDisliked: false,
                comments: [],
                views: 0,
              },
              ...prev,
            ]);

            setShowSuccessModal(true);
          }}
        />
      )}

      {showReportModal && reportTarget && (
        <ReportPostModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReportSubmit}
          isSubmitting={isReporting}
          reason={reportReason}
          setReason={setReportReason}
        />
      )}

      {showSuccessModal && (
        <PostSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
      {/* MOBILE COMMUNITY GUIDELINES OVERLAY */}
      {showGuidelines && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowGuidelines(false)}
          />

          {/* Content Area */}
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setShowGuidelines(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-8 mt-8">
                {/* Community Stats Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Community Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-500">Total Posts</span>
                      <span className="font-bold text-gray-900">
                        {posts.length.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-500">Active Users</span>
                      <span className="font-bold text-gray-900">456</span>
                    </div>
                    <div className="flex items-center justify-between text-base">
                      <span className="text-gray-500">Scam Reports</span>
                      <span className="font-bold text-gray-900">89</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Post Types Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Post Types
                  </h3>
                  <div className="space-y-1">
                    {[
                      {
                        id: "all",
                        name: "All posts",
                        count: postCounts.all,
                        icon: Bell,
                        color: "text-blue-500",
                      },
                      {
                        id: "question",
                        name: "Questions",
                        count: postCounts.question,
                        icon: ShieldQuestion,
                        color: "text-green-500",
                      },
                      {
                        id: "scam-report",
                        name: "Scam reports",
                        count: postCounts["scam-report"],
                        icon: AlertTriangle,
                        color: "text-red-500",
                      },
                      {
                        id: "deal-discussion",
                        name: "Deal discussions",
                        count: postCounts["deal-discussion"],
                        icon: Tag,
                        color: "text-orange-500",
                      },
                      {
                        id: "general",
                        name: "General",
                        count: postCounts.general,
                        icon: MessageSquare,
                        color: "text-blue-400",
                      },
                    ].map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedType(type.id);
                            setShowGuidelines(false);
                          }}
                          className={`w-full flex items-center justify-between py-3 rounded-lg text-base transition-all ${
                            selectedType === type.id
                              ? "font-bold"
                              : "text-gray-600"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent
                              className={`w-5 h-5 ${type.color}`}
                            />
                            <span className="text-gray-500">{type.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {type.count.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Forum Rules Widget */}
                <div className="bg-[#eff6ff] border-[1.5px] border-[#3b82f6] rounded-[20px] p-5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info className="w-4 h-4 text-[#3b82f6]" />
                    <h3 className="text-[15px] font-semibold text-black">
                      Forum Rules
                    </h3>
                  </div>
                  <ul className="text-[14px] text-black space-y-1.5 list-disc list-inside">
                    <li>Be respectful and constructive</li>
                    <li>No spam or self-promotion</li>
                    <li>External links only for scam reports</li>
                    <li>Verify information before posting</li>
                    <li>Report suspicious activity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// CREATE POST MODAL (Styled to match the second image)
// ----------------------------------------------------------------------------
interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (post: ForumPost) => void;
}

function CreatePostModal({ onClose, onSubmit }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general" as ForumPost["type"],
    tags: "",
    scamUrl: "",
    relatedDealId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "scam-report" && !formData.scamUrl.trim()) {
      alert("Scam reports must include a URL.");
      return;
    }

    await createForumPost(formData, onSubmit, onClose, setIsSubmitting);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
          <button
            onClick={onClose}
            className="flex cursor-pointer items-center text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4 mr-1" /> Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[75vh]"
        >
          <div className="space-y-6">
            {/* Post Type Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Post Type*
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as ForumPost["type"],
                    }))
                  }
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="general">💬 General discussion</option>
                  <option value="question">❓ Question</option>
                  <option value="scam-report">🚨 Scam Alert</option>
                  <option value="deal-discussion">🏷️ Deal Discussion</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <div className="flex flex-col text-[10px]">
                    <span>▲</span>
                    <span className="-mt-1">▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Title*
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="Which best deal have you gotten on this platform"
                required
              />
            </div>

            {/* Content Area */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Content*
              </label>
              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Hey everyone! 👋 I've seen some really amazing offers lately and I'm curious..."
                  required
                />
                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>
                    External links are not allowed except for scam reports. Use
                    hashtags like #Question #Rev
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Hashtags */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Additional Hashtags (Optional)
              </label>

              <div className="bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 flex items-center flex-wrap gap-2">
                {/* Render tags */}
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    #{tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() =>
                        setTags((prev) => prev.filter((_, i) => i !== index))
                      }
                    />
                  </div>
                ))}

                {/* Input */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      const cleanTag = tagInput.trim().replace("#", "");
                      if (!cleanTag || tags.includes(cleanTag)) return;

                      setTags((prev) => [...prev, cleanTag]);
                      setTagInput("");
                    }
                  }}
                  className="bg-transparent border-none outline-none text-sm min-w-[150px] flex-1 text-gray-600 placeholder:text-gray-400 px-2"
                  placeholder="Type and press Enter to add hashtags"
                />
              </div>

              <p className="text-[10px] text-gray-400 italic">
                Hashtags in your content will be automatically detected.
              </p>
            </div>

            {/* Scam URL (ONLY for scam reports) */}
            {formData.type === "scam-report" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                  Scam URL <span className="text-red-500">*</span>
                </label>

                <input
                  type="url"
                  value={formData.scamUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scamUrl: e.target.value,
                    }))
                  }
                  required
                  className="w-full bg-white border border-red-300 rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  placeholder="https://scam-website.com"
                />

                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Scam reports must include a valid URL.
                </p>
              </div>
            )}

            {/* Posting Guidelines Box - Now with visible light blue border */}
            <div className="bg-blue-50/50 border border-blue-400 rounded-xl p-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">
                  Posting Guidelines
                </h4>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Be respectful and constructive in your posts</li>
                  <li>Provide accurate information and verify facts</li>
                  <li>Use appropriate post types for better categorization</li>
                  <li>Use hashtags to help others find relevant content</li>
                  <li>External links only allowed for scam reports</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 cursor-pointer rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 cursor-pointer rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2
    ${
      isSubmitting
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }
    text-white`}
            >
              {isSubmitting ? "Posting…" : "Create a post"}
              {!isSubmitting && <Plus className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// REPORT MODAL (Kept consistent with new style)
// ----------------------------------------------------------------------------
interface ReportPostModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting: boolean;
  reason: string;
  setReason: (val: string) => void;
}

function ReportPostModal({
  onClose,
  onSubmit,
  isSubmitting,
  reason,
  setReason,
}: ReportPostModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <Flag className="w-5 h-5" />
            <h3 className="text-lg font-bold">Report Post</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Please tell us why you are reporting this post. Reports are anonymous.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] mb-4"
          placeholder="e.g. This is a scam, abusive content, spam..."
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={isSubmitting || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PostSuccessModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-sm px-6 py-8 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Illustration */}
        <div className="flex justify-center mb-4">
          <img
            src="/success-post.png" // <-- replace with your illustration path
            alt="Success"
            className="w-24 h-24"
          />
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Your post has been successfully published to the community.
        </p>

        <div className="space-y-3">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            View post
          </Button>

          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
