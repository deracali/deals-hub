"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  ArrowLeft,
  Copy,
  Ban,
  ShieldCheck,
  Check,
  Clock,
  MapPin,
  Truck,
  Unlock,
  Store,
  CreditCard
} from "lucide-react";

// --- Types based on your Schema ---
interface User {
  _id: string;
  name?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  photo?: string;
  avatar?: string;
  phone?: string;
  phoneNumbers?: string[];
  address?: string;
  status?: "active" | "suspended" | "blocked";
  role?: string;
  createdAt?: string;
}

interface Vendor {
  _id: string;
  name: string;
  businessLogo?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
  categories?: string[];
  rating?: number;
  isVerified?: boolean;
  subscription?: string;
  status?: string;
  location?: string;
}

interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  totalPrice: number;
  images: string[];
  size?: string;
  color?: string;
}

interface TrackingStep {
  status: string;
  timestamp: string;
  description?: string;
  isCompleted: boolean;
}

interface Order {
  _id: string;
  items: OrderItem[];
  grandTotal: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  shippingStatus: "pending" | "confirmed" | "shipped" | "out_for_delivery" | "delivered" | "returned"; // Updated Enum
  trackingHistory: TrackingStep[]; // New field
  createdAt: string;
  shippingAddress: {
    address: string;
    state: string;
    city?: string;
  };
  paymentReference?: string;
}

// The composite object returned by your API
interface UserDetailsData {
  user: User;
  vendor?: Vendor | null;
  orders?: Order[];
}

interface UserDetailModalProps {
  data: UserDetailsData | null; // Allow null here
  onClose: () => void;
  onStatusChange: (
    userId: string,
    status: "active" | "suspended" | "blocked"
  ) => void;
}

