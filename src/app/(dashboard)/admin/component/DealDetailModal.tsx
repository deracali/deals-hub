"use client";

import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, Globe, Copy, Check,
  MapPin, Star, Clock, ShoppingBag
} from 'lucide-react';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
  onStatusChange: (dealId: string, status: string) => void;
}

export const DealDetailModal = ({
  isOpen,
  onClose,
  deal,
  onStatusChange,
}: DealModalProps) => {
  const [view, setView] = useState<'details' | 'confirm-accept' | 'confirm-reject' | 'success-reject'>('details');
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const [brandDetails, setBrandDetails] = useState<any>(null);
  const dealId = deal?.id ?? deal?._id;

  const baseURL = "https://dealshub-server.onrender.com/api"; // Adjust to your actual base URL


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
    if (isOpen && deal?.brand) {
      setView("details");
      setRejectReason("");
      setError(null);

      // Fetch Brand/Vendor Details
      const fetchBrand = async () => {
        try {
          const res = await fetch(
            `${baseURL}/vendors/name/${encodeURIComponent(deal.brand)}`
          );
          const data = await res.json();

          // data?.vendor based on your snippet
          setBrandDetails(data?.vendor || null);
        } catch (err) {
          console.error("Error fetching brand details:", err);
          setBrandDetails(null);
        }
      };

      fetchBrand();
    }
  }, [isOpen, deal?.brand, dealId]);

  if (!isOpen || !deal) return null;

  // Formatting helpers
  const savings = (deal.originalPrice - deal.discountedPrice).toFixed(2);
  const displayPrice = deal.discountedPrice?.toLocaleString();
  const displayOriginal = deal.originalPrice?.toLocaleString();

  const handleApproveDeal = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/deals/${dealId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to approve deal");
      onStatusChange(dealId, "active");
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDeal = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/deals/${dealId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error("Failed to reject deal");
      onStatusChange(dealId, "rejected");
      setView("success-reject");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[32px] overflow-y-auto relative shadow-2xl">
          <div className="sticky top-0 bg-white z-20 p-6 border-b border-gray-50 flex items-center">
            <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black text-gray-900 uppercase tracking-wider">
              <ChevronLeft size={16} /> Back
            </button>
          </div>

          {error && (
            <div className="mx-8 mt-4 bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Product Visuals */}
              <div className="relative aspect-square rounded-[32px] flex items-center justify-center p-12 overflow-hidden shadow-inner">
                <img
                  src={deal.images?.[1] || "/api/placeholder/400/400"}
                  alt={deal.title}
                  className="object-contain drop-shadow-2xl scale-110"
                />
              </div>

              {/* Product Info Section */}
              <div className="space-y-6">
                <span className="bg-[#FFF5E9] text-[#FF9500] text-[10px] font-black uppercase px-4 py-1.5 rounded-lg inline-block">
                  {deal.status === 'active' ? 'Verified & Active' : 'Pending verification'}
                </span>

                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#007AFF] text-white text-[10px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-blue-100">
                    <Globe size={14} /> {deal.platform || 'Global Deal'}
                  </span>
                  <span className="bg-[#FF9500] text-white text-[10px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm shadow-orange-100">
                    <ShoppingBag size={14} /> {parseFloat(deal.shippingCost) === 0 ? 'Free Delivery' : `Shipping: ${deal.currencySymbol}${deal.shippingCost}`}
                  </span>
                </div>

                <h2 className="text-4xl font-black text-gray-900 leading-[1.1]">{deal.title}</h2>

                <div className="bg-[#FFF5E9] p-6 rounded-[28px]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                        {deal.currencySymbol} {displayPrice}
                    </span>
                    <span className="text-sm text-gray-400 line-through font-bold">
                        {deal.currencySymbol} {displayOriginal}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                        -{Math.round(deal.discountPercentage)}% OFF
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 italic">You save {deal.currencySymbol}{savings}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Deal Description</h4>
                  <p className="text-[13px] font-bold text-gray-400 leading-relaxed">
                    {deal.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[#007AFF] text-[11px] font-black uppercase">
                      <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center"><Globe size={12} /></div>
                      Category: {deal.category}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
    {/* Small Brand Avatar */}
    <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-50">
      {brandDetails?.businessLogo ? (
        <img
          src={brandDetails.businessLogo}
          alt={deal.brand}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/avatar.png";
          }}
        />
      ) : (
        <span className="text-[8px] font-black text-gray-400">
          {deal.brand?.charAt(0)}
        </span>
      )}
    </div>

    {/* Attribution Text */}
    <div>
      Added {new Date(deal.createdAt).toLocaleDateString()}
      <span className="text-gray-300 ml-1">by {brandDetails?.name || deal.brand}</span>
    </div>
  </div>
                  </div>
                </div>

                {deal.colors?.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Available colors</h4>
                        <div className="flex gap-3">
                            {deal.colors.map((color: string, i: number) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                )}

                {deal.sizes?.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Available sizes</h4>
                        <div className="flex gap-4">
                            {deal.sizes.map((size: string) => (
                                <span key={size} className="text-[11px] font-bold text-gray-900">{size}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setView('confirm-accept')} className="flex-1 bg-[#34C759] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-transform active:scale-95">
                    <Check size={18} strokeWidth={4} /> Accept deal
                  </button>
                  <button onClick={() => setView('confirm-reject')} className="flex-1 bg-white border-2 border-[#FF3B30] text-[#FF3B30] py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors active:scale-95">
                    <X size={18} strokeWidth={4} /> Reject deal
                  </button>
                </div>
              </div>
            </div>

            {/* Vendor Details Section - Populated by Deal.brand */}
            <div className="space-y-4">
    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Vendor details</h4>
    <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm relative">
      <div className="h-32 bg-[#FFD700] w-full" />
      <div className="px-10 pb-10">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end -mt-12 gap-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              {/* Logo Container */}
              <div className="w-28 h-28 rounded-full border-[6px] border-white overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                {brandDetails?.businessLogo ? (
                  <img
                    src={brandDetails.businessLogo}
                    alt={brandDetails.name || deal.brand}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.png";
                    }}
                  />
                ) : (
                  <span className="text-4xl font-black text-gray-300">
                    {deal.brand?.charAt(0)}
                  </span>
                )}
              </div>

              <div className="absolute bottom-2 right-1 bg-blue-500 rounded-full p-1 border-2 border-white">
                <Check size={12} className="text-white" strokeWidth={4} />
              </div>
            </div>

            <div className="pt-14 md:pt-12">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {brandDetails?.name || deal.brand}
                </h3>
                <span className="bg-[#E7F9ED] text-[#34C759] text-[9px] font-black uppercase px-3 py-1 rounded-full">
                  Verified Vendor
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase mt-2 tracking-wide">
                <MapPin size={12} /> {brandDetails?.country || 'Location N/A'} •
                <Star size={12} className="fill-orange-400 text-orange-400" />
                {brandDetails?.rating || '5.0'}
                <span className="lowercase font-bold">({brandDetails?.reviewsCount || 0} reviews)</span>
              </div>
            </div>
          </div>

          <button
      onClick={() => {
        const phone = brandDetails?.phoneNumber || "+234 800 000 0000";
        navigator.clipboard.writeText(phone);
        popup("Contact info copied!"); // <-- replaced alert with popup
      }}
      className="bg-[#34C759] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-green-100 active:scale-95 transition-transform"
    >
      Copy contact info <Copy size={16} />
    </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10 pt-8 border-t border-gray-50">
          <div className="space-y-6">
            <p className="text-[13px] font-bold text-gray-500 leading-relaxed max-w-md">
              {brandDetails?.description || `${deal.brand} specializes in providing quality products across the ${deal.category} category.`}
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[#007AFF] bg-blue-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">
                <ShoppingBag size={14} /> Official {deal.platform} Store
              </div>
              <div className="flex items-center gap-2 text-[#FF9500] bg-orange-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase">
                <Clock size={14} /> Listed: {new Date(deal.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Address</span>
              <p className="text-[12px] font-bold text-gray-900">{brandDetails?.location || "No physical address provided"}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</span>
              <p className="text-[12px] font-bold text-gray-900">{brandDetails?.businessEmail || "support@vendor.com"}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone No.</span>
              <p className="text-[12px] font-bold text-gray-900">{brandDetails?.businessPhone || "Contact not available"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
          </div>
        </div>
      </div>

      {/* Accept Step Overlay */}
      {view === 'confirm-accept' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#34C759] rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-100">
              <Check size={36} strokeWidth={4} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Accept deal!</h3>
            <p className="text-sm font-bold text-gray-400 mb-10">Are you sure you want to proceed to accept this deal from {deal.brand}?</p>
            <button
              onClick={handleApproveDeal}
              disabled={loading}
              className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest mb-4 shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Yes, Accept deal"}
            </button>
            <button onClick={() => setView('details')} className="w-full text-[#007AFF] font-black text-xs uppercase tracking-widest">No, Go back</button>
          </div>
        </div>
      )}

      {/* Reject Step Overlay */}
      {view === 'confirm-reject' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <X size={44} strokeWidth={4} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Deal?</h3>
            <p className="text-[13px] font-bold text-gray-400 mb-8 px-6">The vendor ({deal.brand}) will be notified via email.</p>
            <div className="text-left mb-8 space-y-3">
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Drop a comment, if any</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-[24px] p-6 text-[13px] font-bold h-36 outline-none focus:ring-4 focus:ring-red-50 transition-all placeholder:text-gray-300"
                placeholder="Share your thought on why you reject this application"
              />
            </div>
            <div className="space-y-4">
              <button
                onClick={handleRejectDeal}
                disabled={loading}
                className="w-full bg-[#FF3B30] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {loading ? "Rejecting..." : "Yes, Reject deal"}
              </button>
              <button onClick={() => setView('details')} className="w-full text-[#007AFF] font-black text-xs uppercase tracking-widest">No, Go back</button>
            </div>
          </div>
        </div>
      )}

      {/* Final Rejection Success Overlay */}
      {view === 'success-reject' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-md rounded-[40px] p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-white border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8 relative">
                <X size={48} strokeWidth={5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Deal rejected!</h3>
            <p className="text-[13px] font-bold text-gray-400 mb-10 tracking-tight">You rejected the deal for {deal.title}.</p>
            <button onClick={onClose} className="text-[#007AFF] font-black text-[11px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Close Panel</button>
          </div>
        </div>
      )}
    </>
  );
};
