"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Trash2,
  Trophy,
  BadgeCheck,
  Zap,
  Tag,
  CreditCard,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const notificationIcons: Record<string, JSX.Element> = {
  ORDER_STATUS_UPDATE: <Zap className="text-blue-500 w-4 h-4" />,
  SHIPPING_UPDATE: <CreditCard className="text-green-500 w-4 h-4" />,
  DEAL_APPROVED: <BadgeCheck className="text-blue-400 w-4 h-4" />,
  NEW_ORDER: <Tag className="text-green-500 w-4 h-4" />,
  ORDER_CREATED: <Trophy className="text-orange-400 w-4 h-4" />,
  WITHDRAWAL_SUCCESS: <CreditCard className="text-emerald-500 w-4 h-4" />,
  DEFAULT: <Bell className="text-gray-400 w-4 h-4" />,
};

export function VendorHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localUser, setLocalUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("Good Morning 👋");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = "https://dealshub-server.onrender.com/api/notifications";

  // 1. Update the function to accept the user object directly
  const fetchNotifications = async (userObj: any) => {
    if (!userObj?._id) return;

    try {
      const res = await fetch(`${API_URL}/user/${userObj._id}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();

      const filtered = data.filter((n: any) => {
        // FIX: Changed 'freshUser' to 'userObj'
        const prefs = userObj.notifications;

        if (!prefs || prefs.all) return true;

        switch (n.type) {
          case "DEAL_CREATED":
          case "DEAL_APPROVED":
            return !!prefs.deals;

          case "NEW_ORDER":
          case "ORDER_CREATED":
          case "ORDER_STATUS_UPDATE":
          case "SHIPPING_UPDATE":
            return !!prefs.orders;

          case "SYSTEM":
            return !!prefs.system;

          case "SUBSCRIPTION_UPDATE":
            return !!prefs.subscription;

          case "WITHDRAWAL_SUCCESS":
          case "WITHDRAWAL_REQUEST":
          case "PAYMENT_COMPLETED":
            return !!prefs.withdrawal;

          default:
            return false;
        }
      });

      setNotifications(filtered);
      setUnreadCount(filtered.filter((n: any) => !n.isRead).length);

    } catch (err) {
      console.error("❌ Notification fetch failed:", err);
    }
  };

  // 2. Update the init useEffect to pass 'parsed' into the function
  useEffect(() => {
    const init = async () => {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (!parsed?._id) return;

        setLocalUser(parsed);

        const hour = new Date().getHours();
        if (hour >= 12 && hour < 17) setGreeting("Good Afternoon ☀️");
        else if (hour >= 17) setGreeting("Good Evening 🌙");

        // Pass the parsed object directly here to avoid waiting for state update
        await fetchNotifications(parsed);

      } catch (err) {
        console.error("Invalid user in localStorage");
      }
    };

    init();
  }, []);


  const handleNotificationClick = (n: any) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      markAsRead(n._id);
    }
  };

  const markAsRead = async (id: string) => {
    if (!localUser?._id) return;
    try {
      const res = await fetch(`${API_URL}/${id}/read/${localUser._id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!localUser?._id) return;
    try {
      const res = await fetch(`${API_URL}/read-all/${localUser._id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-20 bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-2 min-w-[150px]">
        <Link href="/" className="flex items-center">
          <Image src="/logo-black.png" alt="Logo" width={113} height={40} priority />
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search here"
            className="w-full bg-[#F9FAFB] border-none rounded-xl py-3 pl-11 pr-4 text-[13px] outline-none placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isOpen ? "bg-blue-600" : "bg-[#7DD3FC]"
            }`}
          >
            <Bell className="text-white w-5 h-5" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}

          {isOpen && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  <button
                    className="text-blue-500 text-[10px] flex items-center gap-1 hover:underline"
                    onClick={markAllAsRead}
                  >
                    Clear all <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* --- Hidden Scrollbar Container --- */}
                <div
                  className="space-y-5 max-h-[400px] overflow-y-auto pr-1"
                  style={{
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none', /* IE and Edge */
                  }}
                >
                  {/* Webkit Specific Styles for Chrome/Safari */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}} />

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className="flex gap-3 relative group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="mt-1 shrink-0">
                          {notificationIcons[n.type] || notificationIcons.DEFAULT}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-[11px] font-bold text-slate-800 leading-tight">
                            {n.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] text-slate-300">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-center text-slate-400 py-4">
                      No notifications yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-medium leading-tight">{greeting}</p>
            <p className="text-[13px] font-bold text-gray-900 leading-tight">
              {localUser?.name || "Vendor"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={localUser?.photo || `https://avatar.vercel.sh/${localUser?.name}`}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown className="text-gray-400 w-4 h-4 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  {notificationIcons[selectedNotification.type] || notificationIcons.DEFAULT}
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {selectedNotification.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                {selectedNotification.message}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <span className="text-[10px] text-slate-400 font-medium">
                  {new Date(selectedNotification.createdAt).toLocaleDateString()} at{" "}
                  {new Date(selectedNotification.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
