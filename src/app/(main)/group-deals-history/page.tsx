"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/general/header";
import {
  ShoppingBag,
  Users,
  Timer,
  Package,
  CheckCircle2,
  ArrowUpRight,
  X,
} from "lucide-react";

/* =============================
   STATUS BADGE
============================= */
const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    active: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    fulfilled: "bg-blue-100 text-blue-700 border border-blue-200",
    expired: "bg-red-100 text-red-700 border border-red-200",
    default: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
        styles[status?.toLowerCase()] || styles.default
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default function GroupDealsHistory() {
  const [deals, setDeals] = useState<any[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "completed" | "expired"
  >("all");
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  /* =============================
     FETCH USER DEALS
  ============================= */
  useEffect(() => {
    const fetchMyDeals = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) return;

        const res = await fetch(
          `https://dealshub-server.onrender.com/api/group-deals/user/${user._id}`
        );

        const data = await res.json();

        const dealsWithMyOrder = data.deals.map((deal: any) => {
          const myOrder = deal.orders?.find(
            (o: any) =>
              o.user === user._id || o.user?._id === user._id
          );

          return { ...deal, myOrder };
        });

        setDeals(dealsWithMyOrder);
      } catch (err) {
        console.error("Error fetching group deals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyDeals();
  }, []);

  /* =============================
     FILTER LOGIC
  ============================= */
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredDeals(deals);
    } else {
      setFilteredDeals(
        deals.filter(
          (deal) => deal.status?.toLowerCase() === activeTab
        )
      );
    }
  }, [activeTab, deals]);

  /* =============================
     SUMMARY CALCULATIONS
  ============================= */
  const totalSpent = deals.reduce(
    (sum, deal) => sum + (deal.myOrder?.totalAmount || 0),
    0
  );

  const totalUnits = deals.reduce(
    (sum, deal) => sum + (deal.myOrder?.quantity || 0),
    0
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F9FAFF] pb-20">
      <Header />

      {/* FILTER TABS */}
      <div className="flex max-w-6xl mx-auto gap-3 mt-6 px-6">
        {["all", "active", "completed", "expired"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Group Deals
            </h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <Users size={18} className="text-indigo-500" />
              Track your collective purchase progress.
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Total Spent
            </p>
            <p className="text-2xl font-black text-indigo-600">
              ₦{totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Units Purchased
            </p>
            <p className="text-2xl font-black text-slate-900">
              {totalUnits}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Deals Joined
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {deals.length}
            </p>
          </div>
        </div>

        {/* DEAL LIST */}
        <div className="grid gap-6">
          {filteredDeals.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">
                No group deals found.
              </p>
            </div>
          ) : (
            filteredDeals.map((deal) => {
              const progress = Math.min(
                (deal.totalOrderedQuantity / deal.moqQuantity) * 100,
                100
              );

              return (
                <div
                  key={deal._id}
                  className="bg-white rounded-[2.5rem] border shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-48 h-48 bg-slate-100">
                      <img
                        src={deal.images?.[0]}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-8">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs font-black text-indigo-500 uppercase">
                            {deal.vendorName}
                          </p>
                          <h3 className="text-2xl font-black">
                            {deal.title}
                          </h3>
                        </div>
                        <StatusBadge status={deal.status} />
                      </div>

                      <div className="bg-slate-50 p-6 rounded-3xl border">
                        <div className="flex justify-between mb-3">
                          <span className="text-xs font-bold">
                            {deal.totalOrderedQuantity} / {deal.moqQuantity} Units
                          </span>
                          <span className="text-xs font-black text-indigo-600">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <Timer size={14} />
                           <span className="text-xs font-bold">Expires: {new Date(deal.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                           <Package size={14} />
                           <span className="text-xs font-bold">{deal.deliveryEstimate}</span>
                        </div>
                      </div>

                        <button
                          onClick={() => setSelectedDeal(deal)}
                          className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black"
                        >
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL */}
      {selectedDeal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="bg-white w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-[2rem] shadow-2xl">

          {/* HEADER */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase">
                {selectedDeal.vendorName}
              </p>
              <h2 className="text-xl font-black text-slate-900">
                {selectedDeal.title}
              </h2>
            </div>

            <button
              onClick={() => setSelectedDeal(null)}
              className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-4">

            {/* IMAGE (smaller) */}
            <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedDeal.images?.[0]}
                alt={selectedDeal.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* CONTRIBUTION */}
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">
                Your Contribution
              </p>

              <p className="font-black text-slate-900">
                {selectedDeal.myOrder?.quantity || 0} Units • ₦
                {selectedDeal.myOrder?.totalAmount?.toLocaleString() || 0}
              </p>
            </div>

            {/* PROGRESS */}
            <div className="bg-slate-50 p-4 rounded-2xl border">
              <div className="flex justify-between text-[11px] font-bold mb-2">
                <span>
                  {selectedDeal.totalOrderedQuantity} / {selectedDeal.moqQuantity}
                </span>
                <span className="text-indigo-600">
                  {Math.round(
                    (selectedDeal.totalOrderedQuantity /
                      selectedDeal.moqQuantity) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{
                    width: `${Math.min(
                      (selectedDeal.totalOrderedQuantity /
                        selectedDeal.moqQuantity) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* SHIPPING + SAVINGS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                  Shipping
                </p>
                <p className="text-sm font-bold capitalize">
                  {selectedDeal.shippingType}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                  Savings
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {selectedDeal.discountPercentage}% Off
                </p>
              </div>
            </div>

            {/* PAYMENT STATUS */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl">
              <p className="text-[10px] opacity-60 mb-1">Payment Status</p>
              <p className="text-lg font-black uppercase">
                {selectedDeal.myOrder?.paymentStatus || "Unknown"}
              </p>
            </div>

            {/* EXPIRY */}
            <div className="text-[11px] text-slate-500">
              Expires: {new Date(selectedDeal.expiresAt).toLocaleDateString()}
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 pt-0">
            <button
              onClick={() => setSelectedDeal(null)}
              className="w-full py-3 bg-slate-100 font-black text-xs uppercase rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
