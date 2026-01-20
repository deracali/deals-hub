"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Slide {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  // This variable is coming from your .env or Vercel settings
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // We use the baseURL variable here instead of localhost
        const res = await fetch(`${baseURL}/heroes/get`);
        const data = await res.json();

        if (data.success) {
          setSlides(data.data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch slides:", error);
      }
    };

    if (baseURL) {
      fetchSlides();
    }
  }, [baseURL]); // The size of this array is now fixed at 1

  // Auto slide change
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides]);

  const goToSlide = (i: number) => setCurrent(i);

  if (!slides || slides.length === 0) {
    return (
      <div className="container mx-auto px-4 pt-4">
        <div className="w-full h-[220px] md:h-[420px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-4">
      {/* SLIDER */}
      <section className="relative w-full h-[220px] md:h-[350px] lg:h-[420px] overflow-hidden rounded-xl">
        {slides.map((slide, index) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Optional overlay text */}
            <div
              className={`absolute inset-0 ${slide.gradient} bg-opacity-40 flex flex-col justify-center items-start p-6 text-white`}
            >
              <h2 className="text-xl md:text-3xl font-bold">{slide.title}</h2>
              <p className="text-sm md:text-lg mt-2">{slide.subtitle}</p>
            </div>
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
