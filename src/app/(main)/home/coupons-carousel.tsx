"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ClipboardDocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/solid";

// static fallback scratch image
const STATIC_IMAGE = "/Scratch coupon.png";

// ---------- CouponPage (fetch + carousel) ----------
export default function CouponPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${baseURL}/coupons/get`);
        if (!res.ok) throw new Error("Failed to fetch coupons");
        const json = await res.json();
        // ensure data is an array and filter out falsy entries
        const data = Array.isArray(json.data) ? json.data.filter(Boolean) : [];
        setCoupons(data);
      } catch (err) {
        console.error("Error fetching coupons:", err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">Loading coupons...</p>
    );

  if (!coupons.length)
    return (
      <p className="text-center mt-10 text-gray-500">
        No coupons available at the moment.
      </p>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="w-full mx-auto z-10 px-4">
        <div className="flex justify-between items-end mb-8 text-white">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold mb-2 text-white">
              Available Coupons
            </h1>

            <p className="opacity-90 text-white-900">
              Grab these limited-time offers before they expire
            </p>
          </div>
          <div>
            <button className="flex items-center gap-1 whitespace-nowrap text-sm sm:text-base text-white-900 hover:underline">
              View all coupons
              <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -340, behavior: "smooth" })
            }
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/20 text-gray-700 p-3 rounded-full z-20"
            aria-label="scroll left"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 340, behavior: "smooth" })
            }
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/10 hover:bg-black/20 text-gray-700 p-3 rounded-full z-20"
            aria-label="scroll right"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory hide-scrollbar scroll-smooth"
          >
            {coupons.map((coupon) =>
              coupon ? (
                <SingleCouponCard key={coupon._id ?? coupon.id} data={coupon} />
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* hide scrollbar styles */}
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

// ---------- SingleCouponCard ----------
function SingleCouponCard({ data }: { data: any }) {
  // data can be undefined — guard everywhere
  const [revealed, setRevealed] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>("");

  // compute countdown to expiresAt (if provided)
  useEffect(() => {
    if (!data || !data.expiresAt) {
      setCountdown("No expiry info");
      return;
    }

    let mounted = true;

    const updateCountdown = () => {
      if (!mounted) return;
      const now = Date.now();
      const expiry = new Date(data.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setCountdown("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(
        `${days}d : ${String(hours).padStart(2, "0")}h : ${String(
          minutes,
        ).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`,
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [data?.expiresAt]);

  // decorative curvy style (keeps your original design)
  const curvySideStyle = {
    background: `radial-gradient(circle at top left, transparent 20px, white 20.5px),
                 radial-gradient(circle at top right, transparent 20px, white 20.5px)`,
    backgroundSize: "50.1% 100%",
    backgroundPosition: "left bottom, right bottom",
    backgroundRepeat: "no-repeat",
    backgroundColor: "transparent",
  } as React.CSSProperties;

  // safe fallbacks for fields
  const bg = data?.backgroundColor ?? "linear-gradient(to right, #ccc, #999)";
  const title = data?.title ?? "No Title";
  const discount = data?.discount ?? "N/A";
  const description = data?.description ?? "";
  const code = data?.code ?? "N/A";
  const isPopular = Boolean(data?.isPopular);

  return (
    <div className="w-[320px] flex-shrink-0 snap-center flex flex-col drop-shadow-xl">
      {/* Top Half */}
      <div
        className="h-[240px] rounded-t-2xl relative p-4 text-white text-center flex flex-col items-center justify-center"
        style={{ background: bg }}
      >
        {/* Popular ribbon */}
        {isPopular && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-xs font-semibold text-gray-900 px-2 py-1 rounded-full shadow-md z-20">
            Popular
          </div>
        )}

        <StarIcon className="absolute top-4 left-4 w-8 h-8 text-white opacity-20 rotate-12" />
        <div className="relative z-10">
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <div className="font-black text-7xl leading-[0.9]">
            {discount}
            <span className="block text-3xl font-bold mt-2 tracking-wide">
              OFF
            </span>
          </div>
          <p className="text-sm mt-4 leading-tight opacity-90 px-2">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom Half */}
      <div
        className="relative -mt-[1px] pt-8 pb-5 px-6 rounded-b-2xl bg-white"
        style={curvySideStyle}
      >
        {/* Scratch / Code Area */}
        <div className="h-16 w-full mb-4 relative">
          {revealed ? (
            <div className="h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between pl-4 pr-2">
              <span className="font-bold text-gray-800 text-lg tracking-wider">
                {code}
              </span>
              <button
                onClick={() => {
                  if (
                    code &&
                    typeof navigator !== "undefined" &&
                    navigator.clipboard
                  ) {
                    navigator.clipboard.writeText(code);
                  }
                }}
                className="bg-blue-500 p-2 rounded text-white hover:opacity-90 active:scale-95 transition"
                aria-label="Copy coupon code"
              >
                <ClipboardDocumentIcon className="w-5 cursor-pointer h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="w-full h-full rounded-lg relative overflow-hidden group cursor-pointer"
              style={{
                backgroundImage: `url('${STATIC_IMAGE}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-label="Reveal coupon code"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500 font-medium text-sm group-hover:scale-105 transition-transform">
                  Click here to reveal code
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Countdown Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
            Valid Until
          </p>
          <p
            className={`font-bold ${
              countdown === "Expired" ? "text-red-500" : "text-gray-900"
            }`}
          >
            {countdown}
          </p>
        </div>
      </div>
    </div>
  );
}
