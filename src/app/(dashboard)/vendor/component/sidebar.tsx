"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Tag,
  Package,
  Banknote,
  PieChart,
  ShoppingCart,
  Boxes,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Updated navigation based on Vendor FloatingNav
const navigation = [
  { name: "Home", href: "/vendor", icon: Home },
  { name: "Deals", href: "/vendor/deals", icon: Tag },
  { name: "Group Deals", href: "/vendor/group-deals", icon: Package },
  { name: "Wallet", href: "/vendor/wallet", icon: Banknote },
  { name: "Analytics", href: "/vendor/analytic", icon: PieChart },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Group Orders", href: "/vendor/group-orders", icon: Boxes },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-2 px-6 py-8">
          <img
  src="/logo.png"
  alt="Slyce Admin"
  className="h-8 w-auto"
/>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                    isActive
                      ? "bg-blue-500 text-white shadow-md shadow-gray-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
