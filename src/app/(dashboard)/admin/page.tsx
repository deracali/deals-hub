"use client";

import React, { useState, useEffect } from 'react';
import {
  MoreVertical,
  Plus,
  ChevronDown,
  LayoutGrid,
  Users as UsersIcon,
  Store,
  Wallet,
  Calendar,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

// --- Mock Data ---
const LINE_DATA = [
  { name: 'Mon', view: 150, click: 100 },
  { name: 'Tue', view: 200, click: 150 },
  { name: 'Wed', view: 180, click: 120 },
  { name: 'Thu', view: 250, click: 200 },
  { name: 'Fri', view: 400, click: 350 }, // Peak as seen in image_d8b917
  { name: 'Sat', view: 300, click: 250 },
  { name: 'Sun', view: 200, click: 150 },
];

const SPARKLINE_DATA_UP = [
  { v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 16 }, { v: 25 }
];

const SPARKLINE_DATA_DOWN = [
  { v: 25 }, { v: 20 }, { v: 22 }, { v: 15 }, { v: 18 }, { v: 10 }
];



const EMPTY_PIE = [{ name: 'Empty', value: 1, color: '#F2F2F7' }];

export default function Dashboard() {
  const [isEmpty, setIsEmpty] = useState(false);
  const [activeTab, setActiveTab] = useState("Vendors");
  const [userStats, setUserStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const [revenueStats, setRevenueStats] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loadingRevenue, setLoadingRevenue] = useState(true);


  const [deals, setDeals] = useState<any[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);

  const TIME_FILTERS = ["Daily", "Weekly", "Monthly", "Yearly"];


  const REVENUE_PIE = revenueStats.map((item, index) => ({
    name: item.plan?.toUpperCase() ?? "UNKNOWN",
    value: item.totalAmount,
    color: ["#007AFF", "#34C759", "#FF9500", "#FF3B30"][index % 4],
  }));


  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch("https://dealshub-server.onrender.com/api/users/stats");
        const data = await res.json();
        setUserStats(data.data);
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchUserStats();
  }, []);

  const [timeFilter, setTimeFilter] = useState("Monthly");
  const [openFilter, setOpenFilter] = useState(false);


  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(
          "https://dealshub-server.onrender.com/api/deals/get"
        );
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (err) {
        console.error("Failed to fetch deals", err);
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchDeals();
  }, []);



  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch(
          "https://dealshub-server.onrender.com/api/vendors/plan-stats"
        );
        const data = await res.json();

        const stats = data.data || [];
        setRevenueStats(stats);

        // Calculate the total by summing up 'totalAmount' from each plan
        const calculatedTotal = stats.reduce((sum: number, item: any) => {
          return sum + (item.totalAmount || 0);
        }, 0);

        // Use data.grandTotal if the API ever adds it, otherwise use our calculation
        setTotalRevenue(data.grandTotal !== undefined ? data.grandTotal : calculatedTotal);

      } catch (err) {
        console.error("Failed to fetch revenue", err);
      } finally {
        setLoadingRevenue(false);
      }
    };

    fetchRevenue();
  }, []);


  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://dealshub-server.onrender.com/api/users");
      const data = await res.json();
      setUsers(data.data || data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  fetchUsers();
}, []);



useEffect(() => {
  const fetchVendors = async () => {
    try {
      const res = await fetch("https://dealshub-server.onrender.com/api/vendors/get");
      const data = await res.json();
      setVendors(data.data || []);
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoadingVendors(false);
    }
  };

  fetchVendors();
}, []);


  /* =====================
     DEALS METRICS
  ====================== */
  const totalDeals = deals.length;

  const availableDeals = deals.filter(
    (deal) => deal.status === "active"
  ).length;

  const approvedPercentage =
    totalDeals > 0
      ? Math.round((availableDeals / totalDeals) * 100)
      : 0;


      const totalUsers = users.length;

const activeUsers = users.filter(
  (u) => u.status === "active" || !u.status
).length;

