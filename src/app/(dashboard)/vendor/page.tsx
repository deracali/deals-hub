"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  BarChart3,
  Package,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import AppImage from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  fetchDeals,
  addDeal,
  deleteDeal,
  editDeal,
} from "@/services/vendorService";

type Deal = {
  _id?: string;
  title?: string;
  description?: string;
  image?: string;
  oldPrice?: number;
  newPrice?: number;
  status?: string;
  views?: number;
  clicks?: number;
  saves?: number;
  comments?: number;
  createdAt?: string;
  expiresAt?: string;
  revenue?: number;
};

const initialFormState = {
  title: "",
  description: "",
  oldPrice: "",
  newPrice: "",
  category: "",
  url: "",
  expiryDate: "",
  image: "",
};

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "overview" | "deals" | "analytics" | "settings"
  >("overview");
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [vendorDeals, setVendorDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState(initialFormState);

  // Fetch deals on user change / mount
  useEffect(() => {
    fetchDeals(user, setVendorDeals, setError, setLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totalViews = vendorDeals.reduce((s, d) => s + (d.views || 0), 0);
  const maxPossibleViews = vendorDeals.length * 10;

  const stats = {
    totalDeals: vendorDeals.length,
    activeDeals: vendorDeals.filter((d) => d.status === "active").length,
    totalViews,
    totalClicks: totalViews,
    conversionRate:
      vendorDeals.length === 0
        ? 0
        : Math.min(Math.round((totalViews / maxPossibleViews) * 100), 100),
    revenue: vendorDeals.reduce((s, d) => s + (d.revenue || 0), 0),
  } as const;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Submit uses service addDeal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    await addDeal(
      user,
      formState,
      setVendorDeals,
      setError,
      setShowAddDeal,
      () => setFormState(initialFormState),
    );
  };

  // Delete uses service deleteDeal
  const handleDelete = (dealId?: string) => {
    if (!dealId) return;
    deleteDeal(dealId, setVendorDeals);
  };

  // Edit uses service editDeal (placeholder)
  const handleEdit = (deal: Deal) => {
    editDeal(deal);
  };

  // Modal component for adding deals
  const AddDealModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add New Deal</h2>
          <button
            onClick={() => setShowAddDeal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Title *
            </label>
            <input
              name="title"
              value={formState.title}
              onChange={handleChange}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter deal title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formState.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Describe your deal"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₦) *
              </label>
              <input
                name="oldPrice"
                value={formState.oldPrice}
                onChange={handleChange}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (₦) *
              </label>
              <input
                name="newPrice"
                value={formState.newPrice}
                onChange={handleChange}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formState.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Garden</option>
              <option value="health">Health & Beauty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal URL
            </label>
            <input
              name="url"
              value={formState.url}
              onChange={handleChange}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="https://your-store.com/product"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                name="expiryDate"
                value={formState.expiryDate}
                onChange={handleChange}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                name="image"
                value={formState.image}
                onChange={handleChange}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowAddDeal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button type="submit" className="px-6 py-2">
              Submit Deal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vendor Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>

          <Button
            onClick={() => setShowAddDeal(true)}
            className="flex items-center gap-x-2"
          >
            <Plus size={20} />
            <span>Add New Deal</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalDeals}
                </p>
              </div>
              <Package size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <Eye size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conversionRate}%
                </p>
              </div>
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₦{stats.revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "deals", label: "My Deals", icon: Package },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const IconComponent = tab.icon as any;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "deals" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Deals
                  </h2>
                  <div className="flex space-x-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        if (val === "all status") {
                          fetchDeals(
                            user,
                            setVendorDeals,
                            setError,
                            setLoading,
                          );
                        } else {
                          setVendorDeals((prev) =>
                            prev.filter(
                              (d) => (d.status || "").toLowerCase() === val,
                            ),
                          );
                        }
                      }}
                    >
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Expired</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <p className="text-gray-600 text-center py-10">
                      Loading your deals...
                    </p>
                  ) : error ? (
                    <p className="text-red-600 text-center py-6">{error}</p>
                  ) : vendorDeals.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500 mb-4">No deals yet.</p>
                      <Button onClick={() => setShowAddDeal(true)}>
                        Post a Deal
                      </Button>
                    </div>
                  ) : (
                    vendorDeals.map((deal) => (
                      <div
                        key={deal._id || deal.title}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          <AppImage
                            src={
                              deal.image || "https://via.placeholder.com/150"
                            }
                            alt={deal.title || "deal image"}
                            className="w-20 h-20 object-cover rounded-lg"
                          />

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {deal.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    deal.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : deal.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {(deal.status || "unknown").toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span>
                                ₦{(deal.newPrice || 0).toLocaleString()}
                              </span>
                              {deal.oldPrice ? (
                                <>
                                  <span className="line-through">
                                    ₦{deal.oldPrice.toLocaleString()}
                                  </span>
                                  <span className="text-primary font-medium">
                                    -
                                    {Math.round(
                                      ((deal.oldPrice - (deal.newPrice || 0)) /
                                        deal.oldPrice) *
                                        100,
                                    )}
                                    %
                                  </span>
                                </>
                              ) : null}
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Eye size={14} />
                                <span>{deal.views || 0} views</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ExternalLink size={14} />
                                <span>{deal.views || 0} clicks</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart size={14} />
                                <span>{deal.saves || 0} saves</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(deal)}
                              className="p-2 text-gray-600 hover:text-primary hover:bg-green-50 rounded-lg"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(deal._id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dashboard Overview
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />{" "}
                        <span className="text-sm text-gray-600">
                          New deal approved
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />{" "}
                        <span className="text-sm text-gray-600">
                          Deal received 50+ upvotes
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />{" "}
                        <span className="text-sm text-gray-600">
                          Deal expiring soon
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                        View deal performance
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                        Update pricing
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors">
                        Extend deal duration
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="text-center py-12">
                <BarChart3 size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-600">
                  Detailed analytics and insights will be available here.
                </p>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vendor Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Notification Preferences
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          defaultChecked
                        />{" "}
                        <span className="ml-2 text-sm text-gray-700">
                          Email notifications for new comments
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          defaultChecked
                        />{" "}
                        <span className="ml-2 text-sm text-gray-700">
                          Deal approval notifications
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />{" "}
                        <span className="ml-2 text-sm text-gray-700">
                          Weekly performance reports
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddDeal && <AddDealModal />}
    </div>
  );
};

export default VendorDashboard;
