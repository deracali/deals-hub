"use client";

import React, { useState, useEffect } from 'react';
import {
  ChevronDown, Calendar, MoreVertical, Users, Store,
  LayoutGrid, ExternalLink, Wallet, X, AlertCircle, ArrowLeft, CheckCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// --- Types & Data ---
// Added reactivate_success to handle the new modal state
type ModalState = 'none' | 'cancel_confirm' | 'cancel_success' | 'reactivate_success' | 'certificate';



const EMPTY_PIE = [{ name: 'Empty', value: 1, color: '#F2F2F7' }];
const SPARK_UP = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 16 }, { v: 25 }];
const SPARK_DOWN = [{ v: 25 }, { v: 20 }, { v: 22 }, { v: 15 }, { v: 18 }, { v: 10 }];



interface Vendor {
  _id: string;
  name: string;
  location: string;
  country: string;
  subscription: "free" | "pro" | "premium";
  businessEmail: string;
  businessPhone: string;
  businessLogo: string;
  isVerified: boolean;
}



export default function SummaryPage() {
  const [isEmpty, setIsEmpty] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalState>('none');
  const [usersCount, setUsersCount] = useState<number>(0);
  const [vendorsCount, setVendorsCount] = useState<number>(0);
  const [dealsCount, setDealsCount] = useState<number>(0);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [usersTrend, setUsersTrend] = useState<string>("N/A");
  const [vendorsTrend, setVendorsTrend] = useState<string>("N/A");
  const [dealsTrend, setDealsTrend] = useState<string>("N/A");
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loadingRevenue, setLoadingRevenue] = useState(true);


  // Compute total to get percentages
  const totalCount = usersCount + vendorsCount + dealsCount;

  // Map to include percentages
  const DYNAMIC_REVENUE_DATA = [
    { name: 'Vendors', value: vendorsCount, color: '#007AFF', percent: totalCount ? (vendorsCount / totalCount) * 100 : 0 },
    { name: 'Users', value: usersCount, color: '#002244', percent: totalCount ? (usersCount / totalCount) * 100 : 0 },
    { name: 'Deals', value: dealsCount, color: '#FF3B30', percent: totalCount ? (dealsCount / totalCount) * 100 : 0 },
  ];

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoadingRevenue(true);

        const res = await fetch(
          "https://dealshub-server.onrender.com/api/vendors/plan-stats"
        );

        const json = await res.json();

        // Your API structure:
        // data: [{ vendorCount, plan, price, duration, totalAmount }]

        const plans = json.data || [];

        // Calculate total revenue
        const revenue = plans.reduce(
          (acc: number, item: any) =>
            acc + (item.totalAmount || 0),
          0
        );

        setTotalRevenue(revenue);
      } catch (error) {
        console.error("Failed to fetch revenue", error);
      } finally {
        setLoadingRevenue(false);
      }
    };

    fetchRevenue();
  }, []);


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);

        // USERS
        const usersRes = await fetch("http://127.0.0.1:5000/api/users");
        const usersData = await usersRes.json();
        const usersCount = usersData.users?.length || 0;
        setUsersCount(usersCount);
        setUsersTrend("Live data");

        // VENDORS
        const vendorsRes = await fetch("http://127.0.0.1:5000/api/vendors/get");
        const vendorsData = await vendorsRes.json();
        const vendorsCount = vendorsData.data?.length || 0;
        setVendorsCount(vendorsCount);
        setVendorsTrend("Live data");

        // DEALS
        const dealsRes = await fetch("http://127.0.0.1:5000/api/deals/get");
        const dealsData = await dealsRes.json();
        const dealsCount = dealsData.deals?.length || 0;
        setDealsCount(dealsCount);
        setDealsTrend("Live data");

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, []);


  const getPreviousMonthCount = (items: any[]) => {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1; // Dec if Jan
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    return items.filter(item => {
      const created = new Date(item.createdAt);
      return created.getMonth() === prevMonth && created.getFullYear() === prevYear;
    }).length;
  };


  const calcTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return "N/A";
    const times = (current / previous).toFixed(1);
    return `${times}x growth from last month`;
  };




  return (
    <div className="relative min-h-screen p-8 font-sans">
      {/* State Toggle */}
      <button
        onClick={() => setIsEmpty(!isEmpty)}
        className="mb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-blue-500"
      >
        Current State: {isEmpty ? 'Empty' : 'Populated'}
      </button>

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
      <StatCard
      title="Users"
      icon={<Users size={18} className="text-orange-500" />}
      value={usersCount.toLocaleString()}
      isEmpty={isEmpty}
    />

    <StatCard
      title="Vendors"
      icon={<Store size={18} className="text-blue-500" />}
      value={vendorsCount.toLocaleString()}
      trend={vendorsTrend}
      isUp={vendorsTrend.includes("growth")}
      isEmpty={isEmpty}
    />

    <StatCard
      title="Deals"
      icon={<LayoutGrid size={18} className="text-red-500" />}
      value={dealsCount.toLocaleString()}
      trend={dealsTrend}
      isUp={dealsTrend.includes("growth")}
      isEmpty={isEmpty}
    />


    </div>


      {/* 2. REVENUE ANALYSIS SECTION */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm mb-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="text-green-500" size={20} />
              <h2 className="text-sm font-black text-gray-900">Revenue & Subscriptions</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#007AFF] text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 font-bold">
                <span className="opacity-80">🇳🇬</span> NGN <ChevronDown size={12} />
              </div>
              <span className="text-3xl font-black text-gray-900 leading-none">
  {isEmpty
    ? "0.00"
    : loadingRevenue
    ? "Loading..."
    : totalRevenue.toLocaleString()}
</span>

            </div>
          </div>
          <button className="flex items-center gap-2 text-[11px] font-bold text-gray-500 border border-gray-100 px-4 py-2 rounded-xl">Monthly <ChevronDown size={14} /></button>
        </div>

        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-7 relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
    data={isEmpty ? EMPTY_PIE : DYNAMIC_REVENUE_DATA}
    innerRadius={70}
    outerRadius={100}
    paddingAngle={isEmpty ? 0 : 4}
    dataKey="value"
    startAngle={90}
    endAngle={450}
    label={({ name, percent }) => `${name}: ${(percent).toFixed(1)}%`} // show % on chart
  >
    {(isEmpty ? EMPTY_PIE : DYNAMIC_REVENUE_DATA).map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Pie>

              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-5 grid grid-cols-2 gap-y-6 gap-x-12">
      {!isEmpty && DYNAMIC_REVENUE_DATA.map((item) => (
        <div key={item.name} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: item.color }} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.name}</p>
              <p className="text-sm font-black text-gray-900">
                {item.value.toLocaleString()} ({item.percent.toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

        </div>
      </div>

      {/* 3. SUBSCRIPTIONS TABLE */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
            </div>
            <h3 className="text-sm font-black text-gray-900 uppercase">Subscriptions</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 border border-gray-100 px-3 py-1.5 rounded-lg uppercase">All deals <ChevronDown size={14} /></div>
            <Calendar size={18} className="text-gray-300 cursor-pointer" />
          </div>
        </div>
        {isEmpty ? (
          <EmptyTableState />
        ) : (
          <SubscriptionsTable
            onCancel={() => setActiveModal('cancel_confirm')}
            onReactivate={() => setActiveModal('reactivate_success')}
            onViewCert={() => setActiveModal('certificate')}
          />
        )}
      </div>

      {/* 4. INTEGRATED MODALS */}
      {activeModal === 'cancel_confirm' && (
        <CancelConfirmationModal onConfirm={() => setActiveModal('cancel_success')} onClose={() => setActiveModal('none')} />
      )}
      {activeModal === 'cancel_success' && (
        <CancelStatusModal onClose={() => setActiveModal('none')} />
      )}
      {/* New Reactivate Modal */}
      {activeModal === 'reactivate_success' && (
        <ReactivateStatusModal onClose={() => setActiveModal('none')} />
      )}
      {activeModal === 'certificate' && (
        <CertificatePreviewModal onClose={() => setActiveModal('none')} />
      )}
    </div>
  );
}

// --- Modal Components ---

function ReactivateStatusModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-[32px] w-full max-w-[400px] p-12 text-center shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle size={70} strokeWidth={2} className="text-[#34C759]" />
          </div>
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase">Subscription Reactivated!</h2>
        <p className="text-[12px] text-gray-500 font-bold mb-10">
          The vendor's subscription has been successfully reactivated.
        </p>

        <button
          onClick={onClose}
          className="text-[11px] font-black text-[#007AFF] uppercase tracking-widest hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function CancelConfirmationModal({ onConfirm, onClose }: { onConfirm: () => void, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-[32px] w-full max-w-[480px] p-10 text-center shadow-2xl relative">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <X size={60} strokeWidth={4} className="text-[#FF0000]" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-400 rounded-full blur-[2px] opacity-50" />
          </div>
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-2">Cancel Subscription?</h2>
        <p className="text-[11px] text-gray-500 font-bold mb-8 px-10 leading-relaxed">
          Are you sure you want to cancel this subscription? The vendor will be notify via email.
        </p>

        <div className="text-left mb-8">
          <label className="text-[10px] font-black text-gray-900 uppercase mb-2 block">Drop a comment, if any</label>
          <textarea
            placeholder="Share your thought on why you reject this application"
            className="w-full h-32 bg-[#F9F9F9] border-none rounded-2xl p-4 text-[11px] font-bold text-gray-900 placeholder:text-gray-300 resize-none focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-[#FF0000] hover:bg-red-700 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors mb-6 shadow-lg shadow-red-200"
        >
          Yes, Cancel subscription
        </button>

        <button
          onClick={onClose}
          className="text-[11px] font-black text-[#001D3D] uppercase tracking-widest hover:underline"
        >
          No, Go back
        </button>
      </div>
    </div>
  );
}

function CancelStatusModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white rounded-[32px] w-full max-w-[400px] p-12 text-center shadow-2xl">
        <div className="flex justify-center mb-8">
          <X size={70} strokeWidth={5} className="text-[#FF0000]" />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase">Subscription cancel!</h2>
        <p className="text-[12px] text-gray-500 font-bold mb-10">
          You cancel this subscription.
        </p>

        <button
          onClick={onClose}
          className="text-[11px] font-black text-[#007AFF] uppercase tracking-widest hover:underline"
        >
          No, Go back
        </button>
      </div>
    </div>
  );
}

function CertificatePreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[4px] p-10">
      <div className="bg-white rounded-[24px] w-full max-w-5xl h-full flex flex-col p-8 shadow-2xl">
        <button onClick={onClose} className="flex items-center gap-2 text-[11px] font-black text-gray-500 mb-6 hover:text-black uppercase">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex-1 bg-[#F5F5F7] rounded-xl flex items-center justify-center overflow-auto p-10">
          <div className="bg-white shadow-xl w-full max-w-[600px] aspect-[1/1.4] border-[15px] border-[#C1F1DB] p-10 flex flex-col items-center relative">
            <div className="w-20 h-20 bg-gray-100 rounded-full mb-6" />
            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-1">Federal Republic of Nigeria</p>
            <h4 className="text-xl font-black text-center mb-10 leading-tight">CERTIFICATE OF INCORPORATION<br/>OF A<br/>PUBLIC COMPANY LIMITED BY SHARES</h4>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-10 select-none">
              <span className="text-8xl font-black text-gray-400 uppercase">Sample</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Table Components ---

function SubscriptionsTable({
  onCancel,
  onReactivate,
  onViewCert
}: {
  onCancel: () => void,
  onReactivate: () => void,
  onViewCert: () => void
}) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaidSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://dealshub-server.onrender.com/api/vendors/get");
        const json = await response.json();

        // Filter: ONLY get 'premium' and 'pro'
        const paidVendors = (json.data || []).filter(
          (v: Vendor) => v.subscription === "premium" || v.subscription === "pro"
        );

        setVendors(paidVendors);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidSubscriptions();
  }, []);

  const getSubStyles = (sub: string) => {
    return sub === "premium"
      ? "text-blue-500 border-blue-100 bg-blue-50/30"
      : "text-orange-500 border-orange-100 bg-orange-50/30";
  };

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
          <th className="pb-4">Vendor image/Name</th>
          <th className="pb-4">Location</th>
          <th className="pb-4">Subscription</th>
          <th className="pb-4">Email address</th>
          <th className="pb-4">Phone no.</th>
          <th className="pb-4">Status</th>
          <th className="pb-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
      {loading ? (
      <tr>
        <td colSpan={7} className="py-10">
          <div className="flex justify-center items-center">
            <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </td>
      </tr>
    ) : vendors.length === 0 ? (
          <tr><td colSpan={7} className="py-10 text-center text-gray-400 text-xs">No Premium or Pro vendors found.</td></tr>
        ) : (
          vendors.map((vendor) => (
            <tr key={vendor._id} className="group relative">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <img
                      src={vendor.businessLogo || `https://avatar.vercel.sh/${vendor.name}`}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <p className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
                    {vendor.name}
                    <button onClick={onViewCert} className="text-blue-500 hover:text-blue-700 transition-colors">
                      <ExternalLink size={10} />
                    </button>
                  </p>
                </div>
              </td>
              <td className="text-[11px] font-bold text-gray-400">
                {vendor.location}, {vendor.country}
              </td>
              <td>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase ${getSubStyles(vendor.subscription)}`}>
                  {vendor.subscription}
                </span>
              </td>
              <td className="text-[11px] font-bold text-gray-400 italic">{vendor.businessEmail}</td>
              <td className="text-[11px] font-bold text-gray-400">{vendor.businessPhone}</td>
              <td>
                <span className={`px-3 py-1 rounded-md text-[9px] font-bold ${!vendor.status ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                  {vendor.status ? 'Active' : 'Pending'}
                </span>
              </td>
              <td className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === vendor._id ? null : vendor._id)}
                  className="text-gray-300 hover:text-gray-600"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenu === vendor._id && (
                  <div className="absolute right-0 top-10 w-44 bg-white border border-gray-100 shadow-xl rounded-xl z-20 py-2">
                    <button
                      onClick={() => { onReactivate(); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Reactivate Subscription
                    </button>
                    <button
                      onClick={() => { onCancel(); setOpenMenu(null); }}
                      className="w-full text-left px-4 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <AlertCircle size={12} /> Cancel Subscription
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function StatCard({ title, icon, value, trend, isUp, isEmpty }: any) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-black text-gray-900">{title}</span>
        </div>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-1">{isEmpty ? "-" : value}</h2>
          <p className={`text-[10px] font-bold ${isEmpty ? "text-gray-200" : isUp ? "text-green-500" : "text-red-500"}`}>{isEmpty ? "- % ---" : trend}</p>
        </div>
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={isUp ? SPARK_UP : SPARK_DOWN}>
              <Area type="monotone" dataKey="v" stroke={isEmpty ? "#F2F2F7" : isUp ? "#34C759" : "#FF3B30"} fill={isEmpty ? "transparent" : isUp ? "#EBF9EE" : "#FFF1F0"} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EmptyTableState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <LayoutGrid size={48} className="text-gray-200 mb-4" />
      <h4 className="text-sm font-black text-gray-900 uppercase">Nothing to see here</h4>
      <p className="text-[11px] text-gray-400 font-bold mt-1">No subscriptions found.</p>
    </div>
  );
}
