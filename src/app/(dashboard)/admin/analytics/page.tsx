"use client";

import React from 'react';
import {
  TrendingUp, Users, Store, LayoutGrid,
  Wallet, Download, ChevronDown, Tag
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';

// --- Expanded Mock Data ---
const PERFORMANCE_DATA = [
  { name: 'Jan', deals: 200, users: 150, val: 400 },
  { name: 'Feb', deals: 210, users: 160, val: 300 },
  { name: 'Mar', deals: 250, users: 180, val: 500 },
  { name: 'Apr', deals: 230, users: 170, val: 450 },
  { name: 'May', deals: 280, users: 210, val: 600 },
  { name: 'Jun', deals: 260, users: 190, val: 550 },
  { name: 'Jul', deals: 300, users: 240, val: 580 },
  { name: 'Aug', deals: 280, users: 220, val: 620 },
  { name: 'Sep', deals: 350, users: 280, val: 700 },
  { name: 'Oct', deals: 320, users: 260, val: 680 },
  { name: 'Nov', deals: 380, users: 310, val: 750 },
  { name: 'Dec', deals: 400, users: 330, val: 800 },
];

const REVENUE_PIE_DATA = [
  { name: 'Vendors', value: 129, color: '#007AFF' },
  { name: 'Subscriptions', value: 50, color: '#001A33' },
  { name: 'Users', value: 123, color: '#FF9500' },
  { name: 'Affiliate Deals', value: 21, color: '#FF3B30' },
];

const JOURNEY_DATA = [
  { name: 'Onboarding', value: '4,233,290.10K', color: '#002244' },
  { name: 'View deals', value: '1,230,111K', color: '#0055AA' },
  { name: 'Click deals', value: '123.01k', color: '#007AFF' },
  { name: 'Purchase', value: '112.40k', color: '#55AAFF' },
];

// --- Reusable Components ---
const ChartHeader = ({ title, icon: Icon, color, timeframe = "Yearly" }: { title: string, icon: any, color: string, timeframe?: string }) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{title}</h3>
    </div>
    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 border border-gray-100 px-2 py-1 rounded-md uppercase cursor-pointer">
      {timeframe} <ChevronDown size={12} />
    </div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-8 font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <button className="flex items-center gap-2 bg-[#007AFF] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all">
          <Download size={16} /> Export data
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* 1. Revenues (Updated Layout) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Revenues" icon={Wallet} color="text-green-500" timeframe="This Month" />
          <div className="flex items-center justify-between gap-4 h-[180px]">
            <div className="relative w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={REVENUE_PIE_DATA} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                    {REVENUE_PIE_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Floating Tooltip Label */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-md border border-gray-50 z-10">
                <span className="text-[10px] font-black text-gray-900 whitespace-nowrap">200,000,000.00</span>
                <div className="absolute -bottom-1 left-1/2 w-px h-1 bg-gray-300"></div>
              </div>
            </div>
            <div className="w-1/2 space-y-3">
              <p className="text-[9px] text-gray-400 font-bold mb-1 uppercase tracking-wider">Categories <span className="font-normal">(Est. in millions)</span></p>
              {REVENUE_PIE_DATA.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-gray-900">{item.value}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Deal Performance */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Deal Performance Metric" icon={TrendingUp} color="text-red-500" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#9CA3AF'}} />
                <Tooltip />
                <Area type="monotone" dataKey="deals" stroke="#34C759" fill="url(#colorGreen)" strokeWidth={3} />
                <Area type="monotone" dataKey="users" stroke="#FF3B30" fill="transparent" strokeWidth={3} strokeDasharray="5 5" />
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. User Journey Map */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Users Journey Map" icon={Users} color="text-blue-500" timeframe="This Month" />
          <div className="space-y-4">
            {JOURNEY_DATA.map((step, i) => (
              <div key={step.name}>
                <div className="flex justify-between text-[10px] font-black text-gray-400 mb-1 uppercase">
                   <span>{step.name}</span>
                   <span>{step.value}</span>
                </div>
                <div className="h-10 w-full bg-gray-50 rounded-lg overflow-hidden">
                  <div className="h-full transition-all duration-700" style={{ backgroundColor: step.color, width: `${100 - (i * 18)}%`, opacity: 1 - (i * 0.12) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Top States */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Top States" icon={LayoutGrid} color="text-orange-500" />
          <div className="grid grid-cols-2 gap-8 items-center h-[200px]">
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={REVENUE_PIE_DATA} innerRadius={0} outerRadius={80} dataKey="value" stroke="none">
                    {REVENUE_PIE_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {['Lagos', 'Ibadan', 'Ogun', 'Other states'].map((s, i) => (
                <div key={s} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-[11px] font-bold text-gray-400">{s}</span>
                  <span className="text-xs font-black text-gray-900">{[150, 37.5, 25, 12.5][i]}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Subscriptions */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Subscriptions" icon={LayoutGrid} color="text-orange-500" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA}>
                <Tooltip cursor={{stroke: '#FF9500', strokeWidth: 1}} />
                <Area type="stepAfter" dataKey="val" stroke="#FF9500" fill="#FFF8F0" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Vendors */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Vendors" icon={Store} color="text-blue-500" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="name" hide />
                <Tooltip cursor={{fill: '#F8F9FB'}} />
                <Bar dataKey="deals" fill="#002244" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="users" fill="#007AFF" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Users */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Users" icon={Users} color="text-orange-500" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <Bar dataKey="users" fill="#34C759" radius={[2, 2, 0, 0]} barSize={4} />
                <Bar dataKey="deals" fill="#FF9500" radius={[2, 2, 0, 0]} barSize={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Deals */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <ChartHeader title="Deals" icon={Tag} color="text-red-500" />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <Tooltip />
                <Line type="monotone" dataKey="val" stroke="#002244" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="deals" stroke="#FF9500" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="users" stroke="#007AFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
