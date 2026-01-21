// 'use client' is required by your file
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ThumbsUp,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function DealsForYou() {
  const scrollRef = useRef(null);
  const [brandPhotos, setBrandPhotos] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [deals, setDeals] = useState([
    // initial static fallback so UI isn't empty while fetching
    {
      id: "static-1",
      image: "/image 7.png",
      title: "Brand new iPhone 15 Pro Max - Black | 128GB/1TB",
      brand: "Apple store",
      sold: 200,
      rating: "100.3k",
      comments: "10k",
      price: 99999.9,
      oldPrice: 100000,
      left: 20,
      discount: 28,
      sponsored: true,
      boosted: false,
      userName: "Slyce company limited",
      userAvatar: "/avatar.png",
      tags: ["iPhone", "Smartphone"],
      category: "Electronics",
    },
  ]);
  const [loading, setLoading] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // -----------------------
  // helpers
  // -----------------------
  const safeNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const formatPrice = (n) => {
    const value = safeNumber(n, 0);
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    } catch (e) {
      return "$0";
    }
  };

  const filterDealsForUser = (dealsArr = [], preferences = []) => {
    if (!Array.isArray(preferences) || preferences.length === 0) return [];

    const lowerPrefs = preferences.map(p => String(p).toLowerCase());

    return dealsArr.filter(deal => {
      const title = (deal.title || "").toLowerCase();
      const category = (deal.category || "").toLowerCase();
      const brand = (deal.brand || "").toLowerCase();
      const tags = Array.isArray(deal.tags)
        ? deal.tags.map(t => String(t).toLowerCase())
        : [];

      return lowerPrefs.some(pref =>
        title.includes(pref) ||
        category.includes(pref) ||
        brand.includes(pref) ||
        tags.some(tag => tag.includes(pref))
      );
    });
  };


  const getUserPreferencesFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return [];
      const user = JSON.parse(raw);
      return Array.isArray(user.preferences) ? user.preferences : [];
    } catch {
      return [];
    }
  };



  useEffect(() => {
  const fetchBrandPhotos = async () => {
    const uniqueBrands = [...new Set(deals.map(d => d.brand).filter(Boolean))];

    const map = {};

    await Promise.all(
      uniqueBrands.map(async (brand) => {
        try {
          const res = await fetch(
            `${baseURL}/vendors/name/${encodeURIComponent(brand)}`
          );
          const data = await res.json();

          map[brand] =
            data?.vendor?.passportPhoto ||
            data?.vendor?.businessLogo ||
            "/avatar.png";
        } catch {
          map[brand] = "/avatar.png";
        }
      })
    );

    setBrandPhotos(map);
  };

  if (deals.length > 0) fetchBrandPhotos();
}, [deals]);


  // -----------------------
  // normalization + fetch
  // -----------------------
  useEffect(() => {
    let mounted = true;

    const normalizeDeal = (item) => {
      // choose first image if available, fallback to local placeholder
      const image =
        Array.isArray(item.images) && item.images.length > 0
          ? item.images[0]
          : (item.image ?? item.imageUrl ?? "/image 7.png");

      // createdBy could be populated object or user object; try several places
      const createdByObj = item.createdBy ?? item.user ?? null;

      return {
        ...item,
        id: item._id ?? item.id ?? String(Math.random()).slice(2),
        price: safeNumber(
          item.discountedPrice ??
            item.discounted_price ??
            item.price ??
            item.originalPrice ??
            0,
          0,
        ),
        oldPrice: safeNumber(
          item.originalPrice ?? item.original_price ?? item.oldPrice ?? 0,
          0,
        ),
        discount: safeNumber(
          item.discountPercentage ??
            item.discount_percentage ??
            item.discount ??
            0,
          0,
        ),
        left: safeNumber(item.left ?? item.quantity ?? 0, 0),
        sold: safeNumber(item.views ?? item.sold ?? 0, 0),
        image,
        brand:
          typeof item.brand === "object"
            ? item.brand.name
            : (item.brand ?? "Unknown"),
        comments: Array.isArray(item.comments)
          ? item.comments.length
          : safeNumber(item.comments ?? 0, 0),
        rating: item.averageRating
          ? String(Number(item.averageRating).toFixed(1))
          : String(item.rating ?? "0.0"),
        userName:
          createdByObj?.name ??
          createdByObj?.username ??
          item.userName ??
          "Slyce company limited",
        userAvatar: createdByObj?.avatar ?? item.userAvatar ?? "/avatar.png",
        tags: Array.isArray(item.tags) ? item.tags : [],
        category: item.category ?? "",
        sponsored: !!item.sponsored,
        boosted: !!item.boosted,
      };
    };

    const load = async () => {
      try {
        setLoading(true);

        // safely read localStorage user
        let parsedUser = null;
        try {
          const rawUser = localStorage.getItem("user");
          parsedUser = rawUser ? JSON.parse(rawUser) : null;
        } catch (e) {
          parsedUser = null;
        }
        console.log("User from localStorage:", parsedUser);

        const res = await fetch(`${baseURL}/deals/get?limit=20`);
        if (!res.ok) {
          console.error("Failed to fetch deals, status:", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const rawDeals = Array.isArray(data.deals) ? data.deals : [];
        console.log("Fetched deals (raw):", rawDeals);

        let normalized = rawDeals.map(normalizeDeal);

        // Apply preferences from localStorage (no extra API call needed)
        const preferences = getUserPreferencesFromStorage();
        console.log("User preferences from storage:", preferences);

        const filtered = filterDealsForUser(normalized, preferences);
    normalized = filtered.length > 0 ? filtered : [];


        if (!mounted) return;
        setDeals(normalized);
      } catch (err) {
        console.error("Failed to load deals:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------
  // UI actions
  // -----------------------
  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const slideLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft -= 300;
  };
  const slideRight = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft += 300;
  };



  const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hrs ago`;
  return `${Math.floor(hours / 24)} days ago`;
};


  // -----------------------
  // render
  // -----------------------
  return (
    <section className="w-full mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Deals Just for You!</h2>
          <p className="text-sm text-gray-500 mt-1">
            Discover hundreds of trusted deals shared by savvy shoppers like
            you!
          </p>
        </div>
        <Link
          href="/all-deals"
          className="flex items-center text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          <span className="text-sm font-medium mr-1">See all deals</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={slideLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 text-white items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={slideRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 text-white items-center justify-center rotate-180"
        >
          <ChevronLeft size={18} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory px-2 md:px-0 hide-scrollbar"
          style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
        >
          {loading && (
            <div className="flex items-center justify-center min-w-[280px] md:min-w-[320px]">
              <div>Loading deals…</div>
            </div>
          )}

          {deals.map((item) => (
            <article
              key={item.id}
              className="relative min-w-[280px] md:min-w-[320px] bg-white border border-gray-100 snap-start rounded-xl overflow-hidden shadow-sm"
            >
              <div className="relative w-full h-44 md:h-48 rounded-t-xl overflow-hidden bg-gray-100">
                {/* unoptimized used to avoid requiring next.config.js for remote hosts during dev */}
                <Image
                  src={item.image || "/image 7.png"}
                  alt={item.title || "Deal image"}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 320px"
                />

                <div className="absolute top-3 left-3 flex items-center gap-2 text-xs z-20">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">
                    {item.left} left
                  </span>
                  <span className="bg-yellow-400 text-black px-2 py-1 rounded-full font-semibold">
                    -{item.discount}%
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-20">
                  <div className="flex items-center gap-1">
                    {item.boosted && (
                      <span className="bg-orange-400 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                        Boosted
                      </span>
                    )}
                    {item.sponsored && (
                      <span className="bg-sky-600 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                        Sponsored
                      </span>
                    )}
                  </div>
                </div>

                {/* Favorite button should be above overlay */}
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-3 right-12 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md transform translate-x-1 z-40"
                >
                  <Heart
                    size={16}
                    className={
                      favorites.has(item.id) ? "text-red-500" : "text-gray-400"
                    }
                  />
                </button>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
                      <span className="inline-block w-2 h-2 bg-black rounded-full flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">
                        {item.brand}
                      </span>
                    </div>
                    <span className="text-xs text-orange-500 font-medium">
                      {item.sold} Sold
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                      <ThumbsUp size={14} />
                      <span className="font-medium">{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      <MessageCircle size={14} />
                      <span className="font-medium">{item.comments}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800 leading-tight min-w-0">
                    {item.title?.includes("|") ? (
                      <>
                        {item.title.split("|")[0].trim()} <br />
                        <span className="text-gray-600 text-xs">{`| ${item.title.split("|").slice(1).join("|").trim()}`}</span>
                      </>
                    ) : (
                      item.title
                    )}
                  </p>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-extrabold leading-none">
                      {formatPrice(item.price)}
                    </p>
                    {safeNumber(item.oldPrice, 0) > 0 && (
                      <p className="text-xs text-gray-400 line-through mt-1">
                        {formatPrice(item.oldPrice)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500">
                  <div className="flex items-center gap-2">
                  <Image
  src={brandPhotos[item.brand] || "/avatar.png"}
  alt={item.brand}
  width={18}
  height={18}
  className="rounded-full object-cover"
/>

                    <span>{timeAgo(item.createdAt)}</span>
                    <span className="hidden sm:inline">
                      by {item.userName || "Slyce company limited"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400">10.0k</div>
                  </div>
                </div>
              </div>

              {/* Make overlay non-blocking so buttons work (pointer-events-none); interactive elements have higher z-index */}
              <Link
                href={`/product/${item.id}`}
                className="absolute inset-0 z-10 pointer-events-none"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
