"use client";

import React from "react";
import Image from "next/image";
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Package,
  TrendingUp,
  Zap,
  Award,
  XCircle,
  Store,
  Star,
  ArrowRight,
} from "lucide-react";
import { usePaystackPayment } from "@/utils/usePaystackPayment";
import { useRouter } from "next/navigation";

const PLAN_PRICES = {
  pro: 5000 * 100, // ₦5,000 → kobo
  premium: 10000 * 100, // ₦10,000 → kobo
};

export default function VendorSubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  // values: null | "pro" | "premium"
  const { paystackReady, openPaystackPayment } = usePaystackPayment();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const buildVendorPayloadFromStorage = () => {
    const vendorData = JSON.parse(localStorage.getItem("vendorData") || "{}");
    const vendorUploads = JSON.parse(
      localStorage.getItem("vendorUploads") || "{}",
    );
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?._id) {
      throw new Error("User not found in localStorage");
    }

    return {
      // 🔹 vendor info
      name: vendorData.businessName,
      description: vendorData.businessDescription,
      type:
        vendorData.businessType?.toLowerCase() === "international"
          ? "international"
          : "local",

      location: `${vendorData.city}, ${vendorData.state}`,
      country: "Nigeria",

      // 🔹 business details
      cacNumber: vendorData.cacNumber,
      businessWebsite: vendorData.businessWebsite,
      businessPhone: vendorData.phoneNumber,
      businessEmail: vendorData.email,
      businessAddress: vendorData.fullAddress,

      // 🔹 uploads
      cacDocument: vendorUploads.cacDocument,
      businessLogo: vendorUploads.businessLogo,
      identityImg: vendorUploads.identityImg,
      passportPhoto: vendorUploads.passportPhoto,
      businessBanner: vendorUploads.businessBanner,

      // ✅ FIXED: real MongoDB ObjectId
      postedBy: user._id,
    };
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      alert("Please select a plan to continue");
      return;
    }

    if (!paystackReady) {
      alert("Payment system is still loading. Please wait...");
      return;
    }

    await openPaystackPayment({
      email: "vendor@email.com", // 🔴 replace with logged-in user email
      amount: PLAN_PRICES[selectedPlan],
      businessName: "Vendor Subscription",

      onSuccess: async (transaction) => {
        try {
          console.log("Payment successful:", transaction);

          // 1️⃣ Build payload
          const vendorPayload = buildVendorPayloadFromStorage();

          // 2️⃣ Convert base64 to Blob
          const base64ToBlob = (base64, type = "image/png") => {
            const byteString = atob(base64.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type });
          };

          // 3️⃣ Build FormData
          const formData = new FormData();

          // Text fields
          formData.append("name", vendorPayload.name);
          formData.append("description", vendorPayload.description);
          formData.append("type", vendorPayload.type);
          formData.append("location", vendorPayload.location);
          formData.append("country", vendorPayload.country);
          formData.append("cacNumber", vendorPayload.cacNumber);
          formData.append("businessWebsite", vendorPayload.businessWebsite);
          formData.append("businessPhone", vendorPayload.businessPhone);
          formData.append("businessEmail", vendorPayload.businessEmail);
          formData.append("businessAddress", vendorPayload.businessAddress);
          formData.append("postedBy", vendorPayload.postedBy);
          formData.append("paymentReference", transaction.reference);
          formData.append("plan", selectedPlan);

          // File uploads
          formData.append(
            "passportPhoto",
            base64ToBlob(vendorPayload.passportPhoto),
            "passport.png",
          );
          formData.append(
            "identityImg",
            base64ToBlob(vendorPayload.identityImg),
            "identity.png",
          );
          formData.append(
            "businessLogo",
            base64ToBlob(vendorPayload.businessLogo),
            "logo.png",
          );
          formData.append(
            "businessBanner",
            base64ToBlob(vendorPayload.businessBanner),
            "banner.png",
          );
          formData.append(
            "cacDocument",
            base64ToBlob(vendorPayload.cacDocument),
            "cac.png",
          );

          // 4️⃣ Send vendor creation request
          const res = await fetch("http://localhost:5000/api/vendors/create", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Vendor creation failed");
          }

          console.log("✅ Vendor created:", data);

          // 5️⃣ Update user type + brand + plan
          const user = JSON.parse(localStorage.getItem("user") || "{}");

          if (user?._id) {
            const updateRes = await fetch(
              `http://localhost:5000/api/update-user-type/${user._id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  brand: vendorPayload.name,
                  plan: selectedPlan, // ✅ THIS IS THE KEY FIX
                }),
              },
            );

            const updateData = await updateRes.json();

            if (!updateRes.ok) {
              throw new Error(updateData.message || "Failed to update user");
            }

            console.log("✅ User updated:", updateData.user);

            // ✅ Sync user + plan to localStorage
            localStorage.setItem("user", JSON.stringify(updateData.user));
            localStorage.setItem("plan", updateData.user.plan);
          }

          // 6️⃣ Cleanup onboarding storage
          localStorage.removeItem("vendorData");
          localStorage.removeItem("vendorUploads");

          // 7️⃣ Show success modal
          setShowSuccessModal(true);
        } catch (err) {
          console.error("❌ Vendor creation error:", err);
          alert("Payment succeeded but vendor creation failed.");
        }
      },

      onCancel: () => {
        alert("Payment was not completed. You can try again.");
      },
    });
  };

  return (
    // Outer container: Responsive padding and max-width for centering
    <div className="min-h-screen bg-white-100 py-4 px-2 sm:py-8 sm:px-4 flex justify-center items-start font-sans">
      {/* Main content area: Responsive max-width and shadow */}
      <main className="bg-white w-full max-w-lg md:max-w-4xl lg:max-w-7xl rounded-2xl overflow-hidden pb-6 sm:pb-8">
        {/* Header Banner Section: Responsive Height */}
        <div className="relative w-full h-32 sm:h-40 md:h-56 lg:h-64 bg-gray-200 overflow-hidden">
          <img
            src="/frame7.png" // <-- change this to your actual banner image
            alt="Vendor Banner"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Main Content Area: Responsive Padding */}
        <div className="px-4 sm:px-6 md:px-12 pt-6 sm:pt-8">
          {/* Back Link */}
          <a
            href="/vendor/upload"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium mb-4 transition-colors" // Reduced mb
          >
            <Image
              src="/arrowbendleft.png" // Placeholder image source
              alt="Back"
              width={16} // Smaller icon size for mobile
              height={16}
              className="mr-1"
            />
            <span className="text-sm">Back</span>
          </a>

          {/* Page Title: Responsive text and icon sizing */}
          <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <Store className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Become a Vendor
              </h1>
              <p className="text-gray-500 mt-0.5 text-sm">
                Join Nigeria's leading deals platform
              </p>
            </div>
          </div>

          {/* Stepper Progress: Vertical spacing and text size adjustments */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {/* Step 1 - Completed */}
            <div className="flex items-center justify-between bg-blue-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xs sm:text-sm font-medium w-14 sm:w-16 flex-shrink-0">
                  Step 1/3
                </span>
                <span className="font-semibold text-gray-900 text-sm">
                  Business profile
                </span>
              </div>
              <Image
                src="/blue-check.png"
                alt="Check"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            {/* Step 2 - Completed */}
            <div className="flex items-center justify-between bg-blue-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xs sm:text-sm font-medium w-14 sm:w-16 flex-shrink-0">
                  Step 2/3
                </span>
                <span className="font-semibold text-gray-900 text-sm">
                  Documents Upload
                </span>
              </div>
              <Image
                src="/blue-check.png"
                alt="Check"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            {/* Step 3 - Active: Adjustments for mobile view */}
            <div className="flex items-center justify-between py-2 mt-2 sm:mt-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-blue-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-full w-16 sm:w-auto text-center flex-shrink-0">
                  Step 3/3
                </div>
                <span className="font-bold text-base sm:text-lg text-gray-900 truncate ml-2">
                  Subscription & Plan payment
                </span>
              </div>

              <button className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 ml-4 flex-shrink-0">
                Skip for now
                <CheckCircle2 className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Alert Box (Dynamic) - Responsive padding and text size */}
          <div
            className={`rounded-xl p-3 sm:p-4 flex items-start gap-3 sm:gap-4 mb-8 sm:mb-10 border ${
              selectedPlan === "pro"
                ? "bg-blue-50 border-blue-200"
                : selectedPlan === "premium"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-red-50 border-red-200"
            }`}
          >
            {selectedPlan === null ? (
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5 text-red-500" />
            ) : (
              <img
                src={
                  selectedPlan === "pro"
                    ? "/alert-pro.png"
                    : "/alert-premium.png"
                }
                alt="alert"
                className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-0.5"
              />
            )}

            <div>
              {selectedPlan === null && (
                <>
                  <h3 className="text-red-900 font-bold text-sm sm:text-base">
                    You are on Free plan
                  </h3>
                  <p className="text-red-800 text-xs sm:text-sm mt-0.5 sm:mt-1">
                    You can only post 3 deals monthly.{" "}
                    <span className="font-bold text-red-600 cursor-pointer">
                      Upgrade to Pro{" "}
                    </span>
                    to post more deals and attract more sales
                  </p>
                </>
              )}

              {selectedPlan === "pro" && (
                <>
                  <h3 className="text-[#333333] font-bold text-sm sm:text-base">
                    You selected: Pro Plan
                  </h3>
                  <p className="text-[#333333] text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Your subscription will expires 16the, November, 2025{" "}
                    <span className="font-bold text-[#0088FF] cursor-pointer">
                      Upgrade to Pro{" "}
                    </span>
                  </p>
                </>
              )}

              {selectedPlan === "premium" && (
                <>
                  <h3 className="text-[#333333] font-bold text-sm sm:text-base">
                    You selected: Premium Plan
                  </h3>
                  <p className="text-[#333333] text-xs sm:text-sm mt-0.5 sm:mt-1">
                    Your subscription will expire 16th, November, 2025{" "}
                    <span className="font-bold text-[#ED6C02] cursor-pointer">
                      Upgrade to Pro
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Upgrade via subscription plans
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
              Choose your preferred subscription plan to upgrade your account
            </p>

            {/* Plan Cards Grid: Switches from 1 column on mobile to 2 columns on medium+ screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Pro Plan Card */}
              <div
                onClick={() => setSelectedPlan("pro")}
                className={`rounded-2xl sm:rounded-3xl overflow-hidden bg-white cursor-pointer transition-all hover:shadow-lg
                  ${selectedPlan === "pro" ? "border-2 border-blue-500 ring-4 ring-blue-100" : "border border-blue-100"}
                `}
              >
                {/* Header with background image: Responsive height */}
                <div
                  className="relative p-6 sm:p-8 h-32 sm:h-40 bg-no-repeat bg-contain md:bg-cover md:bg-center"
                  style={{ backgroundImage: "url('/plan-pro-bg.png')" }}
                >
                  {/* Content for price/badges should be added here to match the image */}
                </div>

                {/* Body (White Background): Responsive padding and list item size */}
                <div className="p-6 sm:p-8 bg-white">
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      Upload 10 products monthly
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                      Track clicks & views analytics
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      Boost your deal visibility
                    </li>
                  </ul>
                  {/* Subscription Button (Added here to maintain original structure) */}
                  <button className="w-full mt-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors block lg:hidden">
                    Subscribe to ₦5,000.00
                  </button>
                </div>
              </div>

              {/* Premium Plan Card */}
              <div
                onClick={() => setSelectedPlan("premium")}
                className={`rounded-2xl sm:rounded-3xl overflow-hidden bg-white cursor-pointer transition-all hover:shadow-lg
                  ${selectedPlan === "premium" ? "border-2 border-orange-500 ring-4 ring-orange-100" : "border border-orange-100"}
                `}
              >
                {/* Header with background image: Responsive height */}
                <div
                  className="relative p-6 sm:p-8 bg-no-repeat h-32 sm:h-40 bg-contain sm:bg-cover sm:bg-center"
                  style={{ backgroundImage: "url('/plan-premium-bg.png')" }}
                >
                  {/* Badge */}
                  <div className="mb-4 relative z-10">
                    <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full max-w-max flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Large company
                    </span>
                  </div>
                </div>

                {/* Body (White Background): Responsive padding and list item size */}
                <div className="p-6 sm:p-8 bg-white">
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      Upload 25 products monthly
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                      Track clicks & views analytics
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      Premium badge
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />2
                      free Boost for more visibility
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                      Feature placements
                    </li>
                  </ul>
                  {/* Subscription Button (Added here to maintain original structure) */}
                  <button className="w-full mt-6 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors block lg:hidden">
                    Subscribe for ₦10,000.00
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons: Switches from vertical stack to horizontal on medium+ screens */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            {/* Cancel Button */}
            <button className="flex-1 py-3 sm:py-3.5 rounded-xl border-2 border-red-200 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors text-sm sm:text-base">
              <XCircle className="w-5 h-5" />
              Cancel
            </button>

            {/* Continue Button - Dynamic */}
            <button
              onClick={handleContinue}
              disabled={!paystackReady}
              className="flex-1 cursor-pointer py-3 sm:py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedPlan === "pro"
                ? "Continue with Pro Plan"
                : selectedPlan === "premium"
                  ? "Continue with Premium Plan"
                  : "Continue with Free Plan"}
            </button>
          </div>
        </div>
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-11/12 max-w-md text-center relative">
              <img
                src="/welcome-confetti.png"
                alt="Success"
                className="mx-auto w-32 h-32 mb-4"
              />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome Onboard!
              </h2>
              <p className="text-gray-600 mb-6">
                Vendor account created successfully! Post your first deal and
                start selling today.
              </p>
              <div className="flex flex-col items-center w-full">
                {/* Primary button */}
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/vendor/dashboard");
                  }}
                  className="w-full cursor-pointer bg-blue-600 text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 transition-colors"
                >
                  Post my first deal
                </button>

                {/* Secondary link-style action */}
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push("/vendor/dashboard");
                  }}
                  className="mt-4 cursor-pointer flex items-center gap-2 text-gray-800 text-sm font-medium hover:underline"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-blue-600">
                    <ArrowRight size={12} className="text-blue-600" />
                  </span>
                  Go to my dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
