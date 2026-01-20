"use client";

import { useEffect, useState } from "react";
import AppImage from "@/components/ui/app-image";
import Icon from "@/components/ui/icon";
import Link from "next/link";

type CuratedCategory = {
  _id: string;
  id: number;
  title: string;
  description: string;
  dealsCount: number;
  maxDiscount: number;
  image?: string; // optional in case API has no image
};

// Fallback images by category id
const STATIC_IMAGES: Record<number, string> = {
  1: "/img1.png",
  2: "/img2.png",
  3: "/img3.png",
  4: "/img4.png",
};

const CuratedCategories = () => {
  const [categories, setCategories] = useState<CuratedCategory[]>([]);
  const [loading, setLoading] = useState(true);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${baseURL}/curated-categories/get`,
        );
        if (!res.ok) throw new Error("Failed to fetch categories");

        const json = await res.json();

        const categoriesWithFallback = (json.categories || []).map(
          (cat: CuratedCategory) => ({
            ...cat,
            image: cat.image || STATIC_IMAGES[cat.id] || "/img1.png",
          }),
        );

        setCategories(categoriesWithFallback);
      } catch (err) {
        console.error("Error fetching curated categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <p className="mt-10 text-center text-gray-500">Loading categories...</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {categories.map((category) => (
        <Link
          key={category._id}
          href={`/category/${category.id}`}
          className="group flex flex-col overflow-hidden rounded-xl bg-white transition hover:shadow-md"
        >
          {/* Image Section */}
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-100">
            {/* Discount Badge */}
            <div className="absolute left-3 top-3 z-10">
              <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                Up to {category.maxDiscount}% OFF
              </span>
            </div>

            {/* Image */}
            <AppImage
              src={category.image}
              alt={category.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
            <h3 className="mb-2 text-sm sm:text-lg font-extrabold leading-tight text-gray-900">
              {category.title}
            </h3>

            <div className="mt-2 flex items-start justify-between gap-3">
              <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                {category.description}
              </p>

              <div className="mt-0.5 flex shrink-0 items-center gap-1.5 text-xs font-medium text-gray-900">
                <Icon name="Tag" className="h-4 w-4 text-blue-500" />
                <span>{category.dealsCount}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CuratedCategories;
