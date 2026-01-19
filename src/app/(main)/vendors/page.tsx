"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Star,
  ExternalLink,
  Verified,
  Store,
  Globe,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight, // Added for better icons
} from "lucide-react";
import Image from "next/image";
import Icon from "@/components/ui/icon";
import Header from "@/components/general/header";
import { Button } from "@/components/ui/button";
import SearchSection from "../vendors/popular-search";
import StoreCard from "./top-vendors";
import { useRouter } from "next/navigation";

interface Vendor {
  id: string;
  name: string;
  description: string;
  location: string;
  country: string;
  type: "local" | "international";
  rating: number;
  totalDeals: number;
  totalReviews: number;
  // use the business-prefixed fields (with fallbacks)
  businessLogo: string;
  businessBanner: string;
  isVerified: boolean;
  categories: string[];
  joinedDate: string;
  responseTime: string;
}

// --- Pagination UI Component (Inserted here for completeness) ---

/**
 * Pagination UI Component based on the user's image request.
 * Centered and styled with Tailwind CSS.
 */
const PaginationUI = ({
  currentPage = 1,
  totalPages = 68,
  onPageChange = () => {},
}) => {
  const PageButton = ({ page, isActive, onClick }) => (
    <button
      onClick={() => onClick(page)}
      className={`
        w-10 cursor-pointer  h-10 mx-0.5 text-base font-medium transition-colors duration-200
        ${
          isActive
            ? "bg-[#007AFF] text-white rounded-md" // Active page style: Bright Blue background
            : "text-gray-600 hover:text-[#007AFF] hover:bg-gray-50 rounded-md" // Inactive page style
        }
      `}
      aria-current={isActive ? "page" : undefined}
      disabled={isActive}
    >
      {page}
    </button>
  );

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    // Outer container to center the entire component
    <div className="flex pb-10 justify-center w-full my-8">
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className={`
            flex items-center cursor-pointer space-x-1 pr-3 py-2 text-base font-medium rounded-md
            ${
              isFirstPage
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-[#007AFF]"
            }
          `}
        >
          {/* Using ChevronLeft for a cleaner icon, but keeping the visual flow */}
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        {/* Page Numbers and Ellipses (Matching the image layout: 1 2 3 ... 67 68) */}
        <div className="flex items-center space-x-1">
          {/* Page 1 (Active in the image) */}
          <PageButton
            page={1}
            isActive={currentPage === 1}
            onClick={onPageChange}
          />

          {/* Page 2 */}
          <PageButton
            page={2}
            isActive={currentPage === 2}
            onClick={onPageChange}
          />

          {/* Page 3 */}
          <PageButton
            page={3}
            isActive={currentPage === 3}
            onClick={onPageChange}
          />

          {/* Ellipses */}
          <span className="text-gray-400 px-1 py-2 text-base">...</span>

          {/* Page 67 */}
          <PageButton
            page={67}
            isActive={currentPage === 67}
            onClick={onPageChange}
          />

          {/* Page 68 */}
          <PageButton
            page={68}
            isActive={currentPage === 68}
            onClick={onPageChange}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className={`
            flex items-center cursor-pointer space-x-1 pl-3 py-2 text-base font-medium rounded-md
            ${
              isLastPage
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-[#007AFF]"
            }
          `}
        >
          <span>Next</span>
          {/* Using ChevronRight for a cleaner icon */}
          <ChevronRight className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};

// --- End of Pagination UI Component ---

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Added state for pagination
  const router = useRouter();
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Fetch vendors from API and map to businessLogo/businessBanner
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${baseURL}/vendors/get?page=${currentPage}&limit=${limit}`,
        );
        const data = await res.json();
        setVendors(data.data || []);
        setTotalPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [currentPage]);


  const totalVendors = vendors.length;

const localVendors = vendors.filter(
  (v) => v.type && v.type === "local"
).length;

const internationalVendors = vendors.filter(
  (v) => v.type && v.type === "international"
).length;


  const countries = [
    "all",
    ...Array.from(new Set(vendors.map((v) => v.country))),
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry =
      selectedCountry === "all" || vendor.country === selectedCountry;
    const matchesType = selectedType === "all" || vendor.type === selectedType;
    return matchesSearch && matchesCountry && matchesType;
  });

  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "deals") return b.totalDeals - a.totalDeals;
    if (sortBy === "reviews") return b.totalReviews - a.totalReviews;
    if (sortBy === "newest")
      return (
        new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
      );
    return 0;
  });

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Handler for page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // In a real application, you would re-fetch or slice data here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Search Section with Gradient Fade */}
      <div className="relative bg-white">
        {/* White background containing the entire SearchSection */}
        <div className="pb-10 sm:pb-16 lg:pb-20">
          <SearchSection />
        </div>

        {/* Gradient fade at bottom of white section */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-white to-gray-100" />
      </div>

      {/* Main content container */}
      <div className="px-4 sm:px-6 lg:px-12 mb-6">
        {/* Header / Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          {/* Left Info */}
<div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center space-x-4 text-sm text-gray-700">
    <span>
      Total vendors:{" "}
      <span className="font-semibold">{totalVendors}</span>
    </span>

    {localVendors > 0 && (
      <span className="flex items-center space-x-1">
        <Icon name="User" size={16} color="#3B82F6" />
        <span>Local: {localVendors}</span>
      </span>
    )}

    {internationalVendors > 0 && (
      <span className="flex items-center space-x-1">
        <Icon name="Globe" size={16} color="#F59E0B" />
        <span>International: {internationalVendors}</span>
      </span>
    )}
  </div>
</div>

          {/* Right Filters */}
          <div className="flex flex-col gap-2 mt-3 md:mt-0 md:flex-row md:items-center md:space-x-3">
      <select className="w-full md:w-auto px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option>All vendors</option>
        <option>Top vendors</option>
        <option>New vendors</option>
      </select>

      <select className="w-full md:w-auto px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option>All countries</option>
        <option>USA</option>
        <option>Canada</option>
      </select>

      <select className="w-full md:w-auto px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option>Highest rated</option>
        <option>Lowest rated</option>
      </select>
    </div>

        </div>

        {/* Store Card Component */}
        <StoreCard stores={vendors} />

        {/* Pagination */}
        <PaginationUI
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
