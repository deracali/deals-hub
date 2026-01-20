"use client";

import { useState } from "react";
import AppImage from "@/components/ui/app-image";
import Icon from "@/components/ui/icon";

type DealImageGalleryProps = {
  images: string[];
  title?: string;
};

const DealImageGallery = ({ images, title }: DealImageGalleryProps) => {
  const safeImages = images.filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % safeImages.length);

  const prevImage = () =>
    setCurrentImageIndex(
      (prev) => (prev - 1 + safeImages.length) % safeImages.length,
    );

  if (safeImages.length === 0) {
    return (
      <div className="w-full h-[300px] lg:h-[500px] rounded-[2rem] bg-gray-100 flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Main Container:
          - Column on mobile (flex-col)
          - Row on desktop (lg:flex-row)
      */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main Image Container:
            - Takes top priority on mobile (order-1)
            - Fixed height on mobile, larger on desktop
        */}
        <div className="relative flex-1 h-[350px] sm:h-[450px] lg:h-[660px] order-1 lg:order-2">
          <div className="w-full h-full rounded-[1.5rem] lg:rounded-[2.2rem] overflow-hidden bg-gray-50">
            <AppImage
              src={safeImages[currentImageIndex]}
              alt={title || "Product image"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Navigation Arrows */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Container:
            - Horizontal row on mobile (flex-row)
            - Vertical column on desktop (lg:flex-col)
            - Positioned below main image on mobile (order-2)
            - Scrollable on mobile if images overflow
        */}
        <div className="flex flex-row lg:flex-col gap-3 order-2 lg:order-1 overflow-x-auto lg:overflow-visible py-2 lg:py-0 no-scrollbar justify-start sm:justify-center lg:justify-start">
          {safeImages.map((img, index) => (
            <button
              key={`${img}-${index}`}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 lg:w-18 lg:h-18 rounded-xl overflow-hidden border-[2px] transition-all ${
                index === currentImageIndex
                  ? "border-blue-500 shadow-md"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <AppImage
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealImageGallery;
