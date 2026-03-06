"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  ExternalLink,
  ChevronDown,
  Users as UsersIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { VendorStats } from "../component/VendorStats";
import { VendorDetailModal } from "../component/VendorDetailModal";

interface Vendor {
  _id: string;
  name: string;
  businessAddress: string;
  location: string;
  country: string;
  subscription: "free" | "pro" | "premium";
  businessEmail: string;
  businessPhone: string;
  businessLogo: string;
  isVerified: boolean;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch paginated vendors
  const fetchVendors = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://dealshub-server.onrender.com/api/vendors/get?page=${pageNumber}&limit=${itemsPerPage}`
      );
      const json = await res.json();
      setVendors(json.data || []);
      setTotalPages(json.pages || 1);
      setPage(json.page || 1);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(page);
  }, [page]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#DCFCE7] text-[#22C55E] border-[#22C55E]"; // green
      case "rejected":
        return "bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5]"; // orange
      case "pending":
      default:
      return "bg-[#FEF9C3] text-[#F59E0B] border-[#FBBF24]"; // yellow
    }
  };



  const getSubscriptionStyles = (sub: string) => {
    switch (sub?.toLowerCase()) {
      case "premium":
        return "text-[#007AFF] border-[#007AFF] bg-blue-50/30";
      case "pro":
        return "text-[#F97316] border-[#F97316] bg-orange-50/30";
      case "free":
        return "text-[#6B7280] border-[#D1D5DB] bg-gray-50";
      default:
        return "text-gray-400 border-gray-200";
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="w-full bg-[#FDFDFD] min-h-screen p-8 font-sans">
      {selectedVendor && (
        <VendorDetailModal
    vendor={selectedVendor}
    onClose={() => setSelectedVendor(null)}
    onStatusChange={(id, newStatus) => {
      setVendors((prev) =>
        prev.map((v) =>
          v._id === id ? { ...v, status: newStatus } : v
        )
      );
    }}
  />

      )}

      <VendorStats />

      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#007AFF] p-1.5 rounded-md">
            <UsersIcon className="text-white w-4 h-4" />
          </div>
          <h1 className="text-[18px] font-bold text-[#0F172A]">Vendors</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center justify-between min-w-[140px] px-4 py-2 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-500 shadow-sm">
            All vendors <ChevronDown size={14} className="ml-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between min-w-[140px] px-4 py-2 bg-white border border-gray-100 rounded-lg text-[13px] text-gray-500 shadow-sm">
            Newest deals <ChevronDown size={14} className="ml-4 text-gray-400" />
          </button>
          <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 shadow-sm">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F9FAFB] border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Vendor image/Name
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Full Address
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Location
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Subscription
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Email
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Phone
              </th>
              <th className="px-6 py-4 text-[12px] font-medium text-gray-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  Loading Vendors...
                </td>
              </tr>
            ) : vendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr
                  key={vendor._id}
                  onClick={() => setSelectedVendor(vendor)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  {/* Image/Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={vendor.businessLogo || "https://avatar.vercel.sh/slyce"}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                        {vendor.isVerified && (
                          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[6px] text-white">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-[#1E293B] leading-tight">
                          {vendor.name}
                        </span>
                        <ExternalLink size={14} className="text-[#007AFF]" />
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="px-6 py-4 max-w-[280px]">
                    <p
                      className="text-[12px] text-gray-500 leading-snug"
                      title={vendor.businessAddress}
                    >
                      {vendor.businessAddress?.length > 65
                        ? vendor.businessAddress.slice(0, 65) + "..."
                        : vendor.businessAddress || "No address provided"}
                    </p>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-semibold text-gray-700">
                      {vendor.location}, {vendor.country}
                    </span>
                  </td>

                  {/* Subscription */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${getSubscriptionStyles(
                        vendor.subscription
                      )}`}
                    >
                      {vendor.subscription || "free"}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-medium text-gray-600">
                      {vendor.businessEmail}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-medium text-gray-600">
                      {vendor.businessPhone}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
      <span
        className={`px-4 py-1.5 rounded-md text-[11px] font-bold border ${getStatusStyles(vendor.status)}`}
      >
        {vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : "Pending"}
      </span>
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
