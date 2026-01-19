"use client";

import React from "react";
import { Tag, Users, Percent } from "lucide-react";
import Link from "next/link";

const SavingBanner = () => {
  // Replace this path with the actual path to your background image file located in the /public folder.
  // E.g., if file is at /public/images/banner-bg.jpg, path is '/images/banner-bg.jpg'
  const backgroundImagePath = "/image 18.png";

  return (
    <section
      className="container mx-auto relative h-auto min-h-[500px] rounded-[3rem] overflow-hidden flex items-center justify-center p-6 md:p-8 my-8"
      style={{
        // Using inline style for background image so it can be dynamic or easily swapped
        backgroundImage: `url('${backgroundImagePath}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        // Fallback color in case image doesn't load or while loading
        backgroundColor: "#0088ff",
      }}
    >
      {/* Optional: Dark overlay if your image is too bright for white text */}
      {/* <div className="absolute inset-0 bg-blue-900/20"></div> */}

      <div className="relative z-10 flex flex-col items-center text-center text-white max-w-3xl">
        {/* --- Central Graphic (Recreated with CSS/Icons) --- */}
        {/* Replace this entire block with an <Image /> if you have the asset file */}
        <div className="mb-8 relative h-16 shadow-lg shadow-blue-900/20 rounded-2xl overflow-hidden">
          <img
            src="/Community.png" // replace with your image URL
            alt="Promotional Banner"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
          Ready to Start Saving?
        </h2>
        <p className="text-lg md:text-xl mb-10 opacity-95 leading-relaxed font-medium">
          Join thousands of smart shoppers who are already saving money with our
          community-driven deals
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 font-semibold text-lg">
          <Link
            href="/community"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white transition duration-300 hover:bg-white/10"
          >
            Join Community
            <Users size={20} />
          </Link>

          <Link
            href="/deals"
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-white text-[#0088ff] shadow-md transition duration-300 hover:bg-gray-100 hover:shadow-lg"
          >
            <Tag size={20} /> {/* Icon stays outlined, no fill */}
            Browse deals
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SavingBanner;
