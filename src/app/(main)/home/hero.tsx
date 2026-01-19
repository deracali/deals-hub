"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  "/mega-sale-banner.png",
  "/mega-sale-banner.png",
  "/mega-sale-banner.png",
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (i: number) => setCurrent(i);

  return (
    <div className="container mx-auto px-4 pt-4">
      {/* SLIDER */}
      <section className="relative w-full h-[220px] md:h-[350px] lg:h-[420px] overflow-hidden rounded-xl">
        {slides.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </section>

      {/* PILL INDICATORS */}
      <div className="flex justify-center mt-4 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index ? "bg-blue-600 w-8" : "bg-gray-400 w-4"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
