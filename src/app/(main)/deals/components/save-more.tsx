"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronRight, ChevronLeft, Tag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Deal {
  _id: string;
  title: string;
  description: string;
  images: string[];
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  moqQuantity: number;
  totalOrderedQuantity: number;
  maxQuantityPerUser: number;
  shippingNote: string;
  createdAt: string;
  vendor: {
    name: string;
    businessLogo: string;
    rating: number;
  };
}

export default function SaveMoreDeals() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<Deal[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch deals from backend
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(`${baseURL}/group-deals/get`);
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (err) {
        console.error("Error fetching deals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [baseURL]);

  // Format price
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(n);

  // Scroll
  const scrollBy = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Check if deal is fully booked
  const isDealFull = (deal: Deal) => deal.totalOrderedQuantity >= deal.moqQuantity;

  const progressPercent = (deal: Deal) =>
    Math.min((deal.totalOrderedQuantity / deal.moqQuantity) * 100, 100);

  // Time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return `${diffWeeks} wk${diffWeeks > 1 ? "s" : ""} ago`;
  };

  // Favorites logic
  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");
    if (storedFavs) setFavorites(JSON.parse(storedFavs));
  }, []);

  const toggleFavorite = (deal: Deal) => {
    setFavorites((prev) => {
      const exists = prev.find((d) => d._id === deal._id);
      const updated = exists ? prev.filter((d) => d._id !== deal._id) : [...prev, deal];
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
      <div className="container mx-auto px-4 mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl md:text-[34px] font-extrabold">Save more deals.</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xl">
            Buy in groups and save more with your friends and family
          </p>
        </div>
        <Link href="/all-deals" className="flex items-center text-sky-600 hover:text-sky-700">
          <span className="text-sm font-medium mr-2">See all</span>
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-320)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/20 items-center justify-center"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>

        <button
          onClick={() => scrollBy(320)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/20 items-center justify-center"
        >
          <ChevronRight size={18} className="text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 hide-scrollbar"
        >
          {deals.map((deal) => {
            const progress = progressPercent(deal);

            return (
              <article
                key={deal._id}
                onClick={() => router.push(`/deals/dealsviews/${deal._id}`)}
                className="relative cursor-pointer snap-start min-w-[260px] md:min-w-[300px] bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md"
              >
                {/* Image */}
                <div className="relative w-full h-44 md:h-48 bg-gray-100">
                  <Image
                    src={deal.images[0] || "/placeholder-deal.png"}
                    alt={deal.title}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="bg-red-600 text-white text-[11px] px-2 py-1 rounded-full font-semibold">
                      -{deal.discountPercentage}%
                    </span>
                    <span className="flex items-center bg-orange-500 text-white text-[11px] px-2 py-1 rounded-full font-semibold">
                      <Tag className="w-3 h-3 mr-1" />
                      Group deal
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(deal);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow"
                  >
                    <Heart
                      size={16}
                      className={
                        favorites.some((fav) => fav._id === deal._id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                </div>

                {/* Body */}
                <div className="p-3">
                  {/* Progress & status */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isDealFull(deal) ? "bg-emerald-100 text-emerald-700" : "bg-sky-50 text-sky-700"
                        }`}
                      >
                      {deal.totalOrderedQuantity} of {deal.moqQuantity} units ordered
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          isDealFull(deal) ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {isDealFull(deal) ? "🚚 Shipping in progress" : "📦 Ships when group is complete"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${isDealFull(deal) ? "bg-emerald-500" : "bg-sky-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm font-bold truncate">{deal.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{deal.description}</p>

                  <div className="flex justify-between mt-3">
                    <div>
                      <p className="text-lg font-extrabold">{formatPrice(deal.discountedPrice)}</p>
                      <p className="text-xs line-through text-gray-400">{formatPrice(deal.originalPrice)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 border-t pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Image
                        src={deal.vendor.businessLogo || "/avatar.png"}
                        alt="vendor"
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">{deal.vendor.name}</p>
                        <p className="text-gray-400">{getTimeAgo(deal.createdAt)}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                      {deal.vendor.rating > 0 ? deal.vendor.rating : "New"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
