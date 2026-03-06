"use client";

import React, {useEffect, useState} from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


export function AdminHeader() {
  const [localUser, setLocalUser] = React.useState<any>(null);
const [greeting, setGreeting] = React.useState("Good Morning 👋");

useEffect(() => {
  const raw = localStorage.getItem("user");
  if (raw) {
    const parsed = JSON.parse(raw);
    setLocalUser(parsed);
  }

  const hour = new Date().getHours();
  if (hour >= 12 && hour < 17) setGreeting("Good Afternoon ☀️");
  else if (hour >= 17) setGreeting("Good Evening 🌙");
}, []);

console.log(localUser);
  return (
    <header className="w-full h-20 bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Logo Section */}
      <div className="flex items-center gap-2 min-w-[150px]">

        <Link href="/" className="flex items-center">
          <Image
            src="/logo-black.png"
            alt="Slyce Logo"
            width={113}
            height={40}
            className="block"
            priority
          />
        </Link>
      </div>

      {/* Search Bar - Wide & Minimal */}
      <div className="flex-1 max-w-2xl px-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search here"
            className="w-full bg-[#F9FAFB] border-none rounded-xl py-3 pl-11 pr-4 text-[13px] focus:ring-1 focus:ring-blue-100 outline-none placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-10 h-10 bg-[#7DD3FC] rounded-full flex items-center justify-center cursor-pointer">
            <Bell className="text-white w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
            0
          </span>
        </div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
        <div className="text-right">
          <p className="text-[11px] text-gray-400 font-medium leading-tight">
            {greeting}
          </p>

          <p className="text-[13px] font-bold text-gray-900 leading-tight">
            {localUser?.role === "admin"
              ? `Admin ${localUser?.name?.split(" ")[0] || ""}`
              : localUser?.name || "User"}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
        <img
 src={
   localUser?.photo ||
   `https://avatar.vercel.sh/${localUser?.name || "admin"}`
 }
 alt="User"
 className="w-full h-full object-cover"
 referrerPolicy="no-referrer"
 onError={(e) => {
   e.currentTarget.src = `https://avatar.vercel.sh/${localUser?.name || "admin"}`;
 }}
/>
        </div>

        <ChevronDown className="text-gray-400 w-4 h-4 group-hover:text-gray-600 transition-colors" />
      </div>

      </div>
    </header>
  );
}
