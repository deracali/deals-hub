"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleUserSignup = () => router.push("/login");
  const handleVendorSignup = () => router.push("/vendor/apply");

  const BRAND_BLUE = "#3498db";
  const VENDOR_ACCENT_BLUE = "#54a0ff";

  const defaultStyle = {
    borderStyle: "solid",
    borderColor: "rgb(229 231 235)",
  };
  const hoverStyle = {
    borderStyle: "dotted",
    borderColor: VENDOR_ACCENT_BLUE,
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  };

  const [userHover, setUserHover] = useState(false);
  const [vendorHover, setVendorHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setMounted(true);
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* LEFT IMAGE */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative bg-white">
        {!mounted && (
          <div className="w-full flex justify-center mt-8">
            <div className="relative w-11/12 sm:w-3/4 h-[15vh] rounded-lg overflow-hidden bg-gray-100" />
          </div>
        )}

        {mounted && isMobile && (
          <div className="block md:hidden w-full flex justify-center mt-8">
            <div className="relative w-11/12 sm:w-3/4 h-[15vh] rounded-lg overflow-hidden">
              <img
                src="/register-bg-sm.png"
                alt="Join Mobile"
                className="object-cover rounded-lg h-full"
                priority
                sizes="(max-width: 768px) 100vw"
              />
            </div>
          </div>
        )}

        {mounted && !isMobile && (
          <div className="hidden md:block w-full h-screen relative overflow-hidden rounded-xl">
            <img
              src="/register-bg-lg.png"
              alt="Join Desktop"
              className="object-cover"
              priority
              sizes="(min-width: 768px) 50vw"
            />
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex flex-col items-center bg-white h-screen px-6 md:px-12">
        {/* Slight top spacing */}
        <div className="max-w-lg w-full flex flex-col items-center mt-5 space-y-4">
          {/* Branding/Header */}
          <div className="text-center">
            <div className="flex flex-col items-center justify-center">
              <img
                src="/logo.png"
                width={64}
                height={64}
                alt="Slyce Logo Icon"
                className="mb-2"
              />
              <h3 className="text-sm text-gray-700 font-medium">
                Welcome to Slyce
              </h3>
              <img
                src="/logo.png"
                width={242}
                height={88}
                alt="Slyce Wordmark"
                className="object-contain mb-3"
              />
            </div>
            <p className="text-center text-sm text-gray-500 max-w-xs mx-auto">
              Discover unbeatable deals and help hidden gems get noticed
            </p>
          </div>

          {/* How do you want to join */}
          <div className="text-center pt-4">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              How do you want to join?
            </h2>
            <p className="text-gray-500 text-sm">
              Choose the option that best describes you
            </p>
          </div>

          {/* Signup Options */}
          <div className="flex flex-col md:flex-row justify-center gap-4 pt-6 w-full">
            {/* User Button */}
            <button
              onClick={handleUserSignup}
              onMouseOver={() => setUserHover(true)}
              onMouseOut={() => setUserHover(false)}
              className="flex-1 p-6 bg-white cursor-pointer border-2 rounded-xl transition-all duration-200 shadow-md focus-visible:outline-none"
              style={{ ...defaultStyle, ...(userHover && hoverStyle) }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(255, 102, 0, 0.1)" }}
                >
                  <img
                    src="/deal-hunter-icon.png"
                    alt="Deal Hunter Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  I'm a Deal Hunter
                </h3>
                <p className="text-[14px] leading-[18px] text-[#4D4D4D] text-center w-[232px] h-[72px]">
                  Uncover local deals, save big, and inspire others to find
                  amazing discounts where you live.
                </p>
              </div>
            </button>

            {/* Vendor Button */}
            <button
              onClick={handleVendorSignup}
              onMouseOver={() => setVendorHover(true)}
              onMouseOut={() => setVendorHover(false)}
              className="flex-1 p-6 cursor-pointer bg-white border-2 rounded-xl transition-all duration-200 shadow-md focus-visible:outline-none"
              style={{ ...defaultStyle, ...(vendorHover && hoverStyle) }}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: "rgba(84, 160, 255, 0.1)" }}
                >
                  <img
                    src="/vendor-icon.png"
                    alt="Vendor Icon"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  I'm a Vendor
                </h3>
                <p className="text-[14px] leading-[18px] text-[#4D4D4D] text-center w-[232px] h-[72px]">
                  Put your offers in front of ready to buy customers and escape
                  algorithm restrictions that limit your reach.
                </p>
              </div>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center pt-6 pb-2">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold hover:opacity-80 transition-opacity"
                style={{ color: BRAND_BLUE }}
              >
                Log in
              </a>{" "}
              here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
