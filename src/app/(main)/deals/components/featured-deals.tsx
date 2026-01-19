/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AppImage from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Link from "next/link";
import { useEffect, useState } from "react";

const getOriginal = (d: any) =>
  Number(d?.originalPrice ?? d?.listPrice ?? d?.price ?? d?.currentPrice ?? 0);
const getDiscounted = (d: any) =>
  Number(d?.discountedPrice ?? d?.currentPrice ?? d?.price ?? 0);

const FeaturedDealsCarousel = ({ deals }: { deals: any[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || !deals || deals.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % deals.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, deals]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    if (!deals || deals.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? deals.length - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    if (!deals || deals.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % deals.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  if (!deals || deals.length === 0) return null;

  const currentDeal = deals[currentSlide] ?? deals[0];

  // Normalize prices so we show something regardless of which field the API uses
  const orig = getOriginal(currentDeal);
  const disc = getDiscounted(currentDeal);
  const priceToShow = disc > 0 ? disc : orig; // show discounted if available, otherwise original
  const computedDiscount =
    Number(currentDeal?.discountPercentage) ||
    (orig > 0 && priceToShow < orig
      ? Math.round(((orig - priceToShow) / orig) * 100)
      : 0);

  // image fallback (ensure AppImage receives a string)
  const imageSrc =
    currentDeal?.image ??
    (Array.isArray(currentDeal?.images) ? currentDeal.images[0] : "") ??
    "/NOIMAGE.png";

  return (
    <div className="relative bg-gradient-to-r from-primary to-accent rounded-lg overflow-hidden mb-8">
      <div className="relative h-64 md:h-80">
        {/* Background Image */}
        <div className="absolute inset-0">
          <AppImage
            src={imageSrc}
            alt={currentDeal?.title ?? "featured deal"}
            className="w-full h-full object-cover opacity-20"
            width={1600}
            height={800}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Deal Info */}
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    Featured Deal
                  </span>
                  {computedDiscount > 0 && (
                    <span className="bg-error text-error-foreground px-3 py-1 rounded-full text-sm font-bold">
                      -{computedDiscount}% OFF
                    </span>
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
                  {currentDeal?.title}
                </h2>

                {currentDeal?.description && (
                  <p className="text-white/90 mb-4 line-clamp-2">
                    {currentDeal.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold">
                      {priceToShow > 0
                        ? `$${Number(priceToShow).toFixed(2)}`
                        : "—"}
                    </span>
                    {orig > priceToShow && orig > 0 && (
                      <span className="text-lg text-white/70 line-through">
                        ${Number(orig).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button variant="secondary" size="lg" asChild>
                    <Link
                      href={`/deals/1?id=${currentDeal?.id ?? currentDeal?._id ?? ""}`}
                    >
                      View Deal
                    </Link>
                  </Button>

                  {currentDeal?.expiresAt && (
                    <div className="flex items-center space-x-1 text-white/90">
                      <Icon name="Clock" size={16} />
                      <span className="text-sm">
                        Expires{" "}
                        {new Date(currentDeal.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deal Image */}
              <div className="hidden md:block">
                <div className="relative">
                  <AppImage
                    src={imageSrc}
                    alt={currentDeal?.title ?? "deal image"}
                    className="w-full h-48 object-cover rounded-lg shadow-lg"
                    width={600}
                    height={400}
                  />
                  {currentDeal?.hasCashback && (
                    <div className="absolute top-2 right-2 bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium">
                      Cashback Available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {deals.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors focus-ring"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors focus-ring"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </>
        )}
      </div>

      {/* OLD-style dots (Button) */}
      {deals.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {deals.map((_: any, index: number) => (
            <Button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play Indicator */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <Icon name={isAutoPlaying ? "Pause" : "Play"} size={14} />
        </button>
      </div>
    </div>
  );
};

export default FeaturedDealsCarousel;
