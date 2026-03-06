"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { VendorHeader } from "../component/VendorHeader";
import { VendorSidebar } from "../component/sidebar";
import {
  ArrowLeft, LogOut, CheckCircle2, Star, Briefcase,
  Clock, FileText, Users, CreditCard, Bell, X,
  ChevronDown, Globe,RefreshCcw, Mail, Phone, MapPin, Edit3, Trash2, UploadCloud, Image as ImageIcon
} from 'lucide-react';

// --- Order Status Badge ---
const OrderStatusBadge = ({ status }: { status: string }) => {
  let colorClass = '';
  switch (status?.toLowerCase()) {
    case 'delivered': colorClass = 'bg-green-100 text-green-600'; break;
    case 'processing':
    case 'pending': colorClass = 'bg-orange-100 text-orange-600'; break;
    case 'shipped': colorClass = 'bg-blue-100 text-blue-600'; break;
    case 'cancelled': colorClass = 'bg-red-100 text-red-600'; break;
    default: colorClass = 'bg-gray-100 text-gray-600';
  }
  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClass}`}>
      {status || 'Unknown'}
    </span>
  );
};



// --- Shipping Status Badge ---
const ShippingStatusBadge = ({ status }: { status: string }) => {
let colorClass = '';
switch (status?.toLowerCase()) {
  case 'shipped':
    colorClass = 'bg-blue-100 text-blue-600';
    break;
  case 'pending':
    colorClass = 'bg-orange-100 text-orange-600';
    break;
  default:
    colorClass = 'bg-gray-100 text-gray-600';
}

return (
  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClass}`}>
    {status || 'Unknown'}
  </span>
);
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


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


  // 1. Get User from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- Fetch Brand Orders ---
  const fetchBrandOrders = useCallback(async (brandName: string, page = 1) => {
    try {
      setLoading(true);

      // 1. Fetch paginated orders
      const response = await fetch(
        `https://dealshub-server.onrender.com/api/orders/brand/${brandName}?page=${page}&limit=${itemsPerPage}`
      );
      const data = await response.json();
      const ordersWithUsers = await Promise.all(
        (data.orders || []).map(async (order) => {
          // Fetch customer info using the userId in the order
          const userRes = await fetch(`https://dealshub-server.onrender.com/api/users/${order.userId}`);
          const userData = await userRes.json();
          return {
            ...order,
            customerName: userData.name,
            customerEmail: userData.email,
          };
        })
      );

      setOrders(ordersWithUsers);
      setTotalCount(data.totalOrders || 0);
      setCurrentPage(data.page || 1);

    } catch (error) {
      console.error("Error fetching brand orders:", error);
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = (page: number) => {
  if (user?.brand) {
    fetchBrandOrders(user.brand, page);
  }
};

  useEffect(() => {
    if (user?.brand) {
      fetchBrandOrders(user.brand);
    }
  }, [user, fetchBrandOrders]);

  const isEmpty = !loading && orders.length === 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };



  return (
    <div className="flex h-screen w-full bg-[#FDFDFF] font-sans text-slate-900 overflow-hidden">
      {/* 1. SIDEBAR: Fixed width, hidden on mobile */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-100">
        <VendorSidebar />
      </div>

      {/* 2. MAIN CONTENT AREA: Scrollable */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 pb-24 relative bg-white">
        <VendorHeader />

        {/* Plan Info Banner */}
        <div className={`${
          user?.plan === 'premium' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
        } rounded-xl p-4 flex items-start justify-between mb-8 shadow-sm border`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-6 w-6 ${user?.plan === 'premium' ? 'text-blue-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-gray-900">
                {user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} Storefront — {user?.brand}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {user?.plan === 'premium' ?
                  "You are receiving real-time order notifications." :
                  "Upgrade to Pro to see detailed customer analytics."}
              </p>
            </div>
          </div>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-2xl font-bold flex items-center text-gray-900 mb-4 sm:mb-0">
            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Orders ({totalCount})
          </h1>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-100 text-gray-500 py-2.5 px-4 pr-10 rounded-xl text-sm focus:outline-none shadow-sm">
                <option>All Orders</option>
                <option>Last 30 Days</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl inline-flex items-center text-sm shadow-md transition-all active:scale-95">
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFF]">
        {/* The Spinner */}
        <div className="relative flex items-center justify-center">
          <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
          {/* Optional: A soft pulse effect behind the spinner */}
          <div className="absolute w-12 h-12 bg-blue-100 rounded-full animate-ping opacity-20" />
        </div>

        {/* Loading Text */}
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Loading orders
        </p>
      </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
            <p className="text-gray-400 text-sm mt-2">When customers buy your deals, they will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-50 shadow-sm">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="border-b border-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">
                    <th className="px-6 py-5">Order ID</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5">Items</th>
                    <th className="px-6 py-5">Total</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Shipping Status</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-bold text-blue-600">
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-400">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {order.itemsCount || 1} {order.itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-900 font-bold">
                        {order.currencySymbol || '$'}{order.grandTotal?.toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-5">
                        <ShippingStatusBadge status={order.shippingStatus} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-500 hover:text-blue-600 font-bold text-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-3 mt-12 mb-20">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 font-bold text-gray-400 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold ${
                    currentPage === i + 1 ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Order Details Modal */}
        {isViewModalOpen && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setIsViewModalOpen(false)}
            onShippingUpdate={(updatedOrder) => {
              setOrders((prev) =>
                prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
              );
            }}
          />
        )}
      </main>
    </div>
  );
}

// --- Order Details Modal Component ---
function OrderDetailsModal({ order, onClose, onShippingUpdate }: any) {
  const [shippingStatus, setShippingStatus] = useState(order?.shippingStatus || 'pending');
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Pending", color: "text-orange-600 bg-orange-50 border-orange-200" },
    { value: "shipped", label: "Shipped", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { value: "delivered", label: "Delivered", color: "text-green-600 bg-green-50 border-green-200" },
    { value: "returned", label: "Returned", color: "text-red-600 bg-red-50 border-red-200" },
  ];

  const currentStatusStyle = statusOptions.find(opt => opt.value === shippingStatus)?.color || "text-gray-600 bg-gray-50 border-gray-200";

  const handleShippingChange = async (newStatus: string) => {
    if (!order?._id) return;
    setUpdating(true);
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/orders/${order._id}/shipping-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingStatus: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedData = await res.json();
      setShippingStatus(updatedData.order.shippingStatus);
      if (onShippingUpdate) onShippingUpdate(updatedData.order);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100">

        {/* Header - Tightened */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Order Details</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Top Info Bar - Combined Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Order ID</p>
              <p className="font-bold text-blue-600 text-sm">#{order?._id.slice(-6).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
              <div className="relative inline-block w-full">
              <div className="relative group">
  <select
    value={shippingStatus}
    onChange={(e) => handleShippingChange(e.target.value)}
    disabled={updating}
    className={`appearance-none w-full px-3 py-1.5 pr-8 text-[11px] font-black rounded-lg border transition-all cursor-pointer outline-none ${currentStatusStyle} ${updating ? 'opacity-50' : 'hover:border-gray-400'}`}
  >
    {statusOptions.map((opt) => (
      <option key={opt.value} value={opt.value} className="bg-white text-gray-900">
        {opt.label}
      </option>
    ))}
  </select>

  {/* Custom Arrow Indicator */}
  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </div>
</div>
              </div>
            </div>
          </div>

          {/* Customer & Address - Merged */}
          <div className="bg-white border border-gray-100 p-4 rounded-2xl">
            <div className="flex justify-between mb-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
              <OrderStatusBadge status={order?.status} />
            </div>
            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{order?.shippingAddress?.name || order?.customerName}</p>
            <p className="text-xs text-gray-500 mb-2">{order?.customerEmail}</p>

            {order?.shippingAddress && (
              <div className="text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-50 leading-tight">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.lga}, {order.shippingAddress.state}</p>
                <p className="mt-1 font-bold text-blue-500">{order.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Total Section - Slimmer */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold uppercase opacity-50 tracking-[0.1em]">Total Amount</p>
              <p className="text-xl font-black text-blue-400">
                {order?.currencySymbol || '$'}{order?.grandTotal?.toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
