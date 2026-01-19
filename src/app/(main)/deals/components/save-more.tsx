"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronRight, ChevronLeft, Tag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the structure based on your API response
interface Deal {
  _id: string;
  title: string;
  description: string;
  images: string[];
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  totalSlots: number;
  shippingNote: string;
  createdAt: string;
  vendor: {
    name: string;
    businessLogo: string;
    rating: number;
  };
  slots: { status: string }[];
}

export default function SaveMoreDeals() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<Deal[]>([]);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data from DB
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/group-deals/get",
        );
        const data = await response.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  const scrollBy = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Helper to calculate available slots
  const getAvailableSlots = (slots: any[]) => {
    return slots.filter((s) => s.status === "available").length;
  };

  // Helper to format date to "Time Ago"
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );
    return diffInHours < 1 ? "Just now" : `${diffInHours} hrs ago`;
  };

  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  const toggleFavorite = (deal: Deal) => {
    setFavorites((prev) => {
      let updated: Deal[];
      const exists = prev.find((d) => d._id === deal._id);

      if (exists) {
        // Remove from favorites
        updated = prev.filter((d) => d._id !== deal._id);
      } else {
        // Add full deal object
        updated = [...prev, deal];
      }

      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-600" size={40} />
      </div>
    );
  }

  return (
    <section className="w-full mt-8 mb-20">
      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl md:text-[34px] font-extrabold leading-tight">
              Save more deals.
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xl">
              Buy in groups and save more with your friends and family
            </p>
          </div>

          <div className="flex items-center">
            <Link
              href="/all-deals"
              className="flex items-center text-sky-600 hover:text-sky-700 transition-colors whitespace-nowrap"
            >
              <span className="text-sm font-medium mr-2">See all</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          aria-label="scroll left"
          onClick={() => scrollBy(-320)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/20 backdrop-blur-sm shadow items-center justify-center"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>

        <button
          aria-label="scroll right"
          onClick={() => scrollBy(320)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/20 backdrop-blur-sm shadow items-center justify-center"
        >
          <ChevronRight size={18} className="text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 hide-scrollbar"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {deals.map((d) => (
            <article
              key={d._id}
              onClick={() => router.push(`/deals/dealsviews/${d._id}`)}
              className="relative cursor-pointer snap-start min-w-[260px] md:min-w-[300px] bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* IMAGE AREA */}
              <div className="relative w-full h-44 md:h-48 bg-gray-100">
                <Image
                  src={d.images[0] || "/placeholder-deal.png"}
                  alt={d.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="bg-[#F50016] w-fit text-white text-[11px] px-2 py-1 rounded-full font-semibold">
                    -{d.discountPercentage}%
                  </span>
                  <span className="inline-flex items-center bg-[#ED6C02] text-white text-[11px] px-2 py-1 rounded-full font-semibold">
                    <Tag
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      stroke="none"
                    />
                    Group deals
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(d); // pass the whole deal, not just id
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
                >
                  <Heart
                    size={16}
                    className={
                      favorites.some((fav) => fav._id === d._id)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-400"
                    }
                  />
                </button>
              </div>

              {/* CARD BODY */}
              <div className="p-3 bg-white">
                <div className="mb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full font-medium">
                      {getAvailableSlots(d.slots)} slots of {d.totalSlots}{" "}
                      available
                    </span>

                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-semibold">
                      ⚠️ {d.shippingNote}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                      {d.title}
                    </p>
                    <p
                      className="text-xs text-gray-500 mt-1 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {d.description}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-lg md:text-xl font-extrabold text-gray-900 leading-none">
                      {formatPrice(d.discountedPrice)}
                    </p>
                    <p className="text-xs text-gray-400 line-through mt-1">
                      {formatPrice(d.originalPrice)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500 border-t pt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={d.vendor.businessLogo || "/avatar.png"}
                        alt="vendor"
                        width={28}
                        height={28}
                        className="object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <div className="text-gray-900 font-medium truncate">
                        {d.vendor.name}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {getTimeAgo(d.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full" />
                      <span>
                        {d.vendor.rating > 0 ? d.vendor.rating : "New"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
