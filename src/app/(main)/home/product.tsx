"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Smartphone,
  Monitor,
  Heart,
  Baby,
  Soup,
  Shirt,
  Home,
  Cpu,
  Gamepad2,
  Square,
  Apple,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  title: string;
  image: string;
  vendor: { name: string; type: "apple" | "nike" | "amazon" | "other" };
  price: number;
  originalPrice: number;
  discount: number;
  likes: number;
  isLiked: boolean;
  badge?: { type: "sponsored" | "boosted"; text: string };
  postedBy: { name: string; time: string };
  comments: string;
}

const categories = [
  { name: "Mobile phones", icon: Smartphone },
  { name: "Computing", icon: Monitor },
  { name: "Health & Beauty", icon: Heart },
  { name: "Kids", icon: Baby },
  { name: "Kitchen", icon: Soup },
  { name: "Fashion & wears", icon: Shirt },
  { name: "Home & Offices", icon: Home },
  { name: "Electronics", icon: Cpu },
  { name: "Gaming", icon: Gamepad2 },
];

const priceRanges = [
  { label: "Less than $10", min: 0, max: 9.99 },
  { label: "$10 - $99", min: 10, max: 99 },
  { label: "$100 - $999", min: 100, max: 999 },
  { label: "$1000 - $9999", min: 1000, max: 9999 },
  { label: "$10000 - $99999", min: 10000, max: 99999 },
  { label: "$99999 & above", min: 100000, max: undefined },
];

const topVendors = [
  { name: "FemiBala Tech com." },
  { name: "Esthesis Venture" },
  { name: "Teebay Enterprises" },
  { name: "Adunni Glams & Co." },
  { name: "Sims Closets" },
];

// --- 2. SUB-COMPONENTS ---

const vendorLogoCache: Record<string, string | null> = {};

interface VendorIconProps {
  brandName: string;
  businessLogo?: string;
}

const VendorIcon = ({ brandName, businessLogo }: VendorIconProps) => {
  const logo = businessLogo || "/avatar.png"; // fallback if no logo

  return (
    <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-gray-100 flex items-center justify-center">
      <Image
        src={logo}
        alt={brandName}
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  );
};

const getSavedDeals = () => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("savedDeals") || "[]");
};

const isDealSaved = (dealId: string | number) => {
  const saved = getSavedDeals();
  return saved.some((d: any) => d._id === dealId || d.id === dealId);
};

const toggleSaveDeal = (deal: any) => {
  const saved = getSavedDeals();
  const exists = saved.some((d: any) => d._id === deal.id || d.id === deal.id);

  const updated = exists
    ? saved.filter((d: any) => d._id !== deal.id && d.id !== deal.id)
    : [...saved, deal];

  localStorage.setItem("savedDeals", JSON.stringify(updated));
  return !exists;
};

