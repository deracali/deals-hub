// app/(your-path)/DealsDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Image from "next/image";

import Header from "@/components/general/header";
import Footer from "@/components/general/footer";
import SearchSection from "../../home/popular-search";
import ProductCard from "../../home/product";
import SaveMoreDeals from "./save-more";
import SavingBanner from "../../home/SavingBanner";
import LimitedTimeDeals from "../../home/limited-time-deals";
import CuratedCategories from "../../home/curated-categories";
import DealsForYou from "./deals-for-you";
import CouponsCarousel from "../../home/coupons-carousel";
import CommunitySection from "../../home/community";
import StoreCard from "../../home/top-vendors";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Link from "next/link";

const DealsDashboard = () => {
  const [curatedCategories, setCuratedCategories] = useState<any[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;


  useEffect(() => {
    const fetchCuratedCategories = async () => {
      try {
        const res = await fetch(
          `${baseURL}/curated-categories/get`,
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <main className="flex-1 container mx-auto px-4 py-6">
          <SearchSection />

          <SaveMoreDeals />

          <ProductCard />

          <section className="py-12 bg-muted/10">
            {/* Full-width red background */}
            <div className="w-full bg-red-500 text-white py-4 mb-6">
              <div className="w-full px-10 mx-auto">
                <h2 className="text-2xl font-bold">Limited Time Deals</h2>
                <p className="text-sm font-semibold mt-1">
                  Valid until:{" "}
                  <span className="font-bold">2D : 12h : 23m : 56s</span>
                </p>
              </div>
            </div>

            {/* EXACT SAME WIDTH AS RED HEADER */}
            <div className="w-full px-10 mx-auto">
              <LimitedTimeDeals />
            </div>
          </section>

          <DealsForYou />

          <section className="w-full bg-[#FF9333] mt-20 mb-12 relative overflow-hidden">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />

            {/* CONTENT CONTAINER */}
            <div className="relative container mx-auto px-4">
              <CouponsCarousel coupons={availableCoupons} />
            </div>
          </section>

          <section className="py-12 bg-muted/20">
            <div className="container mx-auto px-4">
              {/* Header Container: Flex to justify content between left and right */}
              <div className="mb-10 flex items-end justify-between">
                {/* Left Side: Title and Description */}
                <div className="text-left">
    <h2 className="text-[1.5rem] md:text-3xl font-extrabold text-foreground mb-2 leading-none">
      Curated Collections
    </h2>
    <p className="text-muted-foreground max-w-full md:max-w-2xl">
      Specially handpicked deals organized by themes and occasions to save you time
    </p>
  </div>


                {/* Right Side: See All Deals Link */}
                {/* Target the link to a general deals or collections page */}
                <Link
                  href="/all-deals"
                  className="flex items-center text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  <span className="text-sm font-medium mr-1">
                    See all deals
                  </span>
                  <Icon name="ChevronRight" size={16} />
                </Link>
              </div>

              <CuratedCategories categories={curatedCategories} />
            </div>
          </section>

          <section className="py-12 bg-muted/10">
            <div className="container mx-auto px-4">
              <div className="mb-10 flex items-end justify-between">
                <div className="text-left">
                  {/* Heading with Image inline */}
                  <div className="flex items-center mb-2">
                    <Image
                      src="/TrendUp.png" // replace with your image path
                      alt="Store Icon"
                      width={40} // smaller to fit nicely with text
                      height={40}
                      className="mr-3"
                    />
                    <h2 className="text-3xl font-extrabold text-foreground leading-none">
                      Top Vendors
                    </h2>
                  </div>

                  <p className="text-muted-foreground max-w-lg">
                    Discover and support amazing local businesses across Africa
                  </p>
                </div>

                <Link
                  href="/all-stores"
                  className="flex items-center text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  <span className="text-sm font-medium mr-1">
                    See all stores
                  </span>
                  <Icon name="ChevronRight" size={16} />
                </Link>
              </div>

              <StoreCard />
            </div>
          </section>

          <CommunitySection />

          <SavingBanner />

          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DealsDashboard;
