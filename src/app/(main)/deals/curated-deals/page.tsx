"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, MessageSquare, ThumbsUp, ChevronLeft } from "lucide-react";
import Header from "@/components/general/header";
import Footer from "@/components/general/footer";

// --- Types ---
interface Product {
  _id: string;
  title: string;
  images: string[];
  price: number;
  originalPrice: number;
  discountPercentage: number;
  category: string;
  vendor?: { name: string; businessLogo?: string };
}

export default function CategoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Get the "category" from the URL (?category=Electronics)
  const categoryParam = searchParams.get("category") || "All Deals";

  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchCategoryDeals = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        category: categoryParam,
        limit: "12",
        status: "active"
      });

      const res = await fetch(`${baseURL}/deals/get?${query}`);
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDeals();
  }, [categoryParam]); // Refetch whenever the URL category changes

  return (
    <div className="container mx-auto px-4 py-8">
    <Header />
      <div className="flex items-center gap-4 mb-8 mt-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold capitalize text-slate-900">
            {/* 2. Added safety: use optional chaining or fallback */}
            {categoryParam?.replace("-", " ")}
          </h1>
          <p className="text-gray-500 text-sm">
            Showing the best deals in {categoryParam}
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-gray-500">No deals found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deals.map((deal) => (
            <SimpleProductCard key={deal._id} deal={deal} />
          ))}
        </div>
      )}
          <Footer />
    </div>
  );
}

// --- Sub-Component: Simple Card ---
function SimpleProductCard({ deal }: { deal: Product }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/deals/${deal._id}`)}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer flex flex-col"
    >
      <div className="relative h-48 w-full bg-gray-50">
        <Image
          src={deal.images?.[0] || "/placeholder.png"}
          alt={deal.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded">
          -{deal.discountPercentage}%
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
          {deal.title}
        </h3>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              ${deal.discountedPrice}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ${deal.originalPrice}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
             <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                {deal.vendor?.name || "Verified Vendor"}
             </span>
             <Heart className="w-4 h-4 text-gray-300 hover:text-red-500 transition" />
          </div>
        </div>
      </div>
    </div>
  );
}
