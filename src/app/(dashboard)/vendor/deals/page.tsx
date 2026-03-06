"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { VendorHeader } from "../component/VendorHeader";
import { VendorSidebar } from "../component/sidebar";
import { EditDealModal } from "../component/EditDealModal";
import {
RefreshCcw
} from 'lucide-react';


const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = '';
  switch (status?.toLowerCase()) {
    case 'active': colorClass = 'bg-green-100 text-green-600'; break;
    case 'pending': colorClass = 'bg-orange-100 text-orange-600'; break;
    case 'out of stock':
    case 'expired': colorClass = 'bg-red-100 text-red-600'; break;
    default: colorClass = 'bg-gray-100 text-gray-600';
  }
  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClass}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default function DealsPage() {
  // --- Live Data State ---
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const [user, setUser] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false);


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
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return;

  const parsed = JSON.parse(storedUser);
  if (!parsed?._id) return;

  fetch(`https://dealshub-server.onrender.com/api/users/${parsed._id}`)
    .then(res => res.json())
    .then(data => {
      if (!data) return;

      const updatedUser = {
        ...parsed,
        ...data,
      };

      setUser(updatedUser);
      setCurrentPlan(updatedUser.plan || "free");

      if (updatedUser.saved_accounts?.length > 0) {
        setSelectedAccount(updatedUser.saved_accounts[0]);
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));
    })
    .catch(err => console.error("Failed to fetch user", err));
}, []);


  // 1. Get User from LocalStorage on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // Or whatever key you used to save it
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- Fetch Brand Deals ---
  const fetchBrandDeals = useCallback(async (brandName: string) => {
    try {
      setLoading(true);

      const response = await fetch(`https://dealshub-server.onrender.com/api/deals/brand/${brandName}`);
      const data = await response.json();

      const dealsArray = Array.isArray(data) ? data : data.deals || [];

      setDeals(dealsArray);
      setTotalCount(dealsArray.length); // ✅ fix deal (0)
    } catch (error) {
      console.error("Error fetching brand deals:", error);
      setDeals([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const paginatedDeals = deals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

   useEffect(() => {
     if (user?.brand) {
       fetchBrandDeals(user.brand);
     }
   }, [user, fetchBrandDeals]);


  const isEmpty = !loading && deals.length === 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  const handleEditClick = (deal: any) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (deal: any) => {
    setSelectedDeal(deal);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
  if (!selectedDeal) return;

  try {
    const dealId = selectedDeal._id;

    // Call the new backend delete route
    const response = await fetch(`https://dealshub-server.onrender.com/api/deals/delete/${dealId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Remove the deal from state
      setDeals(deals.filter(d => d._id !== dealId));

      // Close delete modal and show success
      setIsDeleteModalOpen(false);
      setIsDeleteSuccessOpen(true);
    } else {
      const errorData = await response.json();
      popup(`Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error("❌ Error deleting deal:", error);
    popup("Failed to delete deal. Please try again.");
  }
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

    {/* Plan Info Banner Logic */}
    {isEmpty ? (
      <div className={`${
        user?.plan === 'premium' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
      } rounded-xl p-4 flex items-start justify-between mb-8 shadow-sm border`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className={`h-6 w-6 ${user?.plan === 'premium' ? 'text-blue-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {user?.plan === 'premium' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-gray-900">
              {user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)} plan - {user?.brand}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {user?.plan === 'premium' ? (
                <span>
                  Plan started: {user?.planCreatedAt ? new Date(user.planCreatedAt).toLocaleDateString() : "N/A"}<br />
                  Expires: {user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString() : "N/A"}
                  {' '}
                  <a href="#" className="text-blue-600 font-bold underline ml-1">Renew Subscription</a>
                </span>
              ) : (
                <span>
                  You can only post {user?.dealsCount} deals per month.
                  <a href="#" className="text-red-600 font-bold underline ml-1">Upgrade to Pro</a>
                </span>
              )}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-500"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
    ) : (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between mb-8 shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-gray-900">
              {user?.plan ? `${user.plan.charAt(0).toUpperCase()}${user.plan.slice(1)} plan` : "Plan"}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {user?.plan === "premium" ? (
                (() => {
                  const expires = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
                  const daysLeft = expires ? Math.ceil((expires.getTime() - Date.now()) / 86400000) : null;
                  return (
                    <>
                      Plan started: {user?.planCreatedAt ? new Date(user.planCreatedAt).toLocaleDateString() : "N/A"}<br />
                      Expires: {expires ? expires.toLocaleDateString() : "N/A"}{" "}
                      {daysLeft !== null && daysLeft <= 0 ? (
                        <a href="#" className="text-blue-600 font-bold underline">Renew Subscription</a>
                      ) : (
                        daysLeft !== null && <span className="font-semibold text-gray-700">({daysLeft} {daysLeft === 1 ? "day" : "days"} left)</span>
                      )}
                    </>
                  );
                })()
              ) : (
                <span>
                  You can only post {user?.dealsCount || 0} deals per month.
                  <a href="#" className="text-red-600 font-bold underline ml-1">Upgrade to Pro</a>
                </span>
              )}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-500"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>
    )}

    {/* Header Bar */}
    <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
      <h1 className="text-2xl font-bold flex items-center text-gray-900 mb-4 sm:mb-0">
        <svg className="h-6 w-6 text-blue-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
        </svg>
        Deals ({totalCount})
      </h1>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-100 text-gray-500 py-2.5 px-4 pr-10 rounded-xl text-sm focus:outline-none shadow-sm">
            <option>Newest deals</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl inline-flex items-center text-sm shadow-md transition-all active:scale-95">
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create new deal
        </button>
      </div>
    </div>

    {/* Main Content Area */}
    {loading ? (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="relative flex items-center justify-center">
          <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
          <div className="absolute w-12 h-12 bg-blue-100 rounded-full animate-ping opacity-20" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Loading live data...</p>
      </div>
    ) : isEmpty ? (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Image src="/Group 50.png" alt="Nothing" width={100} height={100} className="opacity-80 mb-6" />
        <h2 className="text-xl font-bold text-gray-900">Nothing here</h2>
        <p className="text-gray-400 text-sm mt-2">Post a deal and check again</p>
      </div>
    ) : (
      <>
        <div className="overflow-x-auto rounded-xl border border-gray-50 shadow-sm">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b border-gray-50 text-left text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/30">
                <th className="px-4 py-5">Title</th>
                <th className="px-4 py-5">Description</th>
                <th className="px-4 py-5">Original Price</th>
                <th className="px-4 py-5">Discount Price</th>
                <th className="px-4 py-5">Discount %</th>
                <th className="px-4 py-5">Category</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-4 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.map((deal) => (
                <tr key={deal._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-5">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-xl object-cover flex-shrink-0 bg-gray-100" src={deal.images?.[1] || 'https://placehold.co/48x48'} alt="" />
                      <div className="ml-4 w-40 text-sm font-bold text-gray-900 line-clamp-2 leading-tight break-words">{deal.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-400 line-clamp-2 max-w-[220px]">{deal.description}</td>
                  <td className="px-4 py-5 text-sm text-gray-500 font-medium">{deal.currencySymbol}{deal.originalPrice?.toFixed(2)}</td>
                  <td className="px-4 py-5 text-sm text-gray-900 font-bold">{deal.currencySymbol}{deal.discountedPrice?.toFixed(2)}</td>
                  <td className="px-4 py-5 text-sm text-gray-500">{Math.round(deal.discountPercentage)}%</td>
                  <td className="px-4 py-5 text-sm text-gray-500 capitalize">{deal.category}</td>
                  <td className="px-4 py-5"><StatusBadge status={deal.status} /></td>
                  <td className="px-4 py-5 text-right">
                    <div className="flex justify-end space-x-4">
                      <button onClick={() => handleEditClick(deal)} className="text-blue-500 hover:text-blue-600 text-sm font-bold">Edit</button>
                      <button onClick={() => handleDeleteClick(deal)} className="text-red-400 hover:text-red-500"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-3 mt-12 mb-20 text-sm">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 font-bold text-gray-400 hover:bg-gray-100 rounded-xl disabled:opacity-30">Previous</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'hover:bg-gray-50 text-gray-500'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl disabled:opacity-30">Next</button>
        </div>
      </>
    )}

    {/* Modals */}
    {isDeleteModalOpen && <DeleteConfirmModal deal={selectedDeal} onConfirm={confirmDelete} onCancel={() => setIsDeleteModalOpen(false)} />}
    {isDeleteSuccessOpen && <DeleteSuccessModal onClose={() => setIsDeleteSuccessOpen(false)} />}
    <EditDealModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} deal={selectedDeal} onDealUpdated={(updated) => setDeals(prev => prev.map(d => d._id === updated._id ? updated : d))} />
  </main>
</div>
);
}

// Sub-components for cleaner code
const PlusIcon = () => <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

function DeleteConfirmModal({ deal, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Delete deal?</h3>
        <p className="text-gray-500 text-sm mb-8 px-2">Are you sure you want to delete <span className="font-bold">"{deal?.title}"</span>?</p>
        <div className="w-full space-y-3">
          <button onClick={onConfirm} className="w-full py-3.5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-red-100">Yes, delete deal</button>
          <button onClick={onCancel} className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Go back</button>
        </div>
      </div>
    </div>
  );
}

function DeleteSuccessModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <div className="bg-red-500 rounded-xl p-3 shadow-lg shadow-red-200">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Deals deleted</h3>
        <p className="text-gray-500 text-sm mb-8">Your deal has been deleted successfully.</p>
        <button onClick={onClose} className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-2xl">View all deals</button>
      </div>
    </div>
  );
}
