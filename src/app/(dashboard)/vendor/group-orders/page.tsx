"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { VendorHeader } from "../component/VendorHeader";
import { VendorSidebar } from "../component/sidebar";
import {
RefreshCcw, Package
} from 'lucide-react';


// --- Group Deal Status Badge ---
const DealStatusBadge = ({ status, total, moq }: { status: string, total: number, moq: number }) => {
  let colorClass = 'bg-gray-100 text-gray-600';
  let label = status;

  if (total >= moq) {
    colorClass = 'bg-green-100 text-green-700';
    label = 'Target Met';
  } else if (status === 'active') {
    colorClass = 'bg-blue-100 text-blue-600';
    label = 'Active';
  } else if (status === 'expired') {
    colorClass = 'bg-red-100 text-red-600';
    label = 'Expired';
  }

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClass}`}>
      {label}
    </span>
  );
};

export default function GroupOrdersPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [user, setUser] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchVendorDeals = useCallback(async (brand: string, page = 1) => {
    try {
      setLoading(true);
      // Using your provided endpoint structure
      const response = await fetch(
  `https://dealshub-server.onrender.com/api/group-deals/brand/${brand}?page=${page}&limit=${itemsPerPage}`
);
      const data = await response.json();

      setDeals(data.deals || []);
      setTotalCount(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error("Error fetching group deals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.brand) {
      fetchVendorDeals(user.brand);
    }
  }, [user, fetchVendorDeals]);



  const handleViewParticipants = (deal: any) => {
    setSelectedDeal(deal);
    setIsViewModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-[#FDFDFF] font-sans text-slate-900 overflow-hidden">
      {/* 1. SIDEBAR: Fixed and hidden on mobile */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-100">
        <VendorSidebar />
      </div>

      {/* 2. MAIN CONTENT AREA: Scrollable */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 pb-24 relative bg-white">
        <VendorHeader />

        {/* Plan Info Banner */}
        <div className={`rounded-xl p-4 flex items-start justify-between mb-8 shadow-sm border ${
          user?.subscription === 'premium' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-bold text-gray-900">
                {user?.name} Group Dashboard
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage your bulk orders and track MOQ progress in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-2xl font-bold flex items-center text-gray-900 mb-4 sm:mb-0">
            <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Group Deals ({totalCount})
          </h1>
        </div>

        {/* Main Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative flex items-center justify-center">
              <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="absolute w-12 h-12 bg-blue-100 rounded-full animate-ping opacity-20" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
              Loading group deals...
            </p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <div className="mb-4 flex justify-center">
               <Package size={48} className="text-gray-200" />
            </div>
            No group deals found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-50 shadow-sm">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="border-b border-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">
                  <th className="px-6 py-5">Deal Details</th>
                  <th className="px-6 py-5">MOQ Progress</th>
                  <th className="px-6 py-5">Expires</th>
                  <th className="px-6 py-5">Revenue</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deals.map((deal) => {
                  const progress = Math.min((deal.totalOrderedQuantity / deal.moqQuantity) * 100, 100);
                  return (
                    <tr key={deal._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img className="h-10 w-10 rounded-lg object-cover" src={deal.images[0]} alt="" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{deal.title}</div>
                            <div className="text-xs text-gray-400">MOQ: {deal.moqQuantity} units</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-40">
                          <div className="flex justify-between text-xs mb-1 font-bold">
                            <span>{deal.totalOrderedQuantity} joined</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(deal.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-900 font-bold">
                        {deal.currency} {(deal.totalOrderedQuantity * deal.discountedPrice).toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <DealStatusBadge status={deal.status} total={deal.totalOrderedQuantity} moq={deal.moqQuantity} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleViewParticipants(deal)}
                          className="text-blue-500 hover:text-blue-600 font-bold text-sm transition-colors"
                        >
                          View Orders
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Participants Modal */}
        {isViewModalOpen && (
          <ParticipantsModal
            deal={selectedDeal}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
}

// --- Participants Modal ---
function ParticipantsModal({ deal, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Order Participants</h3>
            <p className="text-sm text-gray-400">{deal.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-height-[400px] overflow-y-auto">
          {deal.orders && deal.orders.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Qty</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deal.orders.map((order: any, idx: number) => (
                  <tr key={idx} className="text-sm">
                    <td className="py-4 font-bold text-gray-900">{order.userName}</td>
                    <td className="py-4">{order.quantity}</td>
                    <td className="py-4 font-bold text-blue-600">{deal.currency} {order.totalAmount.toLocaleString()}</td>
                    <td className="py-4 text-gray-500">{new Date(order.orderedAt).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md text-[10px] uppercase font-bold">
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-400">No participants yet.</div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