const usersPercentage =
  totalUsers > 0
    ? Math.round((activeUsers / totalUsers) * 100)
    : 0;



    const totalVendors = vendors.length;

    const activeVendors = vendors.filter(
      (v) => v.status === "active" || !v.status
    ).length;

    const vendorsPercentage =
      totalVendors > 0
        ? Math.round((activeVendors / totalVendors) * 100)
        : 0;




  return (
    <div className="min-h-screen p-6 font-sans">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsEmpty(!isEmpty)}
          className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors"
        >
          TOGGLE STATE: {isEmpty ? "EMPTY" : "POPULATED"}
        </button>
        <button className="bg-[#007AFF] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-all">
          <Plus size={18} /> Post deals
        </button>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-8">
      <SummaryCard
  title="Users"
  icon={<UsersIcon size={18} className="text-orange-500" />}
  value={loadingUsers || isEmpty ? "-" : totalUsers}
  percentage={
    loadingUsers || isEmpty
      ? "-"
      : `${usersPercentage}% active`
  }
  isUp={usersPercentage >= 50}
  isEmpty={isEmpty}
/>


<SummaryCard
title="Vendors"
icon={<Store size={18} className="text-blue-500" />}
value={loadingVendors || isEmpty ? "-" : totalVendors}
percentage={
loadingVendors || isEmpty
? "-"
: `${vendorsPercentage}% active`
}
isUp={vendorsPercentage >= 50}
isEmpty={isEmpty}
/>


        {/* ✅ DEALS CARD (LIVE DATA) */}
        <SummaryCard
    title="Deals"
    icon={<LayoutGrid size={18} className="text-red-500" />}
    value={loadingDeals || isEmpty ? "-" : totalDeals}
    percentage={
      loadingDeals || isEmpty
        ? "-"
        : `${availableDeals} approved`
    }
    isUp={availableDeals > 0}
    isEmpty={isEmpty}
  />

      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-8 space-y-6">
          <SectionCard
            title="Deals"
            icon={<LayoutGrid className="text-red-500" size={18} />}
            isEmpty={isEmpty}
          >
            {isEmpty ? (
              <EmptyState />
            ) : (
              <DealsTable deals={deals} loading={loadingDeals} />
            )}
          </SectionCard>

          <SectionCard
            title={activeTab}
            icon={
              activeTab === "Vendors" ? (
                <Store className="text-blue-500" size={18} />
              ) : (
                <UsersIcon className="text-orange-500" size={18} />
              )
            }
            isEmpty={isEmpty}
            tabs={["Vendors", "Users"]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
          {isEmpty ? (
<EmptyState />
) : activeTab === "Vendors" ? (
<VendorsTable vendors={vendors} loading={loadingVendors} />
) : (
<UsersTable users={users} loading={loadingUsers} />
)}
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-4 space-y-6">
          <SectionCard title="Revenues" icon={<Wallet className="text-green-500" size={18} />} filter="Monthly">
            <div className="flex flex-col items-center">
              <div className="w-full mb-4">

                <div className="flex items-center gap-2 mb-1">
      <div className="bg-[#002244] text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
        NGN <ChevronDown size={10} />
      </div>
      <span className="text-2xl font-black text-gray-900">
        {isEmpty || loadingRevenue
          ? "0.00"
          : totalRevenue.toLocaleString("en-NG", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
      </span>
    </div>

              </div>
              <div className="relative h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={isEmpty ? EMPTY_PIE : REVENUE_PIE} innerRadius={60} outerRadius={80} paddingAngle={isEmpty ? 0 : 5} dataKey="value">
                      {(isEmpty ? EMPTY_PIE : REVENUE_PIE).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {!isEmpty && (
      <div className="absolute top-1/2 right-0 -translate-y-1/2 space-y-2 text-[10px] font-bold">
        {REVENUE_PIE.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-1 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-400 w-16 uppercase">{item.name}</span>
            <span className="text-gray-900">
              ₦{item.value.toLocaleString("en-NG", { minimumFractionDigits: 0 })}
            </span>
          </div>
        ))}
      </div>
    )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
    title="Users"
    icon={<UsersIcon className="text-orange-500" size={18} />}
    filter="Weekly"
  >
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={loadingStats || !userStats ? [] : userStats.newUsersOverTime}
        >
          <XAxis
            dataKey="_id"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: "bold", fill: "#8E8E93" }}
          />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#FF9500" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="grid grid-cols-2 gap-4 mt-4 border-t border-gray-100 pt-4">
      <div className="text-center">
        <p className="text-sm font-black text-gray-900">
          {loadingStats || !userStats ? "-" : userStats.dealsByPlan?.reduce((a:any,b:any)=>a+b.totalDeals,0)}
        </p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Deals Click
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-gray-900">
          {loadingStats || !userStats ? "-" : userStats.usersByPlan?.reduce((a:any,b:any)=>a+b.count,0)}
        </p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Deals View
        </p>
      </div>
    </div>

    <div className="h-32 w-full mt-4 flex justify-center">
      <ResponsiveContainer width="80%" height="100%">
        <PieChart>
          <Pie
            data={loadingStats || !userStats ? EMPTY_PIE : [
              { name: "All", value: userStats.notificationPrefs?.all || 0, color: "#007AFF" },
              { name: "Deals", value: userStats.notificationPrefs?.deals || 0, color: "#FF9500" },
              { name: "Subscription", value: userStats.notificationPrefs?.subscription || 0, color: "#FF3B30" },
              { name: "Withdrawal", value: userStats.notificationPrefs?.withdrawal || 0, color: "#34C759" },
              { name: "System", value: userStats.notificationPrefs?.system || 0, color: "#F2F2F7" },
            ]}
            innerRadius={30}
            outerRadius={45}
            dataKey="value"
          >
            {(loadingStats || !userStats ? EMPTY_PIE : userStats.notificationPrefs ? [
              { name: "All", value: userStats.notificationPrefs?.all || 0, color: "#007AFF" },
              { name: "Deals", value: userStats.notificationPrefs?.deals || 0, color: "#FF9500" },
              { name: "Subscription", value: userStats.notificationPrefs?.subscription || 0, color: "#FF3B30" },
              { name: "Withdrawal", value: userStats.notificationPrefs?.withdrawal || 0, color: "#34C759" },
              { name: "System", value: userStats.notificationPrefs?.system || 0, color: "#F2F2F7" },
            ] : EMPTY_PIE).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="mt-4 space-y-3">
      <p className="text-[11px] font-black text-gray-900">Top States</p>
      <div className="space-y-2">
        <StateItem
          label="Lagos"
          value={loadingStats || !userStats ? "-" : userStats.usersByType?.find((u:any)=>u._id==="Lagos")?.count || 0}
          color="#007AFF"
        />
        <StateItem
          label="Ibadan"
          value={loadingStats || !userStats ? "-" : userStats.usersByType?.find((u:any)=>u._id==="Ibadan")?.count || 0}
          color="#FF3B30"
        />
        <StateItem
          label="Ogun"
          value={loadingStats || !userStats ? "-" : userStats.usersByType?.find((u:any)=>u._id==="Ogun")?.count || 0}
          color="#34C759"
        />
        <StateItem
          label="Other states"
          value={loadingStats || !userStats ? "-" : userStats.usersByType?.filter((u:any)=>!["Lagos","Ibadan","Ogun"].includes(u._id)).reduce((a:any,b:any)=>a+b.count,0)}
          color="#F2F2F7"
        />
      </div>
    </div>
  </SectionCard>
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function SummaryCard({ title, icon, value, percentage, isUp, isEmpty }: any) {
  const chartData = isUp ? SPARKLINE_DATA_UP : SPARKLINE_DATA_DOWN;
  const strokeColor = isEmpty ? "#E5E7EB" : isUp ? "#34C759" : "#FF3B30";

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-black text-gray-900">{title}</span>
        </div>
        <button className="flex items-center gap-1 text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-lg uppercase">
          Monthly <ChevronDown size={12} />
        </button>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-1">{isEmpty ? "-" : value}</h2>
          <div className="flex items-center gap-1">
          <span
  className={`text-[10px] font-bold ${
    isEmpty ? "text-gray-300" : "text-gray-500"
  }`}
>
  {isEmpty ? "-" : percentage}
</span>

          </div>
        </div>
        <div className="h-10 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${title})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, filter, tabs, children, activeTab, onTabChange }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-black text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {tabs && (
            <div className="bg-[#F2F2F7] p-1 rounded-xl flex gap-1">
              {tabs.map((tab: string) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`px-4 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeTab === tab
                      ? 'bg-white shadow-sm text-blue-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
          {filter && (
            <button className="flex items-center gap-1 text-[11px] font-bold text-gray-400 border border-gray-100 px-3 py-1.5 rounded-lg uppercase">
              {filter} <ChevronDown size={14} />
            </button>
          )}
          <button className="text-gray-200"><Calendar size={18} /></button>
        </div>
      </div>
      {children}
    </div>
  );
}



function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <img src="/Group 50.png" alt="Nothing here" className="w-32 h-32 object-contain mb-4" />
      <h4 className="text-sm font-black text-gray-900">Nothing here</h4>
      <p className="text-[11px] text-gray-400 font-bold mt-1">Post a deal and check again</p>
    </div>
  );
}




function DealsTable({ deals = [], loading }: any) {
  // Loading state
  if (loading) {
    return <p className="text-sm text-gray-400">Loading deals...</p>;
  }

  // Empty state
  if (!deals.length) {
    return <p className="text-gray-400 text-sm">No deals found</p>;
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
          <th className="py-4 px-4 text-left align-middle">Product image/Description</th>
          <th className="py-4 px-4 text-left align-middle">Price</th>
          <th className="py-4 px-4 text-left align-middle">Discount</th>
          <th className="py-4 px-4 text-left align-middle min-w-[50px]">Off</th>
          <th className="py-4 px-4 text-left align-middle">Category</th>
          <th className="py-4 px-4 text-left align-middle">Status</th>
          <th className="py-4 px-4 text-left align-middle"></th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-50">
        {deals.map((deal: any) => (
          <tr key={deal._id || deal.id} className="align-middle">
            {/* Product */}
            <td className="py-4 px-4 align-middle">
              <div className="flex items-center gap-3">
                <img
                  src={deal.images?.[1] || deal.images?.[0] || '/placeholder.png'}
                  alt={deal.title || 'Product'}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                />
                <a
    href={deal.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className="text-[11px] font-bold text-gray-900 flex items-center gap-1 hover:text-blue-500"
  >
    {deal.title?.length > 20
      ? `${deal.title.slice(0, 15)}...`
      : deal.title || 'Untitled'}
    <ExternalLink size={10} />
  </a>
              </div>
            </td>

            {/* Original Price */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-400 align-middle">
              {deal.currencySymbol || '₦'}
              {deal.originalPrice ?? '-'}
            </td>

            {/* Discounted Price */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-900 align-middle">
              {deal.currencySymbol || '₦'}
              {deal.discountedPrice ?? '-'}
            </td>

            {/* Discount % */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-900 align-middle min-w-[50px]">
              {deal.discountPercentage ?? 0}%
            </td>

            {/* Category */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-400 capitalize align-middle">
              {deal.category || '-'}
            </td>

            {/* Status */}
            <td className="py-4 px-4 align-middle">
              <span
                className={`px-3 py-1 rounded-md text-[9px] font-bold ${
                  deal.status === 'active'
                    ? 'bg-green-50 text-green-500'
                    : deal.status === 'expired'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-orange-50 text-orange-500'
                }`}
              >
                {deal.status || 'pending'}
              </span>
            </td>

            {/* Actions */}
            <td className="py-4 px-4 align-middle text-center">
              <button className="text-gray-300 hover:text-gray-600">
                <MoreVertical size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



function VendorsTable({ vendors = [], loading }: any) {
  // Loading state
  if (loading) {
    return <p className="text-gray-500 text-sm">Loading vendors...</p>;
  }

  // Empty state
  if (!vendors.length) {
    return <p className="text-gray-400 text-sm">No vendors found</p>;
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
          <th className="py-4 px-4">Vendor image/Name</th>
          <th className="py-4 px-4">Location</th>
          <th className="py-4 px-4">Email address</th>
          <th className="py-4 px-4">Phone no.</th>
          <th className="py-4 px-4">Status</th>
          <th className="py-4 px-4"></th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-50">
        {vendors.map((vendor: any) => (
          <tr key={vendor._id || vendor.id} className="align-middle">
            {/* Vendor Name & Logo */}
            <td className="py-4 px-4">
              <div className="flex items-center gap-3">
                <img
                  src={vendor.businessLogo || '/placeholder.png'}
                  alt={vendor.name || 'Vendor'}
                  className="w-10 h-10 rounded-full object-cover bg-gray-100"
                />
                <p className="text-[11px] font-bold text-gray-900 truncate max-w-[150px]" title={vendor.name}>
    {vendor.name || 'Unnamed Vendor'}
  </p>
              </div>
            </td>

            {/* Location */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-400">
      <div
        className="truncate max-w-[120px]"
        title={`${vendor.location || '-'}, ${vendor.country || '-'}`}
      >
        {vendor.location || '-'}, {vendor.country || '-'}
      </div>
    </td>

            {/* Email */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-400 italic">
              {vendor.businessEmail || '-'}
            </td>

            {/* Phone */}
            <td className="py-4 px-4 text-[11px] font-bold text-gray-400">
              {vendor.businessPhone || '-'}
            </td>

            {/* Status */}
            <td className="py-4 px-4">
              <span className="px-3 py-1 rounded-md text-[9px] font-bold bg-green-50 text-green-500">
                {vendor.status || 'Active'}
              </span>
            </td>

            {/* Actions */}
            <td className="py-4 px-4 text-center">
              <button className="text-gray-300 hover:text-gray-600">
                <MoreVertical size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



function UsersTable({ users = [], loading }: any) {
  // Loading state
  if (loading) {
    return <p className="text-gray-500 text-sm">Loading users...</p>;
  }

  // Empty state
  if (!users.length) {
    return <p className="text-gray-400 text-sm">No users found</p>;
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
          <th className="py-4 px-4">User</th>
          <th className="py-4 px-4">Email</th>
          <th className="py-4 px-4">Role</th>
          <th className="py-4 px-4">Joined</th>
          <th className="py-4 px-4">Status</th>
          <th className="py-4 px-4"></th>
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-50">
        {users.map((user: any) => {
          const email = user.email || "unknown@example.com";
          const username = email.split("@")[0];
          const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-";
          const role = user.role || "Customer";

          return (
            <tr key={user._id || user.id || username} className="align-middle">
              {/* User */}
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-[10px]">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-[11px] font-bold text-gray-900">{username}</p>
                </div>
              </td>

              {/* Email */}
              <td className="py-4 px-4 text-[11px] font-bold text-gray-400">{email}</td>

              {/* Role */}
              <td className="py-4 px-4 text-[11px] font-bold text-gray-400 capitalize">{role}</td>

              {/* Joined */}
              <td className="py-4 px-4 text-[11px] font-bold text-gray-400">{joinedDate}</td>

              {/* Status */}
              <td className="py-4 px-4">
                <span className="px-3 py-1 rounded-md text-[9px] font-bold bg-green-50 text-green-500">
                  Active
                </span>
              </td>

              {/* Actions */}
              <td className="py-4 px-4 text-center">
                <button className="text-gray-300 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}



function StateItem({ label, value, color }: any) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-bold text-gray-400">{label}</span>
      </div>
      <span className="text-[10px] font-black text-gray-900">{value}</span>
    </div>
  );
}
