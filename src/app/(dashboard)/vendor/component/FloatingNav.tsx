"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Tag, ShoppingCart, Boxes, Users, Store, Banknote, PieChart, Settings, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/vendor" },
  { icon: Tag, label: "Deals", path: "/vendor/deals" },
  { icon: Package, label: "Group Deals", path: "/vendor/group-deals" }, // New icon
  { icon: Banknote, label: "Wallet", path: "/vendor/wallet" },
  { icon: PieChart, label: "Analytics", path: "/vendor/analytic" },
    { icon: ShoppingCart, label: "Orders", path: "/vendor/orders" },
    { icon: Boxes, label: "Group-Deals", path: "/vendor/group-orders" },
  { icon: Settings, label: "Settings", path: "/vendor/settings" },
];

export function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname(); // current path

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-[#007AFF] p-1.5 rounded-[30px] shadow-2xl shadow-blue-200/50">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          // check if current path matches the nav item
          const isActive = pathname === item.path;

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
