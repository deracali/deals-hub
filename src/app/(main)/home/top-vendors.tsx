"use client";

import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaStar,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { MdOutlineBolt } from "react-icons/md";
import { useEffect, useState } from "react";

interface Store {
  id: string | number;
  name: string;
  location: string;
  rating: number;
  reviewCount: string;
  description: string;
  activeDeals: number;
  responseTime: string;
  passportPhoto?: string;
  bannerImage?: string;
}

const FALLBACK_BANNER = "/fallback-banner.jpg";
const FALLBACK_PROFILE = "/fallback-profile.png";

const StoreCard = () => {
  const [stores, setStores] = useState<Store[]>([]);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${baseURL}/vendors/get`);
        const json = await res.json();
        console.log("vendors api ->", json); // helpful for debugging

        // guard: if json.data isn't an array, bail out
        const raw = Array.isArray(json.data) ? json.data : [];

        // map vendor shape -> UI store shape, keeping original UI fields
        const mapped: Store[] = raw.map((v: any, idx: number) => ({
          id: v._id ?? idx,
          name: (v.name || "Unnamed vendor").trim(),
          location: v.location || v.businessAddress || "Unknown location",
          rating: typeof v.rating === "number" ? v.rating : 0,
          // keep reviewCount as a human string like your original example ("500.k")
          reviewCount: formatReviewCount(v.totalReviews ?? 0),
          description: (v.description || "").trim(),
          // activeDeals should come from totalDeals
          activeDeals: v.totalDeals ?? 0,
          // keep responseTime static if vendor doesn't provide it (preserves UI)
          responseTime: v.responseTime || "Less than 1hour",
          passportPhoto: v.passportPhoto || v.passportPhoto || FALLBACK_PROFILE,
          bannerImage: v.businessBanner || v.businessBanner || FALLBACK_BANNER,
        }));

        // keep order or sort by activeDeals if you prefer top vendors:
        // mapped.sort((a,b) => b.activeDeals - a.activeDeals);

        setStores(mapped);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      }
    };

    fetchVendors();
  }, []);

  // small helper to format review counts like "500.k", "85"
  function formatReviewCount(n: number) {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  // preserve original markup exactly, but use stores from state
  return (
    <div className="flex overflow-x-auto justify-start space-x-4 hide-scrollbar">
      {stores.map((s) => (
        <div
          key={s.id}
          className="
  flex-shrink-0
  w-[310px] sm:w-[380px]
  h-[372px]
  bg-white
  rounded-xl
  overflow-hidden
  font-sans
  flex
  flex-col
"

        >
          <div className="relative h-36 w-full bg-[#FFD700]">
            <Image
              src={s.bannerImage || FALLBACK_BANNER}
              alt={`${s.name} banner`}
              fill
              className="object-cover"
            />
          </div>

          <div className="relative px-5 pt-0 pb-4">
            <div className="flex justify-between items-end -mt-10 mb-3">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-[4px] border-white overflow-hidden shadow-md">
                  <Image
                    src={s.passportPhoto || FALLBACK_PROFILE}
                    alt={s.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-[#007aff] text-white p-[3px] rounded-full border-2 border-white text-[10px]">
                  <FaCheck />
                </div>
              </div>
              <div className="bg-[#E5F7ED] text-[#22C55E] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center shadow-sm">
                <span className="h-2 w-2 bg-[#22C55E] rounded-full mr-1.5"></span>
                Available
              </div>
            </div>

            <div>
              <h2 className="text-[22px] font-extrabold text-gray-900 mb-1 leading-tight tracking-tight">
                {s.name}
              </h2>
              <div className="flex justify-between items-center text-gray-500 text-[13px] font-medium">
                {/* Location */}
                <div className="flex items-center flex-shrink overflow-hidden">
                  <FaMapMarkerAlt className="mr-1 text-gray-400 text-sm" />
                  <span className="truncate">{s.location}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center flex-shrink-0 ml-3">
                  <FaStar className="text-orange-400 mr-1 text-sm" />
                  <span className="font-bold text-gray-800">{s.rating}</span>
                  <span className="ml-1 text-gray-400 font-normal">
                    ({s.reviewCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[#4A4A4A] text-[15px] leading-snug mt-3 mb-4 h-10 overflow-hidden line-clamp-2">
              {s.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              <div className="bg-[#EBF5FF] text-[#0070F3] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {s.activeDeals} Active deals
              </div>

              <div className="bg-[#FFF4E6] text-[#FF9900] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center">
                <MdOutlineBolt className="text-sm mr-1" />
                Response time: {s.responseTime}
              </div>
            </div>

            <a
              href={`/vendors/${s.id}`}
              className="block w-full text-center mt-7 font-bold text-[#007AFF] hover:text-[#005bb5] flex items-center justify-center text-[14px] transition-colors"
            >
              View store
              <FaExternalLinkAlt className="ml-2 text-sm" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StoreCard;
