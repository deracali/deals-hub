"use client";

import Image from "next/image";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, ChevronLeft } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function LimitedTimeDeals() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(`${baseURL}/deals/get`);
        const data = await res.json();

        const now = Date.now();

        const activeDeals = data.deals
          .filter(
            (deal: any) =>
              deal.expirationDate &&
              new Date(deal.expirationDate).getTime() > now,
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.expirationDate).getTime() -
              new Date(b.expirationDate).getTime(),
          );

        setDeals(activeDeals);
      } catch (err) {
        console.error("Failed to fetch deals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) return null;
  const breakTitle = (title: string, words = 3) => {
    const split = title.split(" ");
    return split.length > words
      ? split.slice(0, words).join(" ") + "\n" + split.slice(words).join(" ")
      : title;
  };

  return (
    <section className="mt-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* LEFT ARROW */}
          <button
            onClick={() => (scrollRef.current!.scrollLeft -= 300)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-black/70 text-white items-center justify-center"
          >
            <ChevronLeft size={20} />
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={() => (scrollRef.current!.scrollLeft += 300)}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-black/70 text-white items-center justify-center rotate-180"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory hide-scrollbar"
          >
            {deals.map((item) => (
              <article
                key={item._id}
                className="
            relative
            min-w-[48%] sm:min-w-[240px] md:min-w-[320px]
            bg-white border border-gray-100
            rounded-xl
            snap-start
          "
              >
                {/* IMAGE */}
                <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-t-xl overflow-hidden bg-gray-100">
                  <Image
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />

                  {/* BADGES */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] sm:text-xs">
                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      {item.views || 0} sold
                    </span>
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      -{Math.round(item.discountPercentage)}%
                    </span>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-2 sm:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                        <span className="inline-block w-1.5 h-1.5 bg-black rounded-full" />
                        <span className="text-[10px] sm:text-xs text-gray-700 truncate">
                          {item.brand}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] sm:text-xs">
                        <ThumbsUp size={10} />
                        <span>{item.likes?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* TITLE + PRICE */}
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <p
                      className="
          text-xs sm:text-sm
          font-medium text-gray-800
          leading-snug
          line-clamp-2
        "
                    >
                      {item.title}
                    </p>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base sm:text-lg md:text-xl font-extrabold leading-none">
                        {item.currencySymbol}
                        {item.discountedPrice}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 line-through mt-0.5">
                        {item.currencySymbol}
                        {item.originalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
