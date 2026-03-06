"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, ChevronDown, Store } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export function VendorStats() {
  const [vendors, setVendors] = useState<any[]>([]);

  // 🔹 FETCH vendors (logic only)
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("https://dealshub-server.onrender.com/api/vendors/get");
        const json = await res.json();

        // ✅ YOUR API SHAPE
        const list = Array.isArray(json) ? json : json.data || [];
        setVendors(list);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
        setVendors([]);
      }
    };

    fetchVendors();
  }, []);


  // 🔹 TOTAL vendors
  const totalVendors = vendors.length;

  // 🔹 MONTHLY chart data (status-based)
  const data = useMemo(() => {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const base = months.map(m => ({
      name: m,
      verified: 0,
      unverified: 0
    }));

    vendors.forEach(v => {
      if (!v.createdAt) return;

      const monthIndex = new Date(v.createdAt).getMonth();

      if (v.status === "active") {
        base[monthIndex].verified += 1;
      } else if (v.status === "pending" || v.status === "rejected") {
        base[monthIndex].unverified += 1;
      }
    });

    return base;
  }, [vendors]);

  return (
    <div className="w-full bg-[#FDFDFD] mb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

        {/* Total Amount Section (UI UNCHANGED) */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
             <div className="bg-[#007AFF] p-1.5 rounded-md">
                <Store className="text-white w-3.5 h-3.5" />
             </div>
             <span className="text-[16px] font-bold text-[#0F172A]">Vendors</span>
          </div>

          {/* 🔥 REAL TOTAL */}
          <h2 className="text-[32px] font-black text-[#0F172A] leading-tight tracking-tight">
            {totalVendors.toLocaleString()}
          </h2>

          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp size={16} className="text-[#22C55E] stroke-[2.5]" />
            <span className="text-[12px] font-bold text-[#22C55E]">Live</span>
            <span className="text-[12px] text-gray-400 font-medium tracking-tight">
              vendor data
            </span>
          </div>
        </div>

        {/* Graph Section (UI UNCHANGED) */}
        <div className="flex-1 w-full max-w-3xl h-[180px] relative mt-4 lg:mt-0">

          <div className="absolute -top-12 right-0 flex items-center gap-4">
             <div className="flex items-center gap-6 mr-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1.5 bg-[#1E3A8A] rounded-full"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1.5 bg-[#60A5FA] rounded-full"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Unverified
                  </span>
                </div>
             </div>

            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-600 bg-white shadow-sm hover:bg-gray-50">
              Monthly <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 0, left: -40, bottom: 0 }}
              barGap={4}
            >
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <Tooltip cursor={{ fill: "transparent" }} content={() => null} />

              <Bar dataKey="verified" fill="#1E3A8A" radius={[2, 2, 0, 0]} barSize={4} />
              <Bar dataKey="unverified" fill="#60A5FA" radius={[2, 2, 0, 0]} barSize={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
