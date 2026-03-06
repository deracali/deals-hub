"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { VendorHeader } from "../component/VendorHeader";
import { VendorSidebar } from "../component/sidebar";
import {
RefreshCcw
} from 'lucide-react';


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchDashboardData = useCallback(async (brandName) => {
    try {
      setLoading(true);
      // Fetch specifically from our new Analytics endpoint
      const res = await fetch(`https://dealshub-server.onrender.com/api/deals/analytics/${brandName}`);
      const data = await res.json();

      setSalesData(data.salesData || []);
      setActivityData(data.activityData || []);
      setGeoData(data.geoData || []);

      // If there are no deals, show the 'Nothing here' state
      setHasData(data.salesData && data.salesData.some(d => d.total > 0));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.brand) {
      fetchDashboardData(user.brand);
    }
  }, [user, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFF]">
        {/* The Spinner */}
        <div className="relative flex items-center justify-center">
          <RefreshCcw className="w-10 h-10 text-blue-600 animate-spin" />
          {/* Optional: A soft pulse effect behind the spinner */}
          <div className="absolute w-12 h-12 bg-blue-100 rounded-full animate-ping opacity-20" />
        </div>

        {/* Loading Text */}
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Loading analytic
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FDFDFF] font-sans text-slate-900 overflow-hidden">
      {/* 1. SIDEBAR: Fixed and hidden on mobile */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-100">
        <VendorSidebar />
      </div>

      {/* 2. MAIN CONTENT AREA: Scrollable */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 pb-24 relative bg-gray-50">
        <VendorHeader />

        <div className="grid grid-cols-12 gap-6 py-10">
          {/* LEFT COLUMN */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Sales Chart (Status Distribution) */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between mb-8">
                <h2 className="font-bold text-lg">Deal Status (Performance)</h2>
                <div className="flex gap-4 text-xs font-medium text-gray-400">
                  {['All Time'].map(t => (
                    <span key={t} className="text-slate-900 bg-gray-100 px-2 py-1 rounded">{t}</span>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hasData ? salesData : []}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    {hasData && <Tooltip cursor={{ fill: '#f8fafc' }} />}
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="normal" fill="#F97316" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Activity Chart (Views vs Interactions) */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-bold text-lg">Views vs. Clicks</h2>
                <div className="flex gap-4 text-xs font-medium text-gray-400">
                  <span className="text-blue-600 underline cursor-pointer">Top 7 Deals</span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hasData ? activityData : []}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    {hasData && <Tooltip />}
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={true} />
                    <Line type="monotone" dataKey="clicks" stroke="#93C5FD" strokeWidth={2} dot={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Category Pie Chart */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
              <div className="flex justify-between mb-4">
                <h2 className="font-bold text-lg">Category Split</h2>
                <div className="flex items-center text-xs text-gray-500 border rounded px-2 py-1 cursor-pointer">
                  Share <ChevronDown size={14} />
                </div>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={hasData ? geoData : [{ value: 100 }]}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {hasData ? geoData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      )) : <Cell fill="#F1F5F9" />}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Category List */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[300px]">
              <h2 className="font-bold text-lg mb-6">Top Categories</h2>
              {hasData ? (
                <div className="space-y-4">
                  {geoData.map(cat => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm text-gray-400 font-mono">{cat.value} Deals</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Image src="/Group 50.png" alt="No data" width={80} height={80} className="opacity-50 mb-4" />
                  <h3 className="font-bold text-gray-900">No Analytics Yet</h3>
                  <p className="text-sm text-gray-400">Data appears after your first deal.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
