"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaStar,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { MdOutlineBolt } from "react-icons/md";

const StoreCard = ({ stores }: { stores: any[] }) => {
  if (!stores?.length) {
    return (
      <div className="py-10 text-center text-gray-500">No vendors found</div>
    );
  }

  return (
    <div className="container mx-auto px-4">
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
      {stores.map((s) => (
        <div
          key={s._id}
          className="bg-white rounded-xl overflow-hidden flex flex-col w-full"
        >
          {/* banner */}
          <div className="relative h-30 w-full bg-gray-100">
            <Image
              src={s.businessBanner || "/placeholder-banner.jpg"}
              alt={`${s.name} banner`}
              fill
              className="object-cover"
            />
          </div>

          <div className="relative px-4 pb-3 flex flex-col flex-1">

    {/* TOP CONTENT (can grow) */}
    <div className="flex flex-col flex-1">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 text-left">
        {s.name}
      </h2>

      <div className="flex flex-wrap items-center text-gray-500 text-xs gap-x-3 gap-y-1 mb-1">
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-1 text-gray-400 text-[12px] shrink-0" />
          <span className="truncate max-w-[90px] sm:max-w-none">
            {(s.location || s.country)?.slice(0, 20)}
            {(s.location || s.country)?.length > 20 && "…"}
          </span>
        </div>

        <div className="flex items-center">
          <FaStar className="text-orange-400 mr-1 text-[12px]" />
          <span className="font-semibold text-gray-800 text-sm">
            {s.rating?.toFixed(1) || 0}
          </span>
          <span className="ml-1 text-gray-400 text-xs">
            ({s.totalReviews || 0})
          </span>
        </div>
      </div>

      <p className="text-[#4A4A4A] text-sm mb-2 text-left">
        {s.description
          ? s.description.slice(0, 50) +
            (s.description.length > 50 ? "…" : "")
          : ""}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="bg-[#EBF5FF] text-[#0070F3] font-semibold text-[9px] px-2 py-1 rounded-lg">
          {s.totalDeals} Active deals
        </div>

        <div className="bg-[#FFF4E6] text-[#FF9900] font-semibold text-[9px] px-2 py-1 rounded-lg flex items-center">
          <MdOutlineBolt className="text-xs mr-1" />
          {s.responseTime || "Fast response"}
        </div>
      </div>
    </div>

    {/* BUTTON — ALWAYS SAME POSITION */}
    <div className="mt-auto pt-4 flex justify-center lg:justify-start">

      <Link
        href={`/vendors/${s._id}`}
        className="text-[#007AFF] hover:text-[#005bb5] text-sm font-semibold flex items-center"
      >
        View store <FaExternalLinkAlt className="ml-1 text-xs" />
      </Link>
    </div>
  </div>

        </div>
      ))}
    </div>
    </div>
  );
};

export default StoreCard;