export function UserDetailModal({
  data,
  onClose,
  onStatusChange,
}: UserDetailModalProps) {

  // --- FIX: Safety Check ---
  // If data hasn't loaded yet, return null (or a spinner) so the app doesn't crash
  if (!data || !data.user) {
    return null;
  }

  const getProgressWidth = (status: string) => {
    const steps: Record<string, string> = {
      pending: "5%",
      confirmed: "25%",
      shipped: "50%",
      out_for_delivery: "75%",
      delivered: "100%",
      returned: "100%",
      cancelled: "0%",
    };
    return steps[status] || "0%";
  };

  // Now it is safe to destructure
  const { user, vendor, orders = [] } = data;

  const [activeTab, setActiveTab] = useState<"ongoing" | "canceled">("ongoing");

  // Determine which order to show in the right panel
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Status Management
  const [status, setStatus] = useState<"active" | "suspended" | "blocked">(
    user.status || "active"
  );

  const isBlocked = status === "blocked";
  const isSuspended = status === "suspended";

  // Action Modals State
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showBlockSuccess, setShowBlockSuccess] = useState(false);
  const [blockComment, setBlockComment] = useState("");

  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [showUnblockSuccess, setShowUnblockSuccess] = useState(false);

  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showSuspendSuccess, setShowSuspendSuccess] = useState(false);

  const [showUnsuspendConfirm, setShowUnsuspendConfirm] = useState(false);
  const [showUnsuspendSuccess, setShowUnsuspendSuccess] = useState(false);

  // --- Filtering Orders ---
  const ongoingOrders = useMemo(() => {
    return orders.filter(o => ["pending", "paid"].includes(o.status) || o.shippingStatus === "shipped");
  }, [orders]);

  const canceledOrders = useMemo(() => {
    return orders.filter(o => ["cancelled", "refunded"].includes(o.status));
  }, [orders]);

  const currentList = activeTab === "ongoing" ? ongoingOrders : canceledOrders;

  // Set default selected order when tab or list changes
  useEffect(() => {
    if (currentList.length > 0) {
      // If the currently selected ID isn't in the new list, select the first one
      if (!currentList.find(o => o._id === selectedOrderId)) {
        setSelectedOrderId(currentList[0]._id);
      }
    } else {
      setSelectedOrderId(null);
    }
  }, [activeTab, currentList, selectedOrderId]);

  // Get the full object of the selected order
  const selectedOrder = orders.find(o => o._id === selectedOrderId);

  // --- API Calls ---
  const updateStatus = async (newStatus: "active" | "suspended" | "blocked") => {
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/users/${user._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed");

      onStatusChange(user._id, newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const openBlockConfirm = () => {
    setBlockComment("");
    setShowBlockConfirm(true);
  };

  const confirmBlock = async () => {
    await updateStatus("blocked");
    setShowBlockConfirm(false);
    setShowBlockSuccess(true);
  };

  const confirmUnblock = async () => {
    await updateStatus("active");
    setShowUnblockConfirm(false);
    setShowUnblockSuccess(true);
  };

  const confirmSuspend = async () => {
    await updateStatus("suspended");
    setShowSuspendConfirm(false);
    setShowSuspendSuccess(true);
  };

  const confirmUnsuspend = async () => {
    await updateStatus("active");
    setShowUnsuspendConfirm(false);
    setShowUnsuspendSuccess(true);
  };

  // Auto-close success modals
  useEffect(() => {
    if (showBlockSuccess || showUnblockSuccess || showSuspendSuccess || showUnsuspendSuccess) {
      const t = setTimeout(() => {
        setShowBlockSuccess(false);
        setShowUnblockSuccess(false);
        setShowSuspendSuccess(false);
        setShowUnsuspendSuccess(false);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [showBlockSuccess, showUnblockSuccess, showSuspendSuccess, showUnsuspendSuccess]);

  // --- Helper Data ---
  // If user is a vendor, prefer vendor details
  const displayImage = vendor?.businessLogo || user.avatar || user.photo || "https://avatar.vercel.sh/slyce-large";
  const displayName = vendor?.name || user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || "Slyce User";

  // Safe access for address
  const orderAddress = selectedOrder?.shippingAddress?.address || "";
  const displayAddress = vendor?.businessAddress || user.address || (orderAddress ? orderAddress : "No address provided");

  const displayEmail = vendor?.businessEmail || user.email || "No email";
  const displayPhone = vendor?.businessPhone || user.phone || (user.phoneNumbers && user.phoneNumbers[0]) || "No phone";

  const isVendor = !!vendor;

  return (
    <>
      {/* Base modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
        <div className="bg-white w-full max-w-[1100px] h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
            <button onClick={onClose} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={18} /> Back
            </button>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

            {/* Top: Profile Section */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 transition-opacity duration-300 ${isBlocked ? "opacity-60" : "opacity-100"}`}>
              <div className="flex-shrink-0 min-w-[200px]">
                <div className="relative w-24 h-24 mb-4">
                  <div className={`w-full h-full rounded-full overflow-hidden border-4 border-gray-50 bg-gray-100 transition-all ${isBlocked ? "grayscale" : ""}`}>
                    <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {!isBlocked && (vendor?.isVerified) && (
                    <div className="absolute bottom-1 right-1 bg-[#007AFF] text-white p-1 rounded-full border-2 border-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h2 className="text-2xl font-black text-gray-900 leading-tight flex items-center gap-2">
                      {displayName}
                      {isBlocked && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase tracking-tighter">Blocked</span>}
                    </h2>

                    {isVendor ? (
                      <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100 flex items-center gap-1">
                        <Store size={10} /> Vendor
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                        <ShieldCheck size={10} /> User
                      </span>
                    )}

                    {vendor?.rating !== undefined && vendor.rating > 0 && (
                       <span className="text-[11px] text-gray-400 font-medium">• {vendor.rating} Rating</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                    <MapPin size={12} />
                    <span className="text-[11px] font-medium">{vendor?.location || displayAddress.substring(0, 30)}</span>
                  </div>
                </div>

                {/* Categories / Tags */}
                <div className="flex flex-wrap gap-2">
                  {vendor?.categories && vendor.categories.length > 0 ? (
                    vendor.categories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600">{cat}</span>
                    ))
                  ) : (
                    <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600">General Shopper</span>
                  )}
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="flex-1 grid grid-cols-1 gap-8 bg-white p-6 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Address</p>
                  <p className="text-[13px] font-bold text-gray-800 leading-relaxed max-w-xs">{displayAddress}</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</p>
                    <p className="text-[13px] font-bold text-gray-800 flex items-center gap-2">
                      {displayEmail}
                      <Copy size={12} className="text-gray-400 cursor-pointer hover:text-blue-500"
                        onClick={() => { try { navigator.clipboard.writeText(displayEmail); } catch {} }} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone No.</p>
                    <p className="text-[13px] font-bold text-gray-800">{displayPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 border-b border-gray-100 pb-12">
              {!isSuspended ? (
                <button onClick={() => setShowSuspendConfirm(true)} className="flex-1 bg-[#007AFF] text-white py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 border border-blue-200 hover:bg-blue-600 transition-all">
                  <Ban size={16} /> Suspend User
                </button>
              ) : (
                <button onClick={() => setShowUnsuspendConfirm(true)} className="flex-1 bg-blue-500 text-white py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
                  <Unlock size={16} /> Unsuspend User
                </button>
              )}

              {!isBlocked ? (
                <button onClick={openBlockConfirm} className="flex-1 bg-white border border-red-200 text-red-500 py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all">
                  <X size={16} /> Block User
                </button>
              ) : (
                <button onClick={() => setShowUnblockConfirm(true)} className="flex-1 bg-green-500 text-white py-3.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition-all">
                  <Unlock size={16} /> Unblock User
                </button>
              )}
            </div>

            {/* Bottom: Orders */}
            <div className="flex flex-col lg:flex-row gap-8 items-start h-full min-h-[400px]">

              {/* Left: Order List */}
              <div className="w-full lg:w-[380px] flex-shrink-0">
                <div className="flex items-center gap-6 border-b border-gray-100 mb-4">
                  <button onClick={() => setActiveTab("ongoing")} className={`pb-3 text-[12px] font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "ongoing" ? "border-[#F97316] text-gray-900" : "border-transparent text-gray-400"}`}>
                    Ongoing/Delivered <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === "ongoing" ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"}`}>{ongoingOrders.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("canceled")} className={`pb-3 text-[12px] font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "canceled" ? "border-[#F97316] text-gray-900" : "border-transparent text-gray-400"}`}>
                    Canceled/Returned <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === "canceled" ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"}`}>{canceledOrders.length}</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {currentList.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">No orders found in this category.</div>
                  )}
                  {currentList.map((order) => {
                    const firstItem = order.items[0];
                    const isActive = selectedOrderId === order._id;
                    return (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrderId(order._id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-4 ${isActive ? "bg-white border-orange-200 shadow-md ring-1 ring-orange-50" : "bg-white border-gray-100 hover:border-blue-100"}`}
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden border border-gray-100 p-1">
                          <img
                            src={firstItem?.images[0] || "https://avatar.vercel.sh/product"}
                            alt="Product"
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                            {firstItem ? firstItem.title : "Unknown Order"}
                            {order.items.length > 1 && <span className="text-gray-400 ml-1">+{order.items.length - 1} more</span>}
                          </h4>
                          <p className="text-[10px] text-gray-400 mb-2">Order No. {order._id.slice(-8).toUpperCase()}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {order.shippingStatus === 'shipped' ? 'Shipped' : order.status}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Order Details */}
              <div className="flex-1 w-full bg-gray-50/50 rounded-2xl p-6 border border-gray-100 h-full">
                {selectedOrder ? (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className={`inline-block text-white text-[10px] font-bold px-2.5 py-1 rounded mb-2 capitalize ${selectedOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-[#F97316]'}`}>
                          {selectedOrder.status}
                        </span>
                        <h3 className="text-xl font-black text-gray-900">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-gray-400">{selectedOrder.items.length} items</p>
                        <p className="text-[11px] text-gray-400">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                        <p className="text-lg font-black text-gray-900 mt-1">Total: ₦ {selectedOrder.grandTotal.toLocaleString()}</p>
                      </div>
                    </div>



                    {/* INTEGRATED: Dynamic Package Tracking Timeline */}
    <div className="bg-white p-6 rounded-xl border border-gray-100 mb-6 shadow-sm">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
        Package Tracking
      </h4>

      <div className="flex items-center justify-between relative px-2">
        {/* Gray Background Line */}
        <div className="absolute top-3 left-0 w-full h-[2px] bg-gray-100 z-0"></div>

        {/* Dynamic Green Progress Line */}
        <div
          className="absolute top-3 left-0 h-[2px] bg-[#10B981] transition-all duration-700 ease-in-out z-0"
          style={{ width: getProgressWidth(selectedOrder.shippingStatus) }}
        ></div>

        {/* Map through the actual tracking history from DB */}
        {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 ? (
          selectedOrder.trackingHistory.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center px-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                step.isCompleted
                  ? "bg-[#10B981] border-[#10B981] text-white"
                  : "bg-white border-gray-200 text-gray-400"
              }`}>
                {step.isCompleted ? (
                  <Check size={12} strokeWidth={4} />
                ) : (
                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                )}
              </div>

              <p className={`text-[9px] font-bold mt-2 max-w-[80px] leading-tight ${
                step.isCompleted ? "text-gray-800" : "text-gray-400"
              }`}>
                {step.status}
              </p>

              <p className="text-[8px] text-gray-400 mt-0.5">
                {new Date(step.timestamp).toLocaleDateString(undefined, {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          ))
        ) : (
          <div className="w-full text-center text-[10px] text-gray-400 py-2">
            Initializing tracking data...
          </div>
        )}
      </div>
    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 mb-6 shadow-sm">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Package Status</h4>
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedOrder.shippingStatus === 'shipped' || selectedOrder.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Check size={16} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-gray-800 uppercase">{selectedOrder.shippingStatus === 'shipped' ? 'Shipped' : selectedOrder.status}</p>
                            <p className="text-[10px] text-gray-400">Current status</p>
                         </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Items in your order</h4>
                    <div className="space-y-4 mb-6">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 flex gap-5 relative shadow-sm">
                          <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 p-2 border border-gray-50">
                            <img src={item.images[0] || "https://avatar.vercel.sh/item"} alt="Product" className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[14px] font-black text-gray-900 leading-snug pr-2">{item.title}</h4>
                            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase">QTY: {item.quantity}</p>
                            <p className="text-xl font-black text-gray-900 mt-2">₦ {item.totalPrice.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Info */}
                    <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-5 rounded-2xl flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-full bg-[#16A34A] flex items-center justify-center text-white shadow-lg shadow-green-100">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-800">Payment Reference</p>
                        <p className="text-[12px] text-gray-600 font-medium">{selectedOrder.paymentReference || "N/A"}</p>

                        <p className="text-[12px] text-gray-600 font-medium italic flex items-center gap-2">
      Order payment was made through
      <img
        src="/paystack.png"
        alt="Paystack"
        className="h-4 w-auto not-italic"
      />
      </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                      <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Truck size={14} /> Delivery Status
                        </h4>
                        <p className="text-[13px] font-bold text-gray-800 capitalize">{selectedOrder.shippingStatus}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <MapPin size={14} /> Shipping Address
                        </h4>
                        <p className="text-[13px] font-bold text-gray-800 leading-relaxed max-w-xs">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.state}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Clock size={32} className="opacity-50" />
                     </div>
                     <p className="text-sm font-bold">Select an order to view details</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- Confirmation Modals --- */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" role="dialog">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBlockConfirm(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <X size={48} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Block User?</h3>
              <p className="text-sm text-gray-500 text-center">Are you sure you want to block this user?</p>
              <textarea
                value={blockComment}
                onChange={(e) => setBlockComment(e.target.value)}
                placeholder="Reason for blocking..."
                className="w-full mt-2 p-3 border border-gray-100 rounded-lg text-sm text-gray-700 placeholder-gray-300 focus:ring-0"
                rows={4}
              />
              <div className="flex gap-3 w-full mt-3">
                <button onClick={confirmBlock} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm">Yes, Block</button>
                <button onClick={() => setShowBlockConfirm(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBlockSuccess && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl z-10 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full mx-auto flex items-center justify-center mb-4"><X size={48} className="text-red-600" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">User Blocked!</h3>
          </div>
        </div>
      )}

      {showSuspendConfirm && (
        <div className="fixed inset-0 z-[240] flex items-center justify-center">
           <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuspendConfirm(false)} />
           <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl z-10 text-center">
             <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4"><Ban size={48} className="text-blue-600" /></div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Suspend User?</h3>
             <button onClick={confirmSuspend} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm mb-4">Yes, Suspend</button>
             <button onClick={() => setShowSuspendConfirm(false)} className="text-sm font-bold text-blue-600">Cancel</button>
           </div>
        </div>
      )}

      {showSuspendSuccess && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl z-10 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4"><ShieldCheck size={48} className="text-blue-600" /></div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">User Suspended!</h3>
          </div>
        </div>
      )}

      {showUnblockConfirm && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUnblockConfirm(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl z-10 text-center">
             <div className="w-20 h-20 bg-red-50 rounded-full mx-auto flex items-center justify-center mb-4"><X size={48} className="text-red-600" /></div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Unblock User?</h3>
             <button onClick={confirmUnblock} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-sm mb-4">Yes, Unblock</button>
             <button onClick={() => setShowUnblockConfirm(false)} className="text-sm font-bold text-blue-600">Cancel</button>
          </div>
        </div>
      )}

      {showUnblockSuccess && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl z-10 text-center">
             <div className="w-20 h-20 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-4"><ShieldCheck size={48} className="text-green-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">User Unblocked!</h3>
          </div>
        </div>
      )}

      {showUnsuspendConfirm && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUnsuspendConfirm(false)} />
          <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl z-10 text-center">
             <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4"><Unlock size={48} className="text-blue-600" /></div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Unsuspend User?</h3>
             <button onClick={confirmUnsuspend} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold text-sm mb-4">Yes, Unsuspend</button>
             <button onClick={() => setShowUnsuspendConfirm(false)} className="text-sm font-bold text-blue-600">Cancel</button>
          </div>
        </div>
      )}

      {showUnsuspendSuccess && (
        <div className="fixed inset-0 z-[270] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl z-10 text-center">
             <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4"><ShieldCheck size={48} className="text-blue-600" /></div>
             <h3 className="text-2xl font-bold text-gray-900 mb-2">User Unsuspended!</h3>
          </div>
        </div>
      )}
    </>
  );
}
