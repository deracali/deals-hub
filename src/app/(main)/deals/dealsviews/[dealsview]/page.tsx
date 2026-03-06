"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  FaShoppingCart,
  FaUserPlus,
  FaStar,
  FaCheckCircle,
  FaCopy,
  FaRegClock,
} from "react-icons/fa";
import { FiTruck } from "react-icons/fi";
import { GoVerified } from "react-icons/go";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiOutlineLocationMarker } from "react-icons/hi";

import Header from "@/components/general/header";
import { usePaystackPayment } from "@/utils/usePaystackPayment";

export default function ShareABagPage() {
  const { dealsview } = useParams<{ dealsview: string }>();
  const { paystackReady, openPaystackPayment } = usePaystackPayment();

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hasSlot, setHasSlot] = useState(false);

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


  useEffect(() => {
    if (!dealsview) {
      setLoading(false);
      return;
    }

    const fetchDeal = async () => {
      try {
        const response = await fetch(`${baseURL}/group-deals/getbyid/${dealsview}`);
        if (!response.ok) throw new Error("Failed to fetch deal details");

        const data = await response.json();
        setDeal(data);

        // Check if user already has an order
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const joined = (data.orders || []).some(
            (order) => order.user?._id === user._id || order.user === user._id
          );
          setHasSlot(joined);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealsview]);

  const handleGetDealNow = async () => {
    if (!paystackReady || processing || hasSlot) return;

    try {
      setProcessing(true);
      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("User not found");
      const user = JSON.parse(storedUser);

      await openPaystackPayment({
        email: user.email,
        amount: deal.discountedPrice * 100,
        businessName: user.displayName || `${user.firstName} ${user.lastName}`,
        onSuccess: async (transaction) => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("User not found");
        const user = JSON.parse(storedUser);

        const orderResponse = await fetch(
          `${baseURL}/group-deals/${dealsview}/order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: user._id,
              quantity: 1,
              paymentReference: transaction.reference,
            }),
          }
        );

        const orderData = await orderResponse.json();

        // ✅ Always show an popup, even if backend returned an error
        if (orderResponse.ok) {
          popup(`Payment successful 🎉\n${orderData.message}\nDeal status: ${orderData.dealStatus}`);
        } else {
          popup(`Payment succeeded, but order failed ❌\n${orderData.message}`);
        }
      } catch (err: any) {
        popup(`Payment succeeded, but an error occurred while placing order ❌\n${err.message}`);
      }
    },

        onCancel: () => popup("Payment cancelled"),
      });
    } catch (err: any) {
      popup(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyLink = () => {
    const dealLink = `${window.location.origin}/deals/${dealsview}`;
    navigator.clipboard.writeText(dealLink).then(() => popup("Link copied ✅"));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading deal details...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  if (!deal) return null;

  // Compute slots
  const totalSlots = deal.moqQuantity || 0;
  const paidSlots = deal.totalOrderedQuantity || 0;
  const availableSlots = totalSlots - paidSlots;
  const progressPercent = Math.min((paidSlots / totalSlots) * 100, 100);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 md:p-8 max-w-7xl mx-auto">
      <Header />

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6 uppercase">
        Deals &nbsp; &rsaquo; &nbsp; {deal.category.replace("-", " ")} &nbsp; &rsaquo; &nbsp;{" "}
        <span className="text-gray-600">{deal.title}</span>
      </nav>

      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-12">
        <div className="relative rounded-3xl h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden bg-gray-50">
          <Image
            src={deal.images[0] || "/placeholder-image.png"}
            alt={deal.title}
            fill
            className="object-cover rounded-3xl"
          />
        </div>

        <div className="flex flex-col space-y-4">
          {/* Slots Progress */}
          <div className="mb-3">
            <div className="flex justify-between mb-1 text-xs font-bold text-gray-700">
              <span>SLOTS FILLED: {paidSlots}/{totalSlots}</span>
              <span>AVAILABLE: {availableSlots}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-3 ${progressPercent === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight">{deal.title}</h1>

          <div className="bg-[#fff4ed] p-5 rounded-2xl">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(deal.discountedPrice)}
              </span>
              <span className="text-gray-400 line-through text-sm">
                {formatCurrency(deal.originalPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {deal.discountPercentage}% OFF
              </span>
              <span className="text-xs text-slate-600 font-medium">
                You save {formatCurrency(deal.originalPrice - deal.discountedPrice)}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-1">Deal Description</h3>
            <p className="text-slate-800 font-semibold">{deal.description}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button
  onClick={handleGetDealNow}
  disabled={!paystackReady || processing} // ✅ removed hasSlot
  className={`flex-1 ${
    processing
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-[#007bff] cursor-pointer hover:bg-blue-600"
  } text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition`}
>
  {processing ? "Processing..." : "Get deal now"}
  <FaShoppingCart />
</button>


            <button
              onClick={handleCopyLink}
              className="flex-1 cursor-pointer bg-white border-2 border-[#007bff] text-[#007bff] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition"
            >
              Invite your friend <FaUserPlus />
            </button>
          </div>
        </div>
      </div>

      {/* Verification Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <div className="border border-gray-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="bg-green-100 p-2 rounded-full text-green-600">
            <GoVerified size={20} />
          </div>
          <div>
            <h4 className="font-bold text-green-600 text-sm">Community Verified</h4>
            <p className="text-xs text-gray-500">
              This deal has been confirmed by community members
            </p>
          </div>
        </div>
        <div className="border border-gray-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="bg-orange-100 p-2 rounded-full text-orange-500">
            <IoMdInformationCircleOutline size={20} />
          </div>
          <div>
            <h4 className="font-bold text-orange-500 text-sm">Affiliate Disclosure:</h4>
            <p className="text-xs text-gray-500">
              We may earn a commission when you purchase through our links.
            </p>
          </div>
        </div>
      </div>

      {/* Vendor Section */}
      <section>
        <h2 className="text-gray-400 text-sm font-bold uppercase mb-4">Vendor details</h2>
        <div className="relative">
          {/* Vendor Banner */}
          <div className="h-60 md:h-80 rounded-t-3xl overflow-hidden relative">
            <Image
              src={deal.vendor?.businessBanner || "/image 9 (1).png"}
              alt="Vendor Banner"
              fill
              className="object-cover"
            />
          </div>

          {/* Vendor Card */}
          <div className="bg-white rounded-b-3xl shadow-xl border border-gray-100 p-6 -mt-10 relative z-10 flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-start gap-6 flex-1">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden relative -mt-16 md:-mt-20">
                  <Image
                    src={deal.vendor?.businessLogo || "https://i.pravatar.cc/300"}
                    alt="Vendor"
                    fill
                    className="object-cover"
                  />
                </div>
                {deal.vendor?.isVerified && (
                  <FaCheckCircle
                    className="absolute bottom-1 right-1 text-blue-500 bg-white rounded-full"
                    size={20}
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold">{deal.vendor?.name}</h3>
                  <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span> AVAILABLE
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <HiOutlineLocationMarker /> {deal.vendor?.country}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500">
                    <FaStar /> {deal.vendor?.rating || "N/A"}{" "}
                    <span className="text-gray-300">({deal.vendor?.totalReviews || 0})</span>
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium mt-3 max-w-lg">{deal.vendor?.description}</p>
                <div className="flex gap-2 mt-4">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded flex items-center gap-1">
                    <FiTruck /> {deal.vendor?.totalDeals} ACTIVE DEALS
                  </span>
                  <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1 rounded flex items-center gap-1">
                    <FaRegClock /> RESPONSE TIME: QUICK
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor Contact Info */}
            <div className="md:w-1/3 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <div>
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Store Address</h5>
                <p className="text-xs font-bold text-slate-800">{deal.vendor?.businessAddress}</p>
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</h5>
                <p className="text-xs font-bold text-slate-800">{deal.vendor?.businessEmail}</p>
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone No.</h5>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800">{deal.vendor?.businessPhone}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(deal.vendor?.businessPhone)}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-[10px] font-bold whitespace-nowrap"
                  >
                    Copy <FaCopy />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
