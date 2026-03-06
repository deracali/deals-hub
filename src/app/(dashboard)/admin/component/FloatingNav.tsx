"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Tag,
  Users,
  Store,
  User,
  Gift,
  Star,
  FileText,
  Cpu,
  Layout,
  PieChart,
  MessagesSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the path for each nav item
const navItems = [
  { icon: Home, label: "Home", path: "/admin" },
  { icon: Tag, label: "Deals", path: "/admin/deals" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Store, label: "Vendors", path: "/admin/vendors" },
  { icon: User, label: "Profile", path: "/admin/profile" },
  { icon: Gift, label: "Coupons", path: "/admin/coupons" },
  { icon: Star, label: "Curated", path: "/admin/curated-collection" },
  { icon: FileText, label: "Summary", path: "/admin/summary" },
  { icon: MessagesSquare, label: "Forum", path: "/admin/forum" },
  { icon: Cpu, label: "Hero", path: "/admin/hero" },
  { icon: Layout, label: "Plan", path: "/admin/plan" },
];

export function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname(); // Get current route

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-[#007AFF] p-1.5 rounded-[30px] shadow-2xl shadow-blue-200/50">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.path; // Check current path dynamically

          return (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-[#0F172A] text-white px-5 py-2.5 rounded-[24px] gap-2"
                  : "text-white/90 hover:text-white w-12 h-12 rounded-full"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="text-[14px] font-bold tracking-tight pr-1">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
