"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Package,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  Store,
  DollarSign,
  Image,
  Boxes,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Hero", href: "/admin/hero", icon: Image },
  { name: "Plan", href: "/admin/plan", icon: DollarSign },
  { name: "Deals", href: "/admin/deals", icon: Package },
  { name: "Vendors", href: "/admin/vendors", icon: Store },
  {
    name: "Curated-Collection",
    href: "/admin/curated-collection",
    icon: Boxes,
  },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Profile", href: "/admin/profile", icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-6 border-b border-sidebar-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Tag className="text-primary-foreground" size={18} />
            </div>
            <span className="text-lg font-semibold text-sidebar-accent-foreground">
              Slyce Admin
            </span>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-sidebar-border">
            <button
              onClick={() => {
                console.log("Logout clicked");
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
