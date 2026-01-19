"use client";

import Image from "next/image";
import Header from "@/components/general/header";
import HeroSection from "../../home/hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Icon from "@/components/ui/icon";
import LimitedTimeDeals from "../../home/limited-time-deals";
import ProductCard from "../../home/product";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const MarketingHomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [curatedCategories, setCuratedCategories] = useState<any[]>([]);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const searchParams = useSearchParams();
  const router = useRouter();

  // Save Google user if present in URL
  useEffect(() => {
    const userParam = searchParams.get("user");
    const token = searchParams.get("token");

    if (userParam && token) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        console.log("✅ Google user saved:", user);
        router.push("/"); // redirect after saving
      } catch (error) {
        console.error("❌ Failed to parse user:", error);
      }
    }
  }, [searchParams, router]);

  // Available coupons mock data
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${baseURL}/coupons/get`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          // Map DB fields to match your UI needs
          const mappedCoupons = data.data.map((coupon: any) => ({
            id: coupon._id,
            title: coupon.title,
            description: coupon.description,
            discount: coupon.discount,
            code: coupon.code,
            expiresAt: coupon.expiresAt,
            vendor: coupon.vendor,
            category: coupon.category || "general",
            backgroundColor: coupon.backgroundColor,
            isPopular: coupon.isPopular,
          }));

          setAvailableCoupons(mappedCoupons);
          console.log("✅ Coupons loaded:", mappedCoupons);
        } else {
          console.error("❌ Invalid coupon data:", data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch coupons:", error);
      }
    };

    fetchCoupons();
  }, []);

  // Fetch trending products from API and sort by likes
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/deals/get");
        const data = await res.json();

        console.log("✅ Fetched data:", data);

        if (!Array.isArray(data.deals)) {
          console.error("❌ data.deals is not an array");
          return;
        }

        // ✅ FILTER ONLY ACTIVE DEALS
        const activeDeals = data.deals.filter(
          (deal: any) => deal.status === "active",
        );

        console.log("🟢 Active deals only:", activeDeals);

        const mappedDeals = activeDeals.map((deal: any) => {
          const discount = deal.originalPrice
            ? ((deal.originalPrice - deal.discountedPrice) /
                deal.originalPrice) *
              100
            : 0;

          return {
            id: deal._id,
            title: deal.title,
            image:
              deal.images?.[0] ||
              "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
            currentPrice: deal.discountedPrice,
            originalPrice: deal.originalPrice,
            discount,
            upvotes: deal.likes?.length || 0,
            isSaved: deal.isSaved || false,
            vendor: deal.brand || "Unknown",
            slug: deal.slug,
          };
        });

        // Sort by discount descending
        const trending = mappedDeals.sort((a, b) => b.discount - a.discount);

        // Filter deals with 50%+ discount and limit to 4
        const trending50Plus = trending
          .filter((deal) => deal.discount >= 50)
          .slice(0, 4);

        console.log("🔥 Trending ACTIVE deals (50%+):", trending50Plus);

        setTrendingProducts(trending50Plus);
      } catch (err) {
        console.error("❌ Failed to fetch trending products:", err);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    const fetchCuratedCategories = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/curated-categories/get",
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.categories)) {
          const mappedCategories = data.categories.map((cat: any) => ({
            id: cat._id, // use MongoDB _id
            title: cat.title,
            description: cat.description,
            image: cat.image,
            dealsCount: cat.dealsCount,
            maxDiscount: cat.maxDiscount,
            color: cat.color,
          }));

          setCuratedCategories(mappedCategories);
          console.log("✅ Curated categories loaded:", mappedCategories);
        } else {
          console.error("❌ Invalid curated category response:", data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch curated categories:", error);
      }
    };

    fetchCuratedCategories();
  }, []);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => setSearchQuery(query);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <section className="py-12 bg-muted/10">
        {/* Full-width red background */}

        <div className="w-full bg-red-600 text-white py-4 mb-6">
          <div className="container mx-auto px-4 space-y-1">
            {/* Row 1 */}
            <div className="flex items-center justify-between whitespace-nowrap">
              <h2 className="text-base md:text-2xl font-bold">
                Limited Time Deals
              </h2>

              <a
                href="#"
                className="flex items-center gap-1 text-xs md:text-sm font-bold hover:opacity-80 transition-opacity"
              >
                View all deals
                <ChevronRight size={16} strokeWidth={3} />
              </a>
            </div>

            {/* Row 2 */}
            <p className="text-xs md:text-sm font-semibold opacity-90 whitespace-nowrap">
              Valid until:
              <span className="font-bold ml-1">2D : 12h : 23m : 56s</span>
            </p>
          </div>
        </div>

        {/* EXACT SAME WIDTH AS RED HEADER */}
        <div className="w-full px-0 sm:px-10 mx-auto">
          <LimitedTimeDeals />
        </div>
      </section>
      <ProductCard />
    </div>
  );
};

export default MarketingHomePage;
