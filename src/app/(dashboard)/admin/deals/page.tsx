"use client";

import React, { useState, useEffect } from 'react';
import {
  ChevronDown, MoreVertical, ExternalLink,
  Search, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { DealDetailModal } from '../component/DealDetailModal';





interface Deal {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  currencySymbol: string;
  status: string;
  views: number;
  createdAt: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);
  const itemsPerPage = 10;


  const dealsTrendData = React.useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Initialize months with zero counts
    const data = months.map((month) => ({
      name: month,
      free: 0,
      pro: 0,
      premium: 0,
    }));

    deals.forEach((deal) => {
      const date = new Date(deal.createdAt);
      const monthIndex = date.getMonth(); // 0-11
      const plan = (deal as any).plan || 'free'; // assuming each deal has a `plan` property

      if (plan === 'free') data[monthIndex].free += 1;
      else if (plan === 'pro') data[monthIndex].pro += 1;
      else if (plan === 'premium') data[monthIndex].premium += 1;
    });

    return data;
  }, [deals]);



  // Compute deals stats dynamically
  const dealStats = React.useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let thisMonthCount = 0;
    let lastMonthCount = 0;

    deals.forEach((deal) => {
      const createdAt = new Date(deal.createdAt);
      const month = createdAt.getMonth();
      const year = createdAt.getFullYear();

      if (month === thisMonth && year === thisYear) thisMonthCount += 1;
      else if (month === lastMonth && year === lastMonthYear) lastMonthCount += 1;
    });

    const difference = thisMonthCount - lastMonthCount;
    const percentageChange =
      lastMonthCount === 0
        ? thisMonthCount > 0
          ? 100
          : 0
        : (difference / lastMonthCount) * 100;

    return {
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      difference,
      percentageChange: Math.round(percentageChange),
    };
  }, [deals]);




  // Fetch Live Deals with Pagination
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        // API call includes page and limit queries
        const response = await fetch(
          `https://dealshub-server.onrender.com/api/deals/get?page=${currentPage}&limit=${itemsPerPage}`
        );
        const json = await response.json();

        setDeals(json.deals || []);
        // Update total count for stats and pagination calculation
        setTotalDeals(json.totalCount || json.deals?.length || 0);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [currentPage]); // Re-fetches when page changes

  const totalPages = Math.ceil(totalDeals / itemsPerPage) || 1;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };


  const handleStatusChange = (dealId: string, newStatus: string) => {
    setDeals((prev) =>
      prev.map((d) =>
        d._id === dealId ? { ...d, status: newStatus } : d
      )
    );
  };



  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-500';
      case 'closed':
      case 'expired': return 'bg-red-50 text-red-500';
      default: return 'bg-orange-50 text-orange-500';
    }
  };

  return (
    <div className="min-h-screen p-8 font-sans">
      {/* 1. Top Section: Stats & Chart */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex flex-col justify-center min-w-[250px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-black text-gray-900 uppercase">Total Deals</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">
               {totalDeals.toLocaleString()}
            </h2>
            <p className="text-xs font-bold text-green-500 flex items-center gap-1">
  <span className="bg-green-100 p-0.5 rounded">
    {dealStats.difference >= 0 ? `↑ ${dealStats.percentageChange}%` : `↓ ${Math.abs(dealStats.percentageChange)}%`}
  </span>{" "}
  more than last month
</p>

          </div>

          <div className="flex-1 h-[150px]">
            <div className="flex justify-end gap-4 mb-2">
               <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                 <div className="w-2 h-2 rounded-full bg-[#002244]" /> Normal
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                 <div className="w-2 h-2 rounded-full bg-[#FF9500]" /> Affiliate
               </div>
               <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                 <div className="w-2 h-2 rounded-full bg-[#007AFF]" /> Group
               </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
    <LineChart data={dealsTrendData}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#9CA3AF'}} />
      <Tooltip />
      <Line type="monotone" dataKey="free" stroke="#002244" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="pro" stroke="#FF9500" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="premium" stroke="#007AFF" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>

          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500" />
           <h3 className="text-sm font-black text-gray-900 uppercase">Manage Deals</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-2 rounded-xl text-[10px] font-bold text-gray-400 uppercase">
            All deals <ChevronDown size={14} />
          </div>
          <div className="p-2 bg-white border border-gray-100 rounded-xl text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
            <Search size={16} />
          </div>
          <button className="flex items-center gap-2 bg-[#007AFF] text-white px-5 py-2.5 rounded-xl text-[10px] font-bold shadow-lg shadow-blue-100 uppercase">
            <Plus size={14} /> Post deals
          </button>
        </div>
      </div>

      {/* 3. Deals Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase">
              <th className="p-6">Product Image/Title</th>
              <th className="p-6">Description</th>
              <th className="p-6 text-right">Orig. Price</th>
              <th className="p-6 text-right">Disc. Price</th>
              <th className="p-6 text-center">Disc. %</th>
              <th className="p-6">Category</th>
              <th className="p-6">Status</th>
              <th className="p-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
          {loading ? (
             <tr><td colSpan={8} className="p-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Fetching latest deals...</td></tr>
          ) : deals.length === 0 ? (
             <tr><td colSpan={8} className="p-20 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No deals found</td></tr>
          ) : (
            deals.map((deal) => (
              <tr
                key={deal._id}
                onClick={() => handleDealClick(deal)}
                className="cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-50">
                      {deal.images?.[0] ? (
                        <img src={deal.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-[8px]">NO IMG</div>
                      )}
                    </div>
                    <div className="max-w-[150px]">
                      <div className="flex items-center gap-1 text-[11px] font-black text-gray-900 truncate">
                        {deal.title} <ExternalLink size={12} className="text-blue-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-[10px] font-bold text-gray-400 max-w-[200px] leading-relaxed">
                  <p className="line-clamp-2">{deal.description}</p>
                </td>
                <td className="p-6 text-[11px] font-black text-gray-900 text-right">
                  {deal.currencySymbol}{deal.originalPrice?.toFixed(2)}
                </td>
                <td className="p-6 text-[11px] font-black text-gray-900 text-right">
                  {deal.currencySymbol}{deal.discountedPrice?.toFixed(2)}
                </td>
                <td className="p-6 text-center">
                  <span className="text-[11px] font-black text-gray-900 bg-gray-50 px-2 py-1 rounded">
                    {Math.round(deal.discountPercentage)}%
                  </span>
                </td>
                <td className="p-6 text-[11px] font-bold text-gray-500 uppercase">
                  {deal.category}
                </td>
                <td className="p-6">
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${getStatusStyles(deal.status)}`}>
                    {deal.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); /* Logic for menu */ }}
                    className="text-gray-300 hover:text-gray-600"
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>

        {/* Functional Pagination Component */}
        <div className="p-6 flex justify-center items-center gap-4 border-t border-gray-50">
           <button
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1 || loading}
             className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${
               currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900'
             }`}
           >
             <ChevronLeft size={14} /> Previous
           </button>

           <div className="flex items-center gap-2">
             {[...Array(totalPages)].map((_, i) => {
               const pageNum = i + 1;
               // Simple logic to only show 5 pages if total is huge
               if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;

               return (
                 <button
                   key={pageNum}
                   onClick={() => handlePageChange(pageNum)}
                   className={`w-8 h-8 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                     currentPage === pageNum
                       ? 'bg-[#007AFF] text-white shadow-md shadow-blue-100'
                       : 'text-gray-400 hover:bg-gray-50'
                   }`}
                 >
                   {pageNum}
                 </button>
               );
             })}
           </div>

           <button
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === totalPages || loading}
             className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${
               currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900'
             }`}
           >
             Next <ChevronRight size={14} />
           </button>
        </div>
      </div>

      {selectedDeal && (
    <DealDetailModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      deal={selectedDeal}
      onStatusChange={handleStatusChange}
    />
  )}

    </div>
  );
}
