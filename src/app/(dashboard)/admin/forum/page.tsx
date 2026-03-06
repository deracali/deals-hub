"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  ExternalLink,
  ChevronDown,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Eye,
  Flag,
  Pin
} from "lucide-react";

// Interfaces based on your JSON data
interface Author {
  name: string;
  photo: string;
  isVerified: boolean;
  reputation: number;
  image: string;
}

interface ForumPost {
  _id: string;
  title: string;
  content: string;
  type: string;
  author: Author;
  likes: number;
  views: number;
  isPinned: boolean;
  isReported: boolean;
  reportReason?: string;
  comments: any[];
  tags: string[];
}

export default function ForumsPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchPosts = async (pageNumber = 1) => {
    try {
      setLoading(true);
      // Using your specified endpoint
      const res = await fetch(
        `https://dealshub-server.onrender.com/api/forum/get?page=${pageNumber}&limit=${itemsPerPage}`
      );
      const json = await res.json();
      setPosts(json.data || []);
      setTotalPages(json.pages || 1);
      setPage(json.page || 1);
    } catch (err) {
      console.error("Failed to fetch forum posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const getReportStatusStyles = (isReported: boolean) => {
    return isReported
      ? "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]" // Red for reported
      : "bg-[#DCFCE7] text-[#22C55E] border-[#DCFCE7]"; // Green for safe
  };

  const getTypeStyles = (type: string) => {
    switch (type?.toLowerCase()) {
      case "general":
        return "text-[#007AFF] border-[#007AFF] bg-blue-50/30";
      case "announcement":
        return "text-[#8B5CF6] border-[#8B5CF6] bg-purple-50/30";
      default:
        return "text-gray-500 border-gray-200 bg-gray-50";
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="w-full bg-[#FDFDFD] min-h-screen p-8 font-sans">

      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#007AFF] p-1.5 rounded-md">
            <MessageSquare className="text-white w-4 h-4" />
          </div>
          <h1 className="text-[18px] font-bold text-[#0F172A]">Forum Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center justify-between min-w-[140px] px-4 py-2 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-500 shadow-sm">
            All Categories <ChevronDown size={14} className="ml-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between min-w-[140px] px-4 py-2 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-500 shadow-sm">
            Sort by: Newest <ChevronDown size={14} className="ml-4 text-gray-400" />
          </button>
          <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 shadow-sm">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Forum Posts Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F9FAFB] border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">Topic / Author</th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">Snippet</th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">Category</th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">Engagement</th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">Comments</th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">Loading Posts...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">No posts found</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  {/* Title & Author */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={post.author.image || `https://ui-avatars.com/api/?name=${post.author.name}`}
                          alt={post.author.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-bold text-[#1E293B] leading-tight line-clamp-1">
                            {post.title}
                          </span>
                          {post.isPinned && <Pin size={12} className="text-orange-500 fill-orange-500" />}
                        </div>
                        <span className="text-[11px] text-gray-400">by {post.author.name}</span>
                      </div>
                    </div>
                  </td>

                  {/* Content Snippet */}
                  <td className="px-6 py-4 max-w-[200px]">
                    <p className="text-[12px] text-gray-500 line-clamp-2 leading-snug">
                      {post.content}
                    </p>
                  </td>

                  {/* Type/Category */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${getTypeStyles(post.type)}`}>
                      {post.type}
                    </span>
                  </td>

                  {/* Engagement (Likes/Views) */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                        <ThumbsUp size={12} className="text-gray-400" /> {post.likes}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                        <Eye size={12} className="text-gray-400" /> {post.views}
                      </div>
                    </div>
                  </td>

                  {/* Comment Count */}
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-medium text-gray-600">
                      {post.comments?.length || 0} replies
                    </span>
                  </td>

                  {/* Status (Reported) */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold border text-center w-fit ${getReportStatusStyles(post.isReported)}`}>
                        {post.isReported ? "REPORTED" : "ACTIVE"}
                      </span>
                      {post.isReported && (
                        <span className="text-[10px] text-red-400 italic max-w-[100px] truncate" title={post.reportReason}>
                          {post.reportReason}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 text-[13px] font-bold text-gray-400 pr-4 disabled:opacity-50"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => handlePageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-bold ${
              p === page ? "bg-[#007AFF] text-white" : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 text-[13px] font-bold text-gray-400 pl-4 disabled:opacity-50"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
