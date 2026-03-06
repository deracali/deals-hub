"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeft, LogOut, CheckCircle2, Star, Briefcase,
  Clock, FileText, Users, CreditCard, Bell,
  ChevronDown, Globe,RefreshCcw, Mail, Phone, MapPin, Edit3, Trash2, UploadCloud, Image as ImageIcon
} from 'lucide-react';
import { VendorHeader } from "../component/VendorHeader";
import { VendorSidebar } from "../component/sidebar";
import { usePaystackPayment } from "@/utils/usePaystackPayment";


// --- Sidebar Component ---
const SettingsSidebar = ({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (id: string) => void;
}) => {
  const menuItems = [
    { id: 'profile', label: 'My Business profile', icon: Briefcase },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'accounts', label: 'Manage Accounts', icon: Users },
    { id: 'subscription', label: 'Subscription & Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notification settings', icon: Bell },
  ];

  return (
    <div className="w-full md:w-64 space-y-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
            activeTab === item.id
              ? 'bg-blue-50 text-blue-600 border border-blue-100'
              : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          <item.icon size={18} />
          {item.label}
          {activeTab === item.id && (
            <div className="ml-auto text-blue-600">›</div>
          )}
        </button>
      ))}
    </div>
  );
};


const DocumentsTab = () => {
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const cacRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleDrop =
    (setter: (file: File | null) => void) =>
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setter(e.dataTransfer.files?.[0] || null);
    };

  const renderPreview = (file: File | null) => {
    if (!file) return null;

    if (file.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="w-14 h-14 object-cover rounded-lg border"
        />
      );
    }

    return <FileText size={36} className="text-red-500" />;
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-50 pb-4">
        <h2 className="text-xl font-bold">My Documents</h2>
        <p className="text-xs text-gray-400 mt-1">
          Upload and manage your business documents
        </p>
      </div>

      {/* CAC Document */}
      <div>
        <label className="text-xs font-medium text-gray-400">
          CAC Document (PDF or Image)
        </label>

        <div
          onClick={() => cacRef.current?.click()}
          onDrop={handleDrop(setCacFile)}
          onDragOver={(e) => e.preventDefault()}
          className="mt-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 transition"
        >
          {cacFile ? (
            <div className="flex flex-col items-center gap-2">
              {renderPreview(cacFile)}
              <p className="text-[11px] font-medium text-gray-600">
                {cacFile.name}
              </p>
            </div>
          ) : (
            <>
              <UploadCloud size={28} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-400">
                Drag & drop or click to upload
              </p>
            </>
          )}

          <input
            ref={cacRef}
            type="file"
            hidden
            accept="application/pdf,image/*"
            onChange={(e) => setCacFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* Business Logo */}
      <div>
        <label className="text-xs font-medium text-gray-400">
          Business Logo (Image only)
        </label>

        <div
          onClick={() => logoRef.current?.click()}
          onDrop={handleDrop(setLogoFile)}
          onDragOver={(e) => e.preventDefault()}
          className="mt-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 transition"
        >
          {logoFile ? (
            <div className="flex flex-col items-center gap-2">
              {renderPreview(logoFile)}
              <p className="text-[11px] font-medium text-gray-600">
                {logoFile.name}
              </p>
            </div>
          ) : (
            <>
              <ImageIcon size={28} className="text-gray-400 mb-2" />
              <p className="text-xs text-gray-400">
                Drag & drop or click to upload
              </p>
            </>
          )}

          <input
            ref={logoRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <button className="flex-1 py-4 border border-gray-100 rounded-xl text-sm font-bold text-gray-400">
          Cancel
        </button>

        <button className="flex-1 py-4 bg-blue-500 text-white rounded-xl text-sm font-bold">
          Save
        </button>
      </div>
    </div>
  );
};


