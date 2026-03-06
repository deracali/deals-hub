"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon
} from "lucide-react";
import { UserStats } from "../component/UserStats";
import { UserDetailModal } from "../component/UserDetailModal";

// Updated Interface to match your User API response
interface User {
  _id: string;
  email: string;
  status: "active" | "suspended" | "blocked";
  plan: string;
  role: string;
  type: string;
  dealsCount: number;
  dealsPosted: number;
  createdAt: string;
  // Fields not in snippet but kept for UI structure
  name?: string;
  address?: string;
  location?: string;
  phoneNumbers?: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);


  const handleOpenModal = async (user: User) => {
    try {
      // Optional: Add a small loading toast or change cursor to 'wait'
      const response = await fetch(`https://dealshub-server.onrender.com/api/users/${user._id}/details`);

      if (!response.ok) throw new Error("Failed to fetch details");

      const details = await response.json();
      setSelectedDetails(details);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Fallback: Use the data we already have from the list
      setSelectedDetails({
        user: user,
        vendor: null,
        orders: []
      });
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `https://dealshub-server.onrender.com/api/users?page=${page}&limit=${limit}`
        );

        const json = await response.json();

        setUsers(json.users || []);
        setTotalPages(json.pagination?.pages || 1);
        setTotalUsers(json.pagination?.total || 0);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit]);


  const updateUserStatusLocally = (
    userId: string,
    newStatus: "active" | "suspended" | "blocked"
  ) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, status: newStatus } : u
      )
    );

    // also update selected user if open
    setSelectedUser((prev) =>
      prev && prev._id === userId
        ? { ...prev, status: newStatus }
        : prev
    );
  };


  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]";
      case "blocked": return "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]";
      case "suspended": return "bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]";
      default: return "bg-gray-50 text-gray-500 border-gray-100";
    }
  };

  return (
    <div className="w-full bg-white min-h-screen p-8 font-sans">
    {selectedDetails && (
      <UserDetailModal
        data={selectedDetails}
        onClose={() => setSelectedDetails(null)}
        onStatusChange={updateUserStatusLocally}
      />
    )}


      <UserStats />

      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-[#F97316] p-1.5 rounded-md">
            <UsersIcon className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Users</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center justify-between gap-10 px-4 py-2 bg-white border border-gray-100 rounded-lg text-[12px] font-medium text-gray-500 shadow-sm">
            All Users <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="flex items-center justify-between gap-10 px-4 py-2 bg-white border border-gray-100 rounded-lg text-[12px] font-medium text-gray-500 shadow-sm">
            Newest Deals <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-300">
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-gray-50 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F9FAFB]">
            <tr>
              <th className="px-5 py-3 text-[11px] font-medium text-gray-400 whitespace-nowrap uppercase">User / Role</th>
              <th className="px-5 py-3 text-[11px] font-medium text-gray-400 whitespace-nowrap uppercase">Plan</th>
              <th className="px-5 py-3 text-[11px] font-medium text-gray-400 whitespace-nowrap uppercase">Deals Count</th>
              <th className="px-5 py-3 text-[11px] font-medium text-gray-400 whitespace-nowrap uppercase">Email address</th>
              <th className="px-5 py-3 text-[11px] font-medium text-gray-400 whitespace-nowrap uppercase">Joined Date</th>
              <th className="px-5 py-3 text-[11px] font-medium text-gray-400 whitespace-nowrap uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Fetching users...</td></tr>
            ) : (
              users.map((user) => (
                <tr
    key={user._id}
    // Change this from setSelectedUser(user) to handleOpenModal(user)
    onClick={() => handleOpenModal(user)}
    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
  >
                  {/* User Info */}
                  <td className="px-5 py-5 min-w-[180px]">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#007AFF] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
  {user.photo ? (
    <img
      src={user.photo}
      alt={user.name || "User avatar"}
      className="w-full h-full object-cover"
    />
  ) : (
    <span>
      {user.email
        .split("@")[0]           // take the part before "@"
        .split(/[\.\-_]/)        // split by dot, dash, underscore
        .map((word) => word[0].toUpperCase()) // take first letter uppercase
        .slice(0, 2)             // max 2 letters
        .join("")}
    </span>
  )}
</div>

                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-gray-800 leading-tight">
                          {user.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-orange-500 font-medium">{user.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-5 py-5">
                    <p className="text-[11.5px] font-bold text-gray-600 uppercase">
                      {user.plan || "free"}
                    </p>
                  </td>

                  {/* Deals Count */}
                  <td className="px-5 py-5">
                    <p className="text-[11.5px] font-semibold text-gray-600">
                      {user.dealsCount} deals
                    </p>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-5">
                    <p className="text-[11.5px] font-semibold text-gray-600">
                      {user.email}
                    </p>
                  </td>

                  {/* Joined Date */}
                  <td className="px-5 py-5">
                    <p className="text-[11.5px] font-semibold text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-5">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold border uppercase ${getStatusStyles(user.status)}`}>
                        {user.status}
                      </span>
                      <button
    onClick={() => handleOpenModal(user)} // Call the fetch function here
    className="hover:text-blue-600"
  >
    <MoreVertical size={16} />
  </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* Pagination */}
  <div className="mt-12 flex items-center justify-center gap-4">
    {/* Previous */}
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => Math.max(p - 1, 1))}
      className={`flex items-center gap-1 text-[12px] font-bold ${
        page === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:text-black"
      }`}
    >
      <ChevronLeft size={16} /> Previous
    </button>

    {/* Page numbers */}
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(Math.max(0, page - 3), page + 2)
        .map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-[12px] font-bold ${
              n === page
                ? "bg-[#007AFF] text-white"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {n}
          </button>
        ))}
    </div>

    {/* Next */}
    <button
      disabled={page === totalPages}
      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
      className={`flex items-center gap-1 text-[12px] font-bold ${
        page === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-800 hover:opacity-70"
      }`}
    >
      Next <ChevronRight size={16} />
    </button>
  </div>

    </div>
  );
}
