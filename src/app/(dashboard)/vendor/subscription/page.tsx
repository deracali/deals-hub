"use client";

import React, { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { usePaystackPayment } from "@/utils/usePaystackPayment";
import { useRouter } from "next/navigation";

export default function VendorSubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = React.useState(null); // Now stores the plan object
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { paystackReady, openPaystackPayment } = usePaystackPayment();
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);

  const popup = (message: string) => {
    const div = document.createElement("div");
    div.innerText = message;

    div.className =
      "fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50";

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2000);
  };


  // 1️⃣ Fetch Plans from your API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("https://dealshub-server.onrender.com/api/vendor-plans/get");
        const data = await res.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const buildVendorPayloadFromStorage = () => {
    const vendorData = JSON.parse(localStorage.getItem("vendorData") || "{}");
    const vendorUploads = JSON.parse(localStorage.getItem("vendorUploads") || "{}");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?._id) {
      throw new Error("User not found in localStorage");
    }

    return {
      name: vendorData.businessName,
      description: vendorData.businessDescription,
      type: vendorData.businessType?.toLowerCase() === "international" ? "international" : "local",
      location: `${vendorData.city}, ${vendorData.state}`,
      country: "Nigeria",
      cacNumber: vendorData.cacNumber,
      businessWebsite: vendorData.businessWebsite,
      businessPhone: vendorData.phoneNumber,
      businessEmail: vendorData.email,
      businessAddress: vendorData.fullAddress,
      cacDocument: vendorUploads.cacDocument,
      businessLogo: vendorUploads.businessLogo,
      identityImg: vendorUploads.identityImg,
      passportPhoto: vendorUploads.passportPhoto,
      businessBanner: vendorUploads.businessBanner,
      postedBy: user._id,
    };
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      popup("Please select a plan to continue");
      return;
    }

    if (!paystackReady) {
      popup("Payment system is still loading. Please wait...");
      return;
    }

    // Get user email for Paystack
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    await openPaystackPayment({
      email: user.email || "vendor@email.com",
      amount: selectedPlan.price * 100, // ₦ price to Kobo
      businessName: "Vendor Subscription",

      onSuccess: async (transaction) => {
    try {
      const vendorPayload = buildVendorPayloadFromStorage();

      const base64ToBlob = (base64, type = "image/png") => {
        const byteString = atob(base64.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type });
      };

      const formData = new FormData();
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
      formData.append("subscription", selectedPlan?.slug || "free");
      formData.append("plan", selectedPlan?.name || "Free Plan");

      formData.append("passportPhoto", base64ToBlob(vendorPayload.passportPhoto), "passport.png");
      formData.append("identityImg", base64ToBlob(vendorPayload.identityImg), "identity.png");
      formData.append("businessLogo", base64ToBlob(vendorPayload.businessLogo), "logo.png");
      formData.append("businessBanner", base64ToBlob(vendorPayload.businessBanner), "banner.png");
      formData.append("cacDocument", base64ToBlob(vendorPayload.cacDocument), "cac.png");

      const res = await fetch("https://dealshub-server.onrender.com/api/vendors/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Vendor creation failed");

      if (user?._id) {
        const updateRes = await fetch(
          `https://dealshub-server.onrender.com/api/update-user-type/${user._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              brand: vendorPayload.name,
              plan: selectedPlan.slug,
              planCreatedAt: new Date().toISOString(),
              planExpiresAt: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            }),
          }
        );

        const updateData = await updateRes.json();
        if (!updateRes.ok) throw new Error(updateData.message || "Failed to update user");

        localStorage.setItem("user", JSON.stringify(updateData.user));
        localStorage.setItem("plan", updateData.user.plan);
      }

      localStorage.removeItem("vendorData");
      localStorage.removeItem("vendorUploads");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("❌ Error:", err);
      popup("Payment succeeded but record creation failed.");
    }
  },
    });
  };

  return (
    <div className="min-h-screen bg-white-100 py-4 px-2 sm:py-8 sm:px-4 flex justify-center items-start font-sans">
      <main className="bg-white w-full max-w-lg md:max-w-4xl lg:max-w-7xl rounded-2xl overflow-hidden pb-6 sm:pb-8">
        {/* Header Banner */}
        <div className="relative w-full h-32 sm:h-40 md:h-56 lg:h-64 bg-gray-200 overflow-hidden">
          <img src="/frame7.png" alt="Vendor Banner" className="w-full h-full object-cover object-top" />
        </div>

        <div className="px-4 sm:px-6 md:px-12 pt-6 sm:pt-8">
          <a href="/vendor/upload" className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium mb-4 transition-colors">
            <Image src="/arrowbendleft.png" alt="Back" width={16} height={16} className="mr-1" />
            <span className="text-sm">Back</span>
          </a>

          <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
              <Store className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Become a Vendor</h1>
              <p className="text-gray-500 mt-0.5 text-sm">Join Nigeria's leading deals platform</p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <div className="flex items-center justify-between bg-blue-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xs sm:text-sm font-medium w-14 sm:w-16 flex-shrink-0">Step 1/3</span>
                <span className="font-semibold text-gray-900 text-sm">Business profile</span>
              </div>
              <Image src="/blue-check.png" alt="Check" width={20} height={20} className="object-contain" />
            </div>
            <div className="flex items-center justify-between bg-blue-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xs sm:text-sm font-medium w-14 sm:w-16 flex-shrink-0">Step 2/3</span>
                <span className="font-semibold text-gray-900 text-sm">Documents Upload</span>
              </div>
              <Image src="/blue-check.png" alt="Check" width={20} height={20} className="object-contain" />
            </div>
            <div className="flex items-center justify-between py-2 mt-2 sm:mt-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-blue-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-full w-16 sm:w-auto text-center flex-shrink-0">Step 3/3</div>
                <span className="font-bold text-base sm:text-lg text-gray-900 truncate ml-2">Subscription & Plan payment</span>
              </div>
              <button className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 ml-4 flex-shrink-0">
                Skip for now <CheckCircle2 className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Dynamic Alert Box */}
          <div className={`rounded-xl p-3 sm:p-4 flex items-start gap-3 sm:gap-4 mb-8 sm:mb-10 border ${
              !selectedPlan ? "bg-red-50 border-red-200" :
              selectedPlan.name.includes("Premium") ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"
            }`}
          >
            {!selectedPlan ? (
              <>
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-0.5" />
                <div>
                  <h3 className="text-red-900 font-bold text-sm sm:text-base">You are on Free plan</h3>
                  <p className="text-red-800 text-xs sm:text-sm mt-0.5">Upgrade to a plan to post more deals and attract more sales.</p>
                </div>
              </>
            ) : (
              <>
                <img src={selectedPlan.name.includes("Premium") ? "/alert-premium.png" : "/alert-pro.png"} alt="alert" className="w-6 h-6 sm:w-7 sm:h-7 mt-0.5" />
                <div>
                  <h3 className="text-[#333333] font-bold text-sm sm:text-base">You selected: {selectedPlan.name}</h3>
                  <p className="text-[#333333] text-xs sm:text-sm mt-0.5">Price: ₦{selectedPlan.price.toLocaleString()} ({selectedPlan.duration})</p>
                </div>
              </>
            )}
          </div>

          {/* Pricing Section */}
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Upgrade via subscription plans</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">Choose your preferred subscription plan to upgrade your account</p>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {plans.map((plan) => {
                  const isPremium = plan.name.toLowerCase().includes("premium");
                  return (
                    <div
                      key={plan._id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`rounded-2xl sm:rounded-3xl overflow-hidden bg-white cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedPlan?._id === plan._id
                        ? (isPremium ? "border-orange-500 ring-4 ring-orange-100" : "border-blue-500 ring-4 ring-blue-100")
                        : (isPremium ? "border-orange-100" : "border-blue-100")
                      }`}
                    >
                      <div className="relative p-6 sm:p-8 h-32 sm:h-40 bg-no-repeat bg-contain md:bg-cover md:bg-center"
                        style={{ backgroundImage: `url(${isPremium ? "/plan-premium-bg.png" : "/plan-pro-bg.png"})` }}>
                        {isPremium && (
                          <div className="mb-4 relative z-10">
                            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full max-w-max flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Large company
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 sm:p-8 bg-white">
                        <ul className="space-y-3 sm:space-y-4">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> {feature}
                            </li>
                          ))}
                        </ul>
                        <button className={`w-full mt-6 py-2.5 rounded-xl font-semibold text-sm transition-colors block lg:hidden ${
                          isPremium ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                        }`}>
                          Subscribe to ₦{plan.price.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-100">
            <button className="flex-1 py-3 sm:py-3.5 rounded-xl border-2 border-red-200 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors text-sm">
              <XCircle className="w-5 h-5" /> Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!paystackReady || !selectedPlan}
              className="flex-1 py-3 sm:py-3.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              {selectedPlan ? `Continue with ${selectedPlan.name}` : "Please select a plan"}
            </button>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-11/12 max-w-md text-center relative">
              <img src="/welcome-confetti.png" alt="Success" className="mx-auto w-32 h-32 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Onboard!</h2>
              <p className="text-gray-600 mb-6">Vendor account created successfully! Post your first deal and start selling today.</p>
              <div className="flex flex-col items-center w-full">
                <button onClick={() => router.push("/deals/post")} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-2xl hover:bg-blue-700">
                  Post my first deal
                </button>
                <button onClick={() => router.push("/vendor")} className="mt-4 flex items-center gap-2 text-gray-800 text-sm font-medium hover:underline">
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
