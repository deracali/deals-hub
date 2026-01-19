"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Star,
  ShoppingBag,
  Zap,
  Copy,
  BadgeCheck,
} from "lucide-react";

const StoreProfile = ({ vendor }: { vendor: any }) => {
  return (
    <div className="bg-white font-sans text-gray-800">
      {/* 1. Back Navigation */}
        <div className="container mx-auto px-4 mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-sm font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

     <div className="container mx-auto px-4">
        {/* 2. Banner Section */}
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden">
          <img
            src={vendor.businessBanner || "/placeholder-banner.jpg"}
            alt={`${vendor.name} banner`}
            className="w-full h-full object-cover object-center opacity-90"
          />
        </div>

        {/* 3. Main Content Grid */}
        <div className="relative px-2 md:px-4">
          {/* Profile Picture (Overlapping) */}
          <div className="absolute -top-16 left-4 md:left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-[5px] border-white overflow-hidden bg-gray-200">
                <img
                  src={vendor.passportPhoto || "/placeholder-avatar.png"}
                  alt={vendor.name}
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>

              {/* Verified Badge */}
              {vendor.isVerified && (
                <div className="absolute bottom-2 right-2 bg-white rounded-full p-[2px]">
                  <BadgeCheck
                    className="text-blue-500 fill-blue-500"
                    size={24}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content Layout */}
          <div className="pt-20 md:pt-20 flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left Column: Store Details */}
            <div className="flex-1">
              {/* Header: Name & Status */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-black tracking-tight text-black">
                  {vendor.name}
                </h1>

                <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-full w-fit">
                  ● Available
                </span>
              </div>

              {/* Location & Rating */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{vendor.location || vendor.country}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-orange-400 text-orange-400" />
                  <span className="font-medium text-black">
                    {vendor.rating?.toFixed(1) || 0}
                  </span>
                  <span>({vendor.totalReviews || 0})</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-800 font-medium mb-6 leading-relaxed max-w-2xl">
                {vendor.description}
              </p>

              {/* Stats / Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-500 px-3 py-2 rounded-lg font-medium">
                  <ShoppingBag size={16} />
                  {vendor.totalDeals} Active deals
                </div>

                <div className="inline-flex items-center gap-2 text-orange-400 font-medium">
                  <Zap size={16} />
                  Response time: {vendor.responseTime || "N/A"}
                </div>
              </div>
            </div>

            {/* Right Column: Contact Info */}
            <div className="w-full lg:w-[450px] space-y-6 pt-2">
              {/* Address */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  STORE ADDRESS:
                </h3>
                <p className="text-sm font-medium text-gray-800 leading-snug">
                  {vendor.businessAddress}
                </p>
              </div>

              {/* Email */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  EMAIL ADDRESS:
                </h3>
                <p className="text-sm font-medium text-gray-800">
                  {vendor.businessEmail}
                </p>
              </div>

              {/* Phone */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  PHONE NO.
                </h3>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-medium text-gray-800 mt-1">
                    {vendor.businessPhone}
                  </p>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(vendor.businessPhone)
                    }
                    className="flex items-center gap-2 bg-[#00C853] hover:bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shrink-0"
                  >
                    Copy phone number
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfile;
