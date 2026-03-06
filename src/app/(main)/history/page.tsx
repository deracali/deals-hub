"use client";

import React, { useState, useEffect } from 'react';
import Header from "@/components/general/header";
import {
  Package,
  ChevronRight,
  MapPin,
  X,
  Truck,
  ShoppingBag,
  Clock,
  CheckCircle2
} from 'lucide-react';

// --- Sub-component: Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    delivered: "bg-green-100 text-green-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    shipped: "bg-blue-100 text-blue-700",
    out_for_delivery: "bg-indigo-100 text-indigo-700",
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-orange-100 text-orange-700",
    returned: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
    default: "bg-gray-100 text-gray-600"
  };

  const currentStyle = styles[status?.toLowerCase()] || styles.default;
  const label = status?.replace(/_/g, ' ');

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${currentStyle}`}>
      {label || 'Unknown'}
    </span>
  );
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const API_URL = "https://dealshub-server.onrender.com/api/orders";

  // 1. Initial Load: Get User from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserOrders(parsedUser._id);
    } else {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Order List
  const fetchUserOrders = async (userId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/getbyuserId/${userId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Single Order for Modal
  const openOrderDetails = async (orderId: string) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);
      const res = await fetch(`${API_URL}/getbyid/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error("Error loading order details", err);
    } finally {
      setModalLoading(false);
    }
  };

  // 4. Update Shipping Status to Confirmed
  const handleConfirmShipping = async (orderId: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`${API_URL}/${orderId}/shipping-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingStatus: 'confirmed' })
      });

      if (res.ok) {
        const result = await res.json();
        // Update local states so UI reflects changes immediately
        setSelectedOrder(result.order);
        setOrders(orders.map(o => o._id === orderId ? result.order : o));
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8F9FD] min-h-screen font-sans">
      <Header />

      <main className="max-w-6xl mx-auto mt-10">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My Orders</h1>
          <p className="text-slate-500 font-medium tracking-tight">Viewing history for {user?.email}</p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-slate-300" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">No orders found</h2>
            <p className="text-slate-400 mt-2">Looks like you haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Package size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</span>
                    <h3 className="text-lg font-black text-slate-900 block">#{order._id.slice(-6).toUpperCase()}</h3>
                  </div>
                </div>

                <div className="flex flex-1 justify-around w-full md:w-auto text-center md:text-left border-x border-slate-50">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date</span>
                    <p className="text-sm font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total</span>
                    <p className="text-sm font-black text-blue-600">{order.currencySymbol || '$'}{order.grandTotal?.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Shipping</span>
                    <StatusBadge status={order.shippingStatus} />
                  </div>
                </div>

                <button
                  onClick={() => openOrderDetails(order._id)}
                  className="w-full md:w-auto px-10 py-4 bg-blue-500 text-white rounded-2xl font-black text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group"
                >
                  DETAILS <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- ORDER DETAILS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {modalLoading ? (
              <div className="p-24 flex justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <>
                <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Order Details</h2>
                    <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Transaction: {selectedOrder?._id}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-4 rounded-3xl hover:bg-white/20 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto">
                  {/* Action Section: Confirm Button */}
                  {selectedOrder?.shippingStatus === "delivered" && (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-600" size={24} />
                        <div>
                          <p className="text-emerald-900 font-black text-sm">Action Required</p>
                          <p className="text-emerald-700 text-xs font-medium">Please confirm this order to proceed with shipping.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConfirmShipping(selectedOrder._id)}
                        disabled={updating}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {updating ? "CONFIRMING..." : "CONFIRM ORDER"}
                      </button>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <section>
                      <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4">
                        <MapPin size={14} /> Shipping Destination
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                        <p className="font-black text-slate-900 text-lg">{selectedOrder?.shippingAddress?.name || 'Customer'}</p>
                        <p className="text-slate-500 text-sm mt-1 font-medium leading-relaxed">
                          {selectedOrder?.shippingAddress?.address}<br />
                          {selectedOrder?.shippingAddress?.state}, {selectedOrder?.shippingAddress?.lga}
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-200/50 text-blue-600 font-bold text-sm">
                          {selectedOrder?.shippingAddress?.phone}
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4">
                        <Clock size={14} /> Order Timeline
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Placed On</span>
                          <span className="text-xs font-black text-slate-900">{new Date(selectedOrder?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Order Status</span>
                          <StatusBadge status={selectedOrder?.status} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500">Shipping Status</span>
                          <StatusBadge status={selectedOrder?.shippingStatus} />
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="bg-blue-50/50 border border-blue-100 rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-2 text-slate-500 font-bold text-sm">
                      <span>Subtotal Items</span>
                      <span>{selectedOrder?.currencySymbol || '$'}{selectedOrder?.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-slate-500 font-bold text-sm">
                      <span>Delivery Fee</span>
                      <span>{selectedOrder?.currencySymbol || '$'}{selectedOrder?.shippingFee || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-blue-200">
                      <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Total Paid</span>
                      <span className="text-3xl font-black text-blue-600">
                        {selectedOrder?.currencySymbol || '$'}{selectedOrder?.grandTotal?.toLocaleString()}
                      </span>
                    </div>
                  </section>
                </div>

                <div className="p-10 pt-0">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all"
                  >
                    CLOSE SUMMARY
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
