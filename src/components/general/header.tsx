"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/icon";
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  User,
  Package,
  Heart,
  LogOut,
} from "lucide-react";
import { Input } from "../ui/input";
import { useAuth } from "@/context/auth-context";

interface UserLocal {
  name?: string;
  photo?: string | null;
  savedDeals?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);

  const { user, isAuthenticated, signOut } = useAuth();
  const [savedDealsCount, setSavedDealsCount] = useState<number>(0);

  const navigationItems = [
    { label: "Deals", path: "/deals", icon: "Tag" },
    { label: "Submit Deal", path: "/deals/post", icon: "Plus" },
    { label: "Vendors", path: "/vendors", icon: "User" },
    { label: "Community", path: "/forum", icon: "Users" },
  ];

  const isActivePath = (path: string) => location === path;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (!raw) {
        setCartCount(0);
        return;
      }
      const parsed = JSON.parse(raw);
      setCartCount(
        Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
      );
    } catch (err) {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedDeals");
      if (!raw) {
        setSavedDealsCount(0);
        return;
      }
      const parsed = JSON.parse(raw);
      setSavedDealsCount(
        Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length,
      );
    } catch (err) {
      setSavedDealsCount(0);
    }
  }, []);

  const getDisplayName = (u?: UserLocal) => {
    if (!u) return "User";

    if (u.name) return u.name;

    const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
    if (fullName) return fullName;

    if (u.email) {
      return u.email.split("@")[0];
    }

    return "User";
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    }
  };

  const avatarInitials = (u?: UserLocal) => {
    if (u?.firstName && u?.lastName) {
      return (u.firstName[0] + u.lastName[0]).toUpperCase();
    }

    if (u?.name) {
      return u.name.slice(0, 2).toUpperCase();
    }

    if (u?.email) {
      return u.email.split("@")[0].slice(0, 2).toUpperCase();
    }

    return "U";
  };

  const cartBadgeCount = cartCount;

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="w-full bg-[#0d9cff] select-none relative z-50">
      {/* Top row */}
      <div className="container mb-4 mx-auto px-4 py-3 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-white.png"
            alt="Slyce Logo"
            width={113}
            height={40}
            className="block"
            priority
          />
        </Link>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 justify-center px-6">
          <div className="relative w-full max-w-3xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Browse or search deals by category, vendor, or discount %."
              className="w-full rounded-md pl-11 pr-14 py-2.5 bg-white border-none focus-visible:ring-0"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0d9cff] text-white rounded-md px-3 py-2">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={20} color="white" />
          </button>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="text-white font-medium">
                  Log in
                </Link>
                <Link
                  href="/join"
                  className="bg-white text-[#0d9cff] px-4 py-2 rounded-md font-medium shadow-sm"
                >
                  Register <span className="font-bold">+</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Saved Deals */}
                <Link
                  href="/"
                  className="w-10 h-10 rounded-full bg-[#5EB3FD] flex items-center justify-center relative"
                >
                  <Image
                    src="/ChatCircleText.png"
                    alt="Saved"
                    width={18}
                    height={18}
                  />
                  {savedDealsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] text-[9px] font-bold text-white bg-[#FE811D] rounded-full flex items-center justify-center">
                      {savedDealsCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon & Modal Trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsCartOpen(!isCartOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-10 h-10 rounded-full bg-[#5EB3FD] flex items-center justify-center"
                  >
                    <div className="relative">
                      <Image
                        src="/Handbag.png"
                        alt="Cart"
                        width={18}
                        height={18}
                      />
                      {cartBadgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] text-[9px] font-bold text-white bg-[#FE811D] rounded-full flex items-center justify-center">
                          {cartBadgeCount}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* CART MODAL (from image) */}
                  {isCartOpen && (
                    <div className="absolute right-0 mt-4 w-[450px] bg-white rounded-xl shadow-2xl p-5 text-gray-800 animate-in fade-in zoom-in duration-200">
                      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-4 group"
                          >
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-4 h-4 accent-[#0d9cff] rounded"
                            />
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src="/placeholder-product.png"
                                alt="product"
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[13px] font-medium leading-tight text-gray-600">
                                Apple AirPods Pro (2nd Generation) with MagSafe
                                Charging Case - Active Noise Cancellation
                              </h4>
                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="font-bold text-sm">
                                  $ 9999.9
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  $ 10000.0
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <button className="w-7 h-7 flex items-center justify-center rounded bg-[#0d9cff20] text-[#0d9cff]">
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold">01</span>
                              <button className="w-7 h-7 flex items-center justify-center rounded bg-[#0d9cff] text-white">
                                <Plus size={14} />
                              </button>
                            </div>
                            <button className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t">
                        <Link
                          href="/deals/cart"
                          className="text-[#0d9cff] text-sm font-medium flex items-center gap-1 hover:underline"
                        >
                          View carts <span className="text-lg">↗</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile & User Menu Modal */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsCartOpen(false);
                    }}
                    className="flex items-center gap-3 text-white"
                  >
                    <div className="text-right leading-tight">
                      <div className="text-sm font-semibold whitespace-nowrap">
                        Hi,{" "}
                        {(user as any)?.firstName ||
                          getDisplayName(user as UserLocal)}
                      </div>
                      <div className="text-[10px] text-white/80">Lagos, NG</div>
                    </div>
                    {(user as any)?.photo ? (
                      <div className="w-9 h-9 relative rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <Image
                          src={(user as any).photo}
                          alt="avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white text-[#0d9cff] flex items-center justify-center font-bold text-sm">
                        {avatarInitials(user as UserLocal)}
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* USER DROPDOWN (from image) */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-4 w-48 bg-white rounded-xl shadow-xl py-2 px-1 border border-gray-50 animate-in fade-in zoom-in duration-150">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg"
                      >
                        <User size={16} /> My account
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg"
                      >
                        <Package size={16} /> Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-lg"
                      >
                        <Heart size={16} /> Wishlist
                      </Link>
                      <div className="mt-2 px-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <LogOut size={16} /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search + Quick Actions */}
      <div className="md:hidden bg-white px-4 pt-3 pb-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Browse or search deals by category, vendor, or discount %."
            className="w-full rounded-md pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 focus-visible:ring-0"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0d9cff] text-white rounded-md px-3 py-1.5">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          {[
            {
              label: "Deals",
              img: "/Group 27.png",
              bg: "bg-red-50",
              path: "/deals",
            },
            {
              label: "Submit Deals",
              img: "/Group 26.png",
              bg: "bg-green-50",
              path: "/deals/post",
            },
            {
              label: "Vendors",
              img: "/Group 30.png",
              bg: "bg-blue-50",
              path: "/vendors",
            },
            {
              label: "Community",
              img: "/Group 31.png",
              bg: "bg-yellow-50",
              path: "/forum",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}
              >
                <Image src={item.img} alt={item.label} width={18} height={18} />
              </div>
              <span className="text-[11px] text-gray-600 font-medium">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="w-full bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6 text-gray-600 text-[13px] font-medium">
            <Link href="/coupons" className="hover:text-[#0d9cff]">
              Coupons
            </Link>
            <Link
              href="/vendors/become"
              className="flex items-center gap-2 hover:text-[#0d9cff]"
            >
              <Image src="/Group 30.png" alt="Vendor" width={16} height={16} />
              <span>Become a Vendor</span>
            </Link>
            <Link
              href="/special-offers"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#fff8f0] text-[#ff7a00] rounded-lg"
            >
              <Image src="/Group 17.png" alt="Offers" width={14} height={14} />
              <span>Special Offers</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {[
              {
                label: "Deals",
                img: "/Group 27.png",
                bg: "bg-red-50",
                path: "/deals",
              },
              {
                label: "Submit Deals",
                img: "/Group 26.png",
                bg: "bg-green-50",
                path: "/deals/post",
              },
              {
                label: "Vendors",
                img: "/Group 30.png",
                bg: "bg-blue-50",
                path: "/vendors",
              },
              {
                label: "Community",
                img: "/Group 31.png",
                bg: "bg-yellow-50",
                path: "/forum",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="flex flex-col items-center group"
              >
                <div
                  className={`w-9 h-9 rounded-full ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Image
                    src={item.img}
                    alt={item.label}
                    width={16}
                    height={16}
                  />
                </div>
                <span className="text-[10px] mt-1 text-gray-500 font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="md:hidden" />
        </div>
      </div>

      {/* Mobile drawer/menu */}
      {/* Mobile drawer/menu */}
{isMenuOpen && (
  <div className="md:hidden fixed inset-0 top-[72px] z-40 bg-white flex flex-col">

    {/* 1. AUTHENTICATION SECTION (TOP OF MENU) */}
    {/* 1. AUTHENTICATION SECTION (TOP OF MENU) */}
  <div className="px-6 py-8 border-b bg-gray-50">
    {!isAuthenticated ? (
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900">Welcome to Slyce</h3>
          <p className="text-sm text-gray-500">Join our community to start saving.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex-1 py-3 text-center border-2 border-[#0d9cff] text-[#0d9cff] font-bold rounded-xl text-sm"
          >
            Log in
          </Link>
          <Link
            href="/join"
            onClick={() => setIsMenuOpen(false)}
            className="flex-1 py-3 text-center bg-[#0d9cff] text-white font-bold rounded-xl text-sm shadow-md"
          >
            Register +
          </Link>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Profile Image Part */}
            <div className="w-14 h-14 relative rounded-full overflow-hidden border-2 border-[#0d9cff]">
              {(user as any)?.photo ? (
                <Image src={(user as any).photo} alt="avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0d9cff] text-white flex items-center justify-center font-bold text-xl">
                  {avatarInitials(user as UserLocal)}
                </div>
              )}
            </div>
            {/* Name and Location */}
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                Hi, {(user as any)?.firstName || getDisplayName(user as UserLocal)}
              </h3>
              <p className="text-xs text-gray-500">Lagos, Nigeria</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-3 bg-red-50 text-red-500 rounded-full"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* NEW: Mobile Cart and Saved Deals (Large Screen Style) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="w-12 h-12 rounded-full bg-[#5EB3FD] flex items-center justify-center relative shadow-sm"
          >
            <Image
              src="/ChatCircleText.png"
              alt="Saved"
              width={22}
              height={22}
            />
            {savedDealsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-[#FE811D] rounded-full flex items-center justify-center border-2 border-white">
                {savedDealsCount}
              </span>
            )}
          </Link>

          <Link
            href="/deals/cart"
            onClick={() => setIsMenuOpen(false)}
            className="w-12 h-12 rounded-full bg-[#5EB3FD] flex items-center justify-center relative shadow-sm"
          >
            <Image
              src="/Handbag.png"
              alt="Cart"
              width={22}
              height={22}
            />
            {cartBadgeCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-[#FE811D] rounded-full flex items-center justify-center border-2 border-white">
                {cartBadgeCount}
              </span>
            )}
          </Link>
          <span className="text-sm font-medium text-gray-500 ml-auto">Quick Access</span>
        </div>
      </div>
    )}
  </div>

    {/* 2. PROFILE QUICK LINKS (Only if logged in) */}
    {isAuthenticated && (
      <div className="grid grid-cols-3 gap-2 px-6 py-4 border-b">
        <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 p-2">
          <User size={20} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">Account</span>
        </Link>
        <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 p-2">
          <Package size={20} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">Orders</span>
        </Link>
        <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center gap-1 p-2">
          <Heart size={20} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-600">Wishlist</span>
        </Link>
      </div>
    )}

    {/* 3. NAVIGATION LINKS (Existing Links) */}
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      <div className="space-y-4">
        <Link href="/coupons" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-medium">
          Coupons
        </Link>
        <Link href="/vendors/become" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium">
          <Image src="/Group 30.png" alt="Vendor" width={20} height={20} />
          Become a Vendor
        </Link>
      </div>

      <div className="pt-6 border-t space-y-5">
        {[
          { label: "Deals", img: "/Group 27.png", path: "/deals", bg: "bg-red-50" },
          { label: "Submit Deals", img: "/Group 26.png", path: "/deals/post", bg: "bg-green-50" },
          { label: "Vendors", img: "/Group 30.png", path: "/vendors", bg: "bg-blue-50" },
          { label: "Community", img: "/Group 31.png", path: "/forum", bg: "bg-yellow-50" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.path}
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
              <Image src={item.img} alt={item.label} width={18} height={18} />
            </div>
            <span className="text-gray-800 font-bold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
)}
    </header>
  );
};

export default Header;