const AccountsTab = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);


  const popup = (message: string) => {
    const div = document.createElement("div");
    div.innerText = message;

    div.className =
      "fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50";

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2000);
  };


  // 1. Get User from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?._id;

  // 2. Initialize accounts with the saved_accounts from the user object if they exist
  const [accounts, setAccounts] = useState<any[]>(user?.saved_accounts || []);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [newAccount, setNewAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAccount({ ...newAccount, [e.target.name]: e.target.value });
  };

  const handleAddAccount = async () => {
    if(!newAccount.bankName || !newAccount.accountNumber) {
        popup("Please fill in bank details");
        return;
    }

    try {
      setSavingAccount(true);
      // Simulate API call or use your existing endpoint
      const res = await fetch("https://dealshub-server.onrender.com/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...newAccount
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local state and UI
      setAccounts((prev) => [...prev, data.account]);
      setShowAddModal(false);
      setNewAccount({ bankName: "", accountNumber: "", accountName: "" });
    } catch (err) {
      console.error(err);
      popup("Failed to add account");
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="border-b border-gray-50 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage accounts</h2>
          {accounts.length > 0 && (
            <button onClick={() => setShowManageModal(true)} className="text-blue-500 text-xs font-bold">
              Manage account
            </button>
          )}
        </div>

        {/* Currency Selector (Static) */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Default Currency type</label>
          <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500">
            <option>Nigerian Naira - NGN</option>
          </select>
        </div>

        {/* Account Selection Logic */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900">Select account</label>

          {accounts.length === 0 ? (
            /* IF NO SAVED ACCOUNTS: Show Empty State */
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-400 mb-4">No bank account added yet</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-bold"
              >
                Add Account Brand
              </button>
            </div>
          ) : (
            /* IF SAVED ACCOUNTS EXIST: List them */
            <div className="space-y-3">
              {accounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{account.account_number || account.accountNumber}</p>
                    <p className="text-xs text-gray-500">
                      <span className="text-blue-600 font-medium">{account.bank_name || account.bankName}</span>
                    </p>
                  </div>
                  <input type="radio" name="selectedAccount" className="h-5 w-5 accent-blue-600" defaultChecked={index === 0} />
                </div>
              ))}

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full rounded-lg border border-dashed border-blue-400 bg-blue-50 py-3 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
              >
                + Add another account
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6">
          <button className="flex-1 py-4 border border-gray-100 rounded-xl text-sm font-bold text-gray-400">Cancel</button>
          <button className={`flex-1 py-4 rounded-xl text-sm font-bold ${accounts.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
            Save as default
          </button>
        </div>
      </div>

      {/* ADD MODAL with Bank Name field */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-lg font-extrabold mb-6">Add Account Brand</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Bank Name (Brand)</label>
                <input
                  name="bankName"
                  placeholder="e.g. PalmPay, Kuda, Access"
                  onChange={handleAccountChange}
                  className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Account Number</label>
                <input
                  name="accountNumber"
                  placeholder="Enter 10-digit number"
                  onChange={handleAccountChange}
                  className="w-full mt-2 p-4 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-gray-400 font-bold">Cancel</button>
              <button
                onClick={handleAddAccount}
                className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-bold"
                disabled={savingAccount}
              >
                {savingAccount ? "Saving..." : "Save Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SubscriptionTab = () => {
  const [autoRenew, setAutoRenew] = useState(true);
  const { paystackReady, openPaystackPayment } = usePaystackPayment();

  const proFeatures = [
    { label: "Upload 10 products monthly", icon: "📦", iconBg: "bg-green-100" },
    { label: "Track clicks & views analytics", icon: "📈", iconBg: "bg-orange-100" },
    { label: "Boost your deal visibility", icon: "🚀", iconBg: "bg-red-100" },
  ];

  const premiumFeatures = [
    { label: "Upload 25 products monthly", icon: "📦", iconBg: "bg-green-100" },
    { label: "Track clicks & views analytics", icon: "📈", iconBg: "bg-orange-100" },
    { label: "Premium badge", icon: "🛡️", iconBg: "bg-blue-100" },
    { label: "2 free Boost for more visibility", icon: "🚀", iconBg: "bg-red-100" },
    { label: "Feature placements", icon: "📍", iconBg: "bg-orange-100" },
  ];

  const popup = (message: string) => {
    const div = document.createElement("div");
    div.innerText = message;

    div.className =
      "fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50";

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2000);
  };


  const handlePayment = (plan: "Pro" | "Premium", amount: number) => {
    if (!paystackReady) {
      popup("Paystack is not ready yet. Please try again shortly.");
      return;
    }

    openPaystackPayment({
      email: "customer@example.com", // Replace with user's email
      amount: amount * 100, // Paystack expects kobo
      businessName: plan,
      onSuccess: (transaction) => {
        popup(`${plan} plan payment successful!`);
        console.log("Transaction:", transaction);
      },
      onCancel: () => {
        popup(`${plan} plan payment was cancelled.`);
      },
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Subscription & Plan payment</h2>
      </div>

      {/* Current Plan Banner */}
      <div className="relative overflow-hidden bg-orange-50 border border-orange-100 rounded-[2rem] p-6 flex items-center gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          <Star className="text-orange-500 fill-orange-500" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900">You are on Premium plan</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Your subscription expires 16th, November, 2025{" "}
            <button className="text-orange-600 font-bold hover:underline ml-1">Renew Plan</button>
          </p>
        </div>
      </div>

      {/* Auto-renewal Toggle */}
      <div className="flex items-center justify-between max-w-2xl">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-500">Allow auto-renewal</p>
          <p className="text-[10px] text-orange-400 italic flex items-center gap-1">
            <Clock size={10} /> If turned on, your subscription will be renewed via your wallet
          </p>
        </div>
        <button
          onClick={() => setAutoRenew(!autoRenew)}
          className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${autoRenew ? "bg-green-500" : "bg-gray-200"}`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
              autoRenew ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Upgrade Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Upgrade via subscription plans</h3>
          <p className="text-xs text-gray-400 mt-1">Choose your preferred subscription plan to upgrade your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pro Plan */}
          <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-shadow group">
            <div className="relative h-44 bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 p-8 flex flex-col justify-end">
              <div className="absolute top-6 left-6 flex gap-2">
                <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> Popular
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">Recommended</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-3xl font-extrabold text-gray-900 flex items-baseline gap-1">
                  ₦5,000 <span className="text-xs font-bold text-gray-800/70">/month (Pro)</span>
                </h4>
              </div>
              <span className="absolute right-[-10%] bottom-[-10%] text-9xl font-black text-white/20 select-none group-hover:scale-110 transition-transform">Pro</span>
            </div>

            <div className="p-8 space-y-4">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 ${f.iconBg} rounded-md flex items-center justify-center text-[10px]`}>{f.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{f.label}</span>
                </div>
              ))}

              {/* Paystack button */}
              <button
                onClick={() => handlePayment("Pro", 5000)}
                className="w-full mt-4 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
              >
                Subscribe to Pro
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="border border-gray-100 rounded-[2.5rem] overflow-hidden bg-white hover:shadow-xl transition-shadow group">
            <div className="relative h-44 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 flex flex-col justify-end">
              <div className="absolute top-6 left-6">
                <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Large company
                </span>
              </div>
              <div className="relative z-10">
                <h4 className="text-3xl font-extrabold text-gray-900 flex items-baseline gap-1">
                  ₦10,000 <span className="text-xs font-bold text-gray-800/70">/month (Premium)</span>
                </h4>
              </div>
              <span className="absolute right-[-10%] bottom-[-10%] text-7xl font-black text-white/20 select-none group-hover:scale-110 transition-transform uppercase italic">Premium</span>
            </div>

            <div className="p-8 space-y-4">
              {premiumFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 ${f.iconBg} rounded-md flex items-center justify-center text-[10px]`}>{f.icon}</span>
                  <span className="text-xs font-medium text-gray-600">{f.label}</span>
                </div>
              ))}

              {/* Paystack button */}
              <button
                onClick={() => handlePayment("Premium", 10000)}
                className="w-full mt-4 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition"
              >
                Subscribe to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


interface Notifications {
  all: boolean;
  deals: boolean;
  subscription: boolean;
  withdrawal: boolean;
  system: boolean;
  orders: boolean; // NEW: for order notifications
}

const NotificationsTab = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?._id;

  // Default all toggles OFF
  const defaultSettings: Notifications = {
    all: false,
    deals: false,
    subscription: false,
    withdrawal: false,
    system: false,
    orders: false, // default off
  };

  const [settings, setSettings] = useState<Notifications>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load saved settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`https://dealshub-server.onrender.com/api/users/${userId}/notifications`);
        if (!res.ok) throw new Error("Failed to fetch notification settings");
        const data = await res.json();
        if (data.notifications) {
          setSettings(data.notifications);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [userId]);

  const toggleSetting = (key: keyof Notifications) => {
    setSettings((prev) => {
      if (key === "all") {
        const newState = !prev.all;
        return {
          all: newState,
          deals: newState,
          subscription: newState,
          withdrawal: newState,
          system: newState,
          orders: newState, // toggle orders too
        };
      } else {
        const newSettings = { ...prev, [key]: !prev[key] };
        newSettings.all =
          newSettings.deals &&
          newSettings.subscription &&
          newSettings.withdrawal &&
          newSettings.system &&
          newSettings.orders; // include orders
        return newSettings;
      }
    });
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/users/${userId}/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");
      setMessage(data.message || "Settings saved successfully");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const ToggleRow = ({
    title,
    description,
    active,
    onToggle,
  }: {
    title: string;
    description?: string;
    active: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0">
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        {description && <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 relative ${
          active ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200 ${
          active ? "translate-x-6" : "translate-x-0"
        }`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="border-b border-gray-50 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
      </div>

      <div className="bg-white">
        <ToggleRow title="All Notifications" active={settings.all} onToggle={() => toggleSetting("all")} />
        <ToggleRow
          title="Deals"
          description="Get notified when a customer purchases a deal"
          active={settings.deals}
          onToggle={() => toggleSetting("deals")}
        />
        <ToggleRow
          title="Orders"
          description="Get notified when a new order is placed"
          active={settings.orders} // NEW
          onToggle={() => toggleSetting("orders")}
        />
        <ToggleRow
          title="Subscription"
          description="Get notified on your subscription eg. expiry or renewal"
          active={settings.subscription}
          onToggle={() => toggleSetting("subscription")}
        />
        <ToggleRow
          title="Withdrawal & Payment"
          description="Get notified on payments and withdrawal status"
          active={settings.withdrawal}
          onToggle={() => toggleSetting("withdrawal")}
        />
        <ToggleRow
          title="System Updates"
          description="Get notified on system updates and news"
          active={settings.system}
          onToggle={() => toggleSetting("system")}
        />
      </div>

      <div className="flex gap-4 pt-8">
        <button
          className="flex-1 py-4 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition"
          onClick={() => setSettings(settings)}
        >
          Cancel
        </button>
        <button
          className={`flex-1 py-4 bg-blue-500 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={saveSettings}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
    </div>
  );
};



export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loadingVendor, setLoadingVendor] = useState(false);

  const popup = (message: string) => {
    const div = document.createElement("div");
    div.innerText = message;

    div.className =
      "fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50";

    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2000);
  };

  const handleUpdateVendor = async () => {
    try {
      const res = await fetch(
        `https://dealshub-server.onrender.com/api/vendors/update/${vendor._id}`,
        {
          method: "PUT", // or PATCH depending on your route
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vendor),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      popup("Vendor updated successfully");
    } catch (err) {
      console.error(err);
      popup("Failed to update vendor");
    }
  };


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  const fetchVendorByBrand = useCallback(async (brandName) => {
    try {
      setLoadingVendor(true);

      const res = await fetch(
        `https://dealshub-server.onrender.com/api/vendors/name/${encodeURIComponent(brandName)}`
      );
      const result = await res.json();

      // ✅ Match backend response
      if (result?.vendor) {
        setVendor(result.vendor);
      }
    } catch (err) {
      console.error("Error fetching vendor:", err);
    } finally {
      setLoadingVendor(false);
    }
  }, []);

  useEffect(() => {
  if (user?.brand) {
    fetchVendorByBrand(user.brand);
  }
}, [user, fetchVendorByBrand]);

if (loadingVendor) {
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
        Loading vendor details...
      </p>
    </div>
  );
}

if (!vendor && !loadingVendor) {
  return <div>No vendor found for this brand.</div>;
}


return (
  <div className="flex h-screen w-full bg-[#FDFDFF] font-sans text-slate-900 overflow-hidden">
    {/* 1. SIDEBAR: Fixed width and hidden on mobile */}
    <div className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-100">
      <VendorSidebar />
    </div>

    {/* 2. MAIN CONTENT AREA: Scrollable */}
    <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 pb-24 relative bg-white">
      <VendorHeader />

      {/* Header Navigation */}
      <button className="flex items-center gap-2 text-gray-500 text-sm mb-8 font-medium hover:text-slate-800 transition">
        <ArrowLeft size={18} /> Back
      </button>

      {/* Profile Header Card */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={vendor?.businessLogo || "/profile-placeholder.png"}
                alt="Business Profile"
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1">
              <CheckCircle2 size={20} className="text-blue-500 fill-blue-500 text-white" />
            </div>
          </div>

          <div className="max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold">{vendor?.name || "—"}</h1>
              <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                <div className="w-1 h-1 bg-green-600 rounded-full" /> Available
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2 flex items-center justify-center md:justify-start gap-1">
              {vendor?.location} <span className="text-gray-200 mx-1">•</span> <Star size={12} className="text-orange-400 fill-orange-400" /> 4.7 <span className="text-gray-300">(100+)</span>
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {vendor?.description}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-blue-50 text-blue-500 px-3 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
                <FileText size={14} />
                {vendor?.totalDeals ?? 0} Active deals
              </span>
              <span className="bg-orange-50 text-orange-500 px-3 py-2 rounded-lg border border-orange-100 flex items-center gap-2">
                <Clock size={14} /> Response time: Less than 1 hour
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col items-end gap-6">
          <button className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition">
            <LogOut size={16} /> Log out
          </button>

          <div className="text-right space-y-3 hidden md:block">
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase">Company Address:</p>
              <p className="text-xs text-gray-500 max-w-[200px]">{vendor?.businessAddress}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase">Email Address:</p>
              <p className="text-xs text-gray-500">{vendor?.businessEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-300 uppercase">Phone No:</p>
              <p className="text-xs text-gray-500">{vendor?.businessPhone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Settings-specific Sidebar (Local Tabs) */}
        <SettingsSidebar activeTab={activeTab} onChange={setActiveTab} />

        {/* Form Content */}
        <div className="flex-1 max-w-4xl">
          {activeTab === 'profile' && (
            <>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                <h2 className="text-xl font-bold">Business profile</h2>
                <button className="text-blue-500 text-xs font-bold flex items-center gap-1">
                  Edit contact info <Edit3 size={14} />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Business type<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm appearance-none focus:outline-blue-500">
                        <option>General Merchandise</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Business name<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input type="text" value={vendor?.name || ""} readOnly className="w-full p-4 pl-12 bg-white border border-gray-100 rounded-xl" />
                      <Briefcase className="absolute left-4 top-4 text-gray-300" size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Business description<span className="text-red-500">*</span></label>
                  <textarea rows={4} value={vendor?.description || ""} className="w-full p-4 bg-white border border-gray-100 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">CAC Registration number</label>
                    <input type="text" value={vendor?.cacNumber || ""} readOnly className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Business website</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={vendor?.businessWebsite || ""}
                        onChange={(e) => setVendor((prev) => ({ ...prev!, businessWebsite: e.target.value }))}
                        placeholder="Input text field"
                        className="w-full p-4 pl-12 bg-gray-50 border-none rounded-xl text-sm focus:outline-blue-500"
                      />
                      <Globe className="absolute left-4 top-4 text-gray-300" size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Email Address<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="email"
                      value={vendor?.businessEmail || ""}
                      onChange={(e) => setVendor((prev) => ({ ...prev!, businessEmail: e.target.value }))}
                      placeholder="simscloset@email.com"
                      className="w-full p-4 pl-12 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500"
                    />
                    <Mail className="absolute left-4 top-4 text-gray-300" size={18} />
                  </div>
                  <p className="mt-2 text-[10px] text-orange-400 italic">No password needed when you want to sign-in.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Business Phone Number<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={vendor?.businessPhone || ""}
                        onChange={(e) => setVendor((prev) => ({ ...prev!, businessPhone: e.target.value }))}
                        placeholder="+234 800 000 0000"
                        className="w-full p-4 pl-12 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500"
                      />
                      <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">State<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm appearance-none focus:outline-blue-500">
                        <option>Lagos</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-gray-400" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">City<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm appearance-none focus:outline-blue-500">
                        <option>Ikeja</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-4 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Full Business address<span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    value={vendor?.businessAddress || ""}
                    onChange={(e) => setVendor((prev) => ({ ...prev!, businessAddress: e.target.value }))}
                    placeholder="29, Computer village..."
                    className="w-full p-4 bg-white border border-gray-100 rounded-xl text-sm focus:outline-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" className="flex-1 py-4 border border-gray-100 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="button" onClick={handleUpdateVendor} className="flex-1 py-4 bg-blue-500 text-white rounded-xl text-sm font-bold">
                    Save
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'accounts' && <AccountsTab />}
          {activeTab === 'subscription' && <SubscriptionTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
    </main>
  </div>
);
}
