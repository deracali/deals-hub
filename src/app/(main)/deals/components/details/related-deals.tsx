"use client";

import AppImage from "@/components/ui/app-image";
import Icon from "@/components/ui/icon";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const RelatedDeals = ({
  currentDealId,
  category,
}: {
  currentDealId: string;
  category?: string;
}) => {
  const [relatedDeals, setRelatedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorMap, setVendorMap] = useState<Record<string, any>>({});
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /* =============================
     Fetch related ACTIVE deals
  ============================== */
  useEffect(() => {
    if (!category) return;

    const fetchAllDeals = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseURL}/deals/get`);
        const data = await res.json();

        const filtered = data?.deals
          ?.filter(
            (d: any) =>
              d.status === "active" && // ✅ ONLY ACTIVE DEALS
              d.category === category &&
              d._id !== currentDealId,
          )
          ?.slice(0, 12);

        setRelatedDeals(filtered || []);
      } catch (error) {
        console.error("Error fetching related deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDeals();
  }, [category, currentDealId]);

  /* =============================
     Fetch vendors by brand
  ============================== */
  useEffect(() => {
    if (!relatedDeals.length) return;

    const fetchVendors = async () => {
      const uniqueBrands = [
        ...new Set(relatedDeals.map((d) => d.brand).filter(Boolean)),
      ];

      const results = await Promise.all(
        uniqueBrands.map(async (brand) => {
          try {
            const res = await fetch(
              `${baseURL}/vendors/name/${encodeURIComponent(
                brand,
              )}`,
            );
            const data = await res.json();
            return [brand, data?.vendor || null];
          } catch {
            return [brand, null];
          }
        }),
      );

      setVendorMap(Object.fromEntries(results));
    };

    fetchVendors();
  }, [relatedDeals]);

  /* =============================
     Scroll handler
  ============================== */
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    const scrollAmount = clientWidth * 0.8;

    scrollContainerRef.current.scrollTo({
      left:
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading || !relatedDeals.length) return null;

  return (
    <div className="w-full py-6 sm:py-10 relative group/section">
      {/* Header - Stacks on mobile, row on desktop */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
        <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Related deals
        </h2>
        <Link
          href={`/deals?category=${encodeURIComponent(category || "")}`}
          className="flex items-center gap-1 text-blue-500 text-xs sm:text-base font-semibold hover:underline"
        >
          See all <Icon name="ChevronRight" size={16} />
        </Link>
      </div>

      <div className="relative">
        {/* Navigation Arrows - Desktop Only */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center shadow-xl border border-gray-100 text-slate-900 opacity-0 group-hover/section:opacity-100 transition-all"
        >
          <Icon name="ChevronLeft" size={24} />
        </button>

        {/* Grid for Mobile (2 columns)
          Flex for Desktop (horizontal scroll)
      */}
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-2 gap-3 sm:gap-6 md:flex md:flex-nowrap md:overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
        >
          {relatedDeals.map((deal) => {
            const vendor = vendorMap[deal.brand];

            return (
              <div
                key={deal._id}
                className="group cursor-pointer flex-none w-full md:w-[350px] snap-start bg-white rounded-2xl sm:rounded-none overflow-hidden sm:overflow-visible border sm:border-0 border-gray-50 shadow-sm sm:shadow-none"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] rounded-t-2xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 shadow-sm bg-gray-100 border border-gray-50">
                  <AppImage
                    src={deal?.images?.[0] || "/no_image.png"}
                    alt={deal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badges - Styled to match reference image */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1">
                    <span className="bg-[#FF3B30] text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold">
                      -{deal.discountPercentage}%
                    </span>
                    <span className="bg-[#007AFF] text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                      <Icon name="Volume2" size={10} /> Sponsored post
                    </span>
                  </div>

                  <button className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md text-red-500">
                    <Icon
                      name="Heart"
                      size={16}
                      className="fill-current sm:hidden"
                    />
                    <Icon
                      name="Heart"
                      size={20}
                      className="fill-current hidden sm:block"
                    />
                  </button>
                </div>

                {/* Content Section */}
                <div className="space-y-2 sm:space-y-3 px-2 pb-3 sm:px-1 sm:pb-0">
                  <div className="flex items-center justify-between">
                    {/* Brand/Store Info */}
                    <div className="flex items-center gap-1 sm:gap-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-50 sm:bg-white border border-gray-100 rounded-md">
                      <img
                        src={vendor?.businessLogo || "/avatar.png"}
                        alt={vendor?.name || deal.brand}
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full object-cover"
                      />
                      <span className="text-[8px] sm:text-[10px] font-bold text-gray-600 truncate max-w-[40px] sm:max-w-none">
                        {vendor?.name || deal.brand}
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-bold text-orange-400">
                      1200 Sold
                    </span>
                  </div>

                  {/* Title and Prices */}
                  <div>
                    <h3 className="text-xs sm:text-[16px] font-bold text-slate-900 line-clamp-2 leading-tight h-8 sm:h-auto">
                      {deal.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 sm:mt-2">
                      <div className="text-sm sm:text-xl font-black">
                        ${deal.discountedPrice.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 ml-auto">
                        <Icon
                          name="ThumbsUp"
                          size={12}
                          className="fill-current"
                        />
                        <span>100.3k</span>
                        <Icon
                          name="ThumbsDown"
                          size={12}
                          className="text-red-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-[8px] sm:text-[11px] text-gray-400 border-t pt-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src="/avatar.png"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-slate-900">
                        24 hrs ago
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      <Icon name="MessageSquare" size={12} />
                      <span>10.k</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center shadow-xl border border-gray-100 text-slate-900 opacity-0 group-hover/section:opacity-100 transition-all"
        >
          <Icon name="ChevronRight" size={24} />
        </button>
      </div>
    </div>
  );
};

export default RelatedDeals;