const ProductCard = ({ product }: { product: Product }) => {
  const router = useRouter();
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [isSaved, setIsSaved] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(product.isLiked);
  const [likesCount, setLikesCount] = React.useState(product.likes);
  const [brandDetails, setBrandDetails] = React.useState<{
    passportPhoto: string;
    bannerLogo?: string;
    name: string;
  }>({
    passportPhoto: "/avatar.png",
    name: product.vendor.name,
    bannerLogo: product.vendor.bannerLogo || "",
  });

  // load saved state on mount
  React.useEffect(() => {
    setIsSaved(isDealSaved(product.id));
  }, [product.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    const newState = toggleSaveDeal(product);
    setIsSaved(newState);
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id || user.id;

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const res = await fetch(
        `${baseURL}/deals/${product.id}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      if (!res.ok) throw new Error("Like failed");

      const data = await res.json();

      setIsLiked((prev) => !prev);
      setLikesCount(data.likes ?? likesCount);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  React.useEffect(() => {
    if (!product.vendor.name) return;

    const fetchBrand = async () => {
      try {
        const res = await fetch(
          `${baseURL}/vendors/name/${encodeURIComponent(product.vendor.name)}`,
        );
        const data = await res.json();

        setBrandDetails({
          businessLogo: data?.vendor?.businessLogo || "/avatar.png",
          name: data?.vendor?.name || product.vendor.name,
        });
      } catch (err) {
        setBrandDetails({
          businessLogo: "/avatar.png",
          name: product.vendor.name,
        });
      }
    };

    fetchBrand();
  }, [product.vendor.name]);

  return (
    <div className="bg-white rounded-[16px] overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 group flex flex-col">
      {/* Image Area */}
      <div className="relative h-[220px] w-full bg-[#f2f2f2] overflow-hidden group">
        {/* Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
            onClick={() => router.push(`/deals/${product.id}`)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <span className="bg-[#ff0000] text-white text-[10px] font-bold px-2 py-1 rounded-md">
            -{product.discount}%
          </span>
          {product.badge && (
            <span
              className={`${
                product.badge.type === "sponsored"
                  ? "bg-[#007bff]"
                  : "bg-[#ff8c00]"
              } text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center uppercase tracking-wide`}
            >
              {product.badge.type === "boosted" && (
                <span className="mr-1">⚡</span>
              )}
              {product.badge.type === "sponsored" && (
                <span className="mr-1">📢</span>
              )}
              {product.badge.text}
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleSave}
          className="absolute cursor-pointer top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md z-10 hover:bg-gray-50 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${
              isSaved ? "text-red-500 fill-red-500" : "text-gray-400"
            }`}
            strokeWidth={isSaved ? 0 : 2}
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Vendor & Social Proof */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-[10px] font-medium text-gray-600">
            <VendorIcon
              brandName={brandDetails.name}
              businessLogo={brandDetails.businessLogo}
            />

            {product.vendor.name}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {/* LIKE */}
              <button
                onClick={handleLikeToggle}
                className="flex cursor-pointer items-center text-[11px] font-bold transition"
              >
                <ThumbsUp
                  className={`w-3.5 h-3.5 mr-1 transition ${
                    isLiked ? "text-green-600 fill-green-600" : "text-gray-400"
                  }`}
                />
                {likesCount}
              </button>
            </div>
          </div>
        </div>

        {/* Title & Price */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <h3
            className="text-[#1a1a1a] cursor-pointer font-medium text-[14px] leading-5 line-clamp-2 flex-1"
            onClick={() => router.push(`/deals/${product.id}`)}
          >
            {product.title}
          </h3>
          <div className="text-right shrink-0">
            <div className="text-[16px] font-black text-[#1a1a1a] leading-none mb-1">
              ${product.price.toFixed(1)}
            </div>
            <div className="text-[10px] text-gray-400 line-through font-medium">
              ${product.originalPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden relative">
              <Image
                src={brandDetails.businessLogo || "/avatar.png"}
                alt={brandDetails.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="truncate max-w-[120px]">
              {product.postedBy.time}{" "}
              <span className="mx-0.5 text-gray-400">by</span>{" "}
              <span className="italic text-gray-600">
                {product.postedBy.name}
              </span>
            </span>
          </div>

          <div className="flex items-center text-gray-400 font-medium">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            {product.comments}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  category,
  setCategory,
  setPage,
  selectedPriceRange,
  setSelectedPriceRange,
}: {
  category: string;
  setCategory: (v: string) => void;
  setPage: (v: number) => void;
  selectedPriceRange: { min?: number; max?: number } | null;
  setSelectedPriceRange: React.Dispatch<
    React.SetStateAction<{ min?: number; max?: number } | null>
  >;
}) => {
  const [topVendorsList, setTopVendorsList] = useState<any[]>([]);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    let mounted = true;
    const fetchTopVendors = async () => {
      try {
        const res = await fetch(`${baseURL}/vendors/get`);
        const json = await res.json();
        const vendors = json?.data || [];
        // sort by totalDeals desc and take top 5
        const top5 = vendors
          .slice() // copy
          .sort(
            (a: any, b: any) =>
              (Number(b.totalDeals) || 0) - (Number(a.totalDeals) || 0),
          )
          .slice(0, 5);
        if (mounted) setTopVendorsList(top5);
      } catch (err) {
        console.error("Failed loading top vendors:", err);
      }
    };

    fetchTopVendors();
    return () => {
      mounted = false;
    };
  }, []);

  const activeFilters = [
    category !== "all" ? 1 : 0,
    selectedPriceRange ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <aside className="w-full lg:w-[260px] pr-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[16px] font-bold text-gray-900 flex items-center">
          Filter
          <span className="ml-2 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
            {activeFilters} {/* ✅ dynamic count */}
          </span>
        </h3>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h4 className="text-[13px] font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Categories
        </h4>
        <ul className="space-y-3.5">
          {categories.map((cat, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  setCategory(cat.name);
                  setPage(1);
                }}
                className={`flex items-center text-[13px] group ${
                  category.toLowerCase() === cat.name.toLowerCase()
                    ? "text-blue-600 font-semibold"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <cat.icon className="w-4 h-4 mr-3" />
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range */}
      <div className="mb-8">
        <h4 className="text-[13px] font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Price range
        </h4>
        <ul className="space-y-3">
          {priceRanges.map((range, index) => (
            <li
              key={index}
              onClick={() => {
                setSelectedPriceRange({ min: range.min, max: range.max });
                setPage(1); // reset pagination
              }}
              className={`flex items-center justify-between text-[13px] cursor-pointer px-2 py-1 rounded ${
                selectedPriceRange?.min === range.min &&
                selectedPriceRange?.max === range.max
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{range.label}</span>
              {selectedPriceRange?.min === range.min &&
              selectedPriceRange?.max === range.max ? (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-300" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Vendor Search */}
      <div className="mb-8">
        <h4 className="text-[13px] font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Vendor
        </h4>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search vendor's name"
            className="w-full bg-[#f3f4f6] border-none rounded-lg py-2.5 px-4 pl-9 text-[12px] text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition-shadow outline-none"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Top vendors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img
              src="/TrendUp.png" // replace with your image URL
              alt="Top Vendors"
              className="w-5 h-5 rounded-full object-cover"
            />
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
              Top verified vendors
            </h4>
          </div>
          <span className="text-orange-500 normal-case text-xs font-medium cursor-pointer hover:underline flex items-center">
            See all <ChevronRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>

        <ul className="space-y-4">
          {topVendorsList.length === 0
            ? // fallback: render your static topVendors if fetch hasn't returned
              topVendors.map((vendor, index) => (
                <li key={`static-${index}`}>
                  <a
                    href="#"
                    className="flex items-center text-gray-600 hover:text-blue-600 text-[13px] font-medium group"
                  >
                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-3 relative overflow-hidden group-hover:ring-2 ring-blue-100 transition-all">
                      <div className="absolute inset-0 bg-gradient-to-tr from-gray-300 to-gray-100" />
                    </div>
                    {vendor.name}
                  </a>
                </li>
              ))
            : topVendorsList.map((vendor: any) => {
                const logo = vendor.businessLogo || "/avatar.png";

                return (
                  <li key={vendor._id}>
                    <a
                      href="#"
                      className="flex items-center text-gray-600 hover:text-blue-600 text-[13px] font-medium group"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-200 mr-3 relative overflow-hidden group-hover:ring-2 ring-blue-100 transition-all">
                        {/* use next/image for better loading if allowed by next.config.js */}
                        <img
                          src={logo}
                          alt={vendor.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="leading-tight text-[16px] cursor-pointer">
                          {vendor.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(vendor.totalDeals ?? 0) + " deals"}
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
        </ul>
      </div>
    </aside>
  );
};

// --- 3. MAIN PAGE COMPONENT ---

export default function Deals() {
  const [deals, setDeals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [allDeals, setAllDeals] = React.useState<any[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // filters
  const [category, setCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [search, setSearch] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = React.useState<{
    min?: number;
    max?: number;
  } | null>(null);

  // Get user preferences from backend
  const filterDealsForUser = (deals: any[], preferences: string[]) => {
    if (!preferences || preferences.length === 0) return deals;

    const lowerPrefs = preferences.map((p) => p.toLowerCase());

    const filtered = deals.filter((deal) => {
      // Check title
      const titleMatch = lowerPrefs.some((pref) =>
        deal.title.toLowerCase().includes(pref),
      );

      // Check category
      const categoryMatch = lowerPrefs.some((pref) =>
        deal.category?.toLowerCase().includes(pref),
      );

      // Check tags (if deal.tags is an array)
      const tagsMatch = lowerPrefs.some((pref) =>
        deal.tags?.some((tag: string) => tag.toLowerCase().includes(pref)),
      );

      return titleMatch || categoryMatch || tagsMatch;
    });

    console.log("📌 Deals after filtering by preferences:", filtered);
    return filtered;
  };

  const fetchUserPreferences = async (userId: string) => {
    try {
      const res = await fetch(
        `${baseURL}/users/${userId}/preferences`,
      ); // include host
      const data = await res.json();
      console.log("📌 User preferences fetched:", data.preferences);
      return data.preferences || [];
    } catch (err) {
      console.error("❌ Error fetching preferences:", err);
      return [];
    }
  };

  const fetchDeals = async () => {
    setLoading(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user._id;

    const params = new URLSearchParams({
      page: String(page),
      limit: "9",
      sortBy,
      category,
      search,
      ...(selectedPriceRange?.min !== undefined && {
        minPrice: String(selectedPriceRange.min),
      }),
      ...(selectedPriceRange?.max !== undefined && {
        maxPrice: String(selectedPriceRange.max),
      }),
    });

    const res = await fetch(`${baseURL}/deals/get?${params}`);
    const data = await res.json();
    setAllDeals(data.deals);

    // Filter only active deals
    let filteredDeals = data.deals.filter(
      (deal: any) => deal.status === "active",
    );

    // Filter for "For you" tab if needed
    if (sortBy === "for-you") {
      const preferences = await fetchUserPreferences(userId);
      filteredDeals = filterDealsForUser(filteredDeals, preferences);
    }

    setDeals(filteredDeals);
    setTotalPages(data.pages);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchDeals();
  }, [page, sortBy, category, search, selectedPriceRange]);

  // near: const [allDeals, setAllDeals] = React.useState<any[]>([]);
  const [userPreferences, setUserPreferences] = React.useState<string[]>([]);

  // fetch preferences once when component mounts (or when user changes)
  React.useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) return;
        // Try to use cached prefs in localStorage first
        if (user.preferences && Array.isArray(user.preferences)) {
          setUserPreferences(user.preferences);
        } else {
          const res = await fetch(
            `${baseURL}/users/${user._id}/preferences`,
          );
          if (!res.ok) throw new Error(`prefs fetch failed ${res.status}`);
          const data = await res.json();
          setUserPreferences(data.preferences || []);
          // optional: persist to localStorage so badge compute can use it:
          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, preferences: data.preferences || [] }),
          );
        }
        console.log("📌 userPreferences (state):", userPreferences);
      } catch (err) {
        console.error("❌ Error loading user preferences:", err);
      }
    };

    fetchPrefs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // remove previous forYouCount/trendingCount code and replace with:

  const forYouCount = React.useMemo(() => {
    if (!allDeals || allDeals.length === 0) return 0;
    if (!userPreferences || userPreferences.length === 0) return 0;

    const lowerPrefs = userPreferences.map((p) => p.toLowerCase());

    return allDeals.reduce((acc, deal) => {
      // gather searchable strings safely
      const title = String(deal.title || "");
      const category = String(deal.category || "");
      const platform = String(deal.platform || ""); // backend uses platform
      const brand = String(deal.brand || "");
      const vendorName = String(deal.vendor?.name || "");
      const postedByName = String(deal.postedBy?.name || "");
      const tags = Array.isArray(deal.tags)
        ? deal.tags.join(" ")
        : String(deal.tags || "");

      const hay = (
        title +
        " " +
        category +
        " " +
        platform +
        " " +
        brand +
        " " +
        vendorName +
        " " +
        postedByName +
        " " +
        tags
      ).toLowerCase();

      const matches = lowerPrefs.some((pref) => pref && hay.includes(pref));
      return acc + (matches ? 1 : 0);
    }, 0);
  }, [allDeals, userPreferences]);

  const trendingCount = React.useMemo(() => {
    if (!allDeals || allDeals.length === 0) return 0;
    return allDeals.filter(
      (deal) => Number(deal.discountPercentage || deal.discount || 0) >= 20,
    ).length;
  }, [allDeals]);

  return (
    <div className="container mx-auto px-4 pt-4 font-sans text-slate-900 pb-8 md:pb-20">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl md:text-[32px] font-[900] tracking-tight text-black">
            Explore other available deals
          </h1>
          <a
            href="/deals/all-deals"
            className="text-[#007bff] font-semibold text-[13px] flex items-center hover:underline whitespace-nowrap"
          >
            See all <ChevronRight className="w-4 h-4 ml-0.5" />
          </a>
        </div>
        <p className="text-gray-400 text-[13px] mb-8 font-medium">
          Discover hundreds of trusted deals shared by savvy shoppers like you!
        </p>

        {/* Tabs & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <nav className="flex items-center gap-8 overflow-x-auto w-full md:w-auto pb-0 hide-scrollbar">
            {/* All deals */}
            <button
              onClick={() => setSortBy("newest")}
              className={`font-bold text-[14px] pb-3 border-b-2 whitespace-nowrap transition-all ${
                sortBy === "newest"
                  ? "text-[#007bff] border-[#007bff]"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              All deals
            </button>

            {/* For you */}
            <button
              onClick={() => setSortBy("for-you")}
              className={`font-medium text-[14px] pb-3 border-b-2 flex items-center whitespace-nowrap transition-all ${
                sortBy === "for-you"
                  ? "text-[#007bff] border-[#007bff]"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              For you
              <span className="ml-2 bg-[#ff8c00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {forYouCount}
              </span>
            </button>

            {/* Popular */}
            <button
              onClick={() => setSortBy("popularity")}
              className={`font-medium text-[14px] pb-3 border-b-2 whitespace-nowrap transition-all ${
                sortBy === "popularity"
                  ? "text-[#007bff] border-[#007bff]"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              Popular
            </button>

            {/* Trending */}
            <button
              onClick={() => setSortBy("discount-high")}
              className={`font-medium text-[14px] pb-3 border-b-2 flex items-center whitespace-nowrap transition-all ${
                sortBy === "discount-high"
                  ? "text-[#007bff] border-[#007bff]"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              Trending
              <span className="ml-2 bg-[#ff8c00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {trendingCount}
              </span>
            </button>

            {/* Special deals */}
            <button
              onClick={() => setSortBy("price-low")}
              className={`font-medium text-[14px] pb-3 border-b-2 whitespace-nowrap transition-all ${
                sortBy === "price-low"
                  ? "text-[#007bff] border-[#007bff]"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              Special deals
            </button>
          </nav>

          <button
    onClick={() => setMobileFilterOpen(true)}
    className="lg:hidden flex items-center gap-2 border px-2 py-2 rounded-lg text-sm font-semibold w-20"
  >
    <Search className="w-4 h-4" />
    <span className="truncate">Filter</span>
  </button>


          {mobileFilterOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
          )}

          {/* Sort Dropdown */}
          <div className="mb-3 md:mb-0 relative">
            {/* Button to toggle dropdown */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-white border border-gray-200 text-gray-700 font-semibold text-[12px] px-4 py-2 rounded-lg flex items-center shadow-sm hover:bg-gray-50 transition-colors"
            >
              {sortBy === "newest" ? "Newest to Oldest" : "Oldest to Newest"}
              <ChevronDown className="w-3.5 h-3.5 ml-3 text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute mt-2 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                <button
                  onClick={() => {
                    setSortBy("newest"); // update state
                    setDropdownOpen(false); // close dropdown
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Newest to Oldest
                </button>
                <button
                  onClick={() => {
                    setSortBy("oldest"); // update state
                    setDropdownOpen(false); // close dropdown
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Oldest to Newest
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 py-6 md:py-10 flex items-start">
        {/* Filter sidebar */}
        <div
          className={`
      fixed lg:static top-0 right-0 h-full lg:h-auto
      w-[85%] max-w-[320px] lg:w-[260px]
      bg-white z-50 lg:z-auto
      transform transition-transform
      ${mobileFilterOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
    `}
        >
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <h3 className="font-bold">Filter</h3>
            <button onClick={() => setMobileFilterOpen(false)}>✕</button>
          </div>

          <div className="p-4">
            <Sidebar
              category={category}
              setCategory={(v) => {
                setCategory(v);
                setMobileFilterOpen(false);
              }}
              setPage={setPage}
              selectedPriceRange={selectedPriceRange}
              setSelectedPriceRange={(v) => {
                setSelectedPriceRange(v);
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>

        <main className="flex-1 w-full">
          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {loading ? (
              <p className="text-center col-span-full text-gray-400">
                Loading deals...
              </p>
            ) : deals.length === 0 ? (
              <p className="text-center col-span-full text-gray-400">
                No deals found
              </p>
            ) : (
              deals.map((deal) => (
                <ProductCard
                  key={deal._id}
                  product={{
                    id: deal._id,
                    title: deal.title,
                    image: deal.images?.[0],
                    vendor: {
                      name: deal.brand,
                      type: "amazon",
                      passportPhoto: deal.passportPhoto,
                      bannerLogo: deal.bannerLogo,
                    },
                    price: deal.discountedPrice,
                    originalPrice: deal.originalPrice,
                    discount: deal.discountPercentage,
                    likes: deal.likes?.length || 0,
                    isLiked: deal.likes?.includes(
                      JSON.parse(localStorage.getItem("user") || "{}")._id,
                    ),
                    postedBy: { name: deal.brand, time: "Recently" },
                    comments: deal.comments?.length || 0,
                  }}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 text-[13px] font-semibold text-gray-500 select-none">
            {/* Previous */}
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center hover:text-gray-900 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber =
                  page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;

                if (pageNumber < 1 || pageNumber > totalPages) return null;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                      page === pageNumber
                        ? "bg-[#007bff] text-white shadow-md shadow-blue-200"
                        : "hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {page < totalPages - 3 && (
                <span className="w-9 h-9 flex items-center justify-center text-gray-400 tracking-widest">
                  …
                </span>
              )}

              {page < totalPages - 2 && (
                <>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    {totalPages - 1}
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Next */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center hover:text-gray-900 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
