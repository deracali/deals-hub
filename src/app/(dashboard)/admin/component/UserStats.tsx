"use client";

import React, { useEffect, useMemo, useState } from "react";
import { TrendingDown, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

export function UserStats() {
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  // 🔹 FETCH users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://dealshub-server.onrender.com/api/users");
        const json = await res.json();

        setUsers(json.users || []);
        setTotalUsers(json.pagination?.total ?? json.users?.length ?? 0);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
        setTotalUsers(0);
      }
    };

    fetchUsers();
  }, []);

  // 🔹 Chart data (Type-based: regular vs vendor)
  const data = useMemo(() => {
    const regularCount = users.filter(u => u.type === "regular").length;
    const vendorCount = users.filter(u => u.type === "vendor").length;

    // Single data point so chart works with existing UI
    return [{
      name: "Users",
      male: regularCount,   // will show as "male" bar
      female: vendorCount   // will show as "female" bar
    }];
  }, [users]);

  return (
    <div className="w-full bg-white mb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

        {/* Total Users */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3 text-gray-900">
             <div className="bg-[#F97316] p-1.5 rounded-md">
                <span className="text-white block leading-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
             </div>
             <span className="text-[15px] font-bold text-gray-800">Users</span>
          </div>

          <h2 className="text-[40px] font-black text-gray-900 leading-tight tracking-tight">
            {totalUsers.toLocaleString()}
          </h2>

          <div className="flex items-center gap-1 mt-1">
            <TrendingDown size={14} className="text-red-500 stroke-[3]" />
            <span className="text-[12px] font-bold text-red-500">Live</span>
            <span className="text-[12px] text-gray-400 font-medium tracking-tight">
              user data
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 w-full max-w-3xl h-[200px] relative">
          <div className="absolute -top-4 right-0 flex items-center gap-6">
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-[#10B981] rounded-full"></span> Regular
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-[#F97316] rounded-full"></span> Vendor
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-500 bg-white">
              Overview <ChevronDown size={14} className="text-gray-400" />
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
        tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
        dy={10}
      />

      {/* Custom tooltip */}
      <Tooltip
        cursor={{ fill: "transparent" }}
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white border shadow-lg rounded p-2 text-sm">
                <p className="font-bold">{label}</p>
                {payload.map(p => {
                  const typeName = p.dataKey === "male" ? "Regular" : "Vendor";
                  return (
                    <p key={p.dataKey} className="text-gray-700">
                      {typeName}: {p.value}
                    </p>
                  );
                })}
              </div>
            );
          }
          return null;
        }}
      />

      <Bar dataKey="female" fill="#10B981" radius={[1, 1, 0, 0]} barSize={40} />
      <Bar dataKey="male" fill="#F97316" radius={[1, 1, 0, 0]} barSize={40} />
    </BarChart>
  </ResponsiveContainer>

        </div>

      </div>
    </div>
  );
}
