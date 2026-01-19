"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Percent,
} from "lucide-react";

interface ApiCoupon {
  _id: string;
  backgroundColor?: string;
  isPopular?: boolean;
  discount: string;
  title?: string;
  description?: string;
  vendor?: string;
  expiresAt: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  usageCount?: number;
  maxUsage?: number;
}

interface CouponUI {
  id: string;
  code: string;
  discount: string | number;
  type: "percentage" | "fixed";
  expiresAt: string;
  usageCount?: number;
  maxUsage?: number;
  status: "active" | "expired" | "disabled";
  backgroundColor?: string;
  title?: string;
  description?: string;
  vendor?: string;
}

export default function CouponsPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    type: "percentage" as "percentage" | "fixed",
    expiresAt: "",
    maxUsage: "",
    backgroundColor: "#FDF2F8",
    title: "",
    description: "",
    vendor: "",
    category: "",
    isPopular: false,
  });
  const [coupons, setCoupons] = useState<CouponUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapApiToUi = (a: ApiCoupon): CouponUI => {
    const discountNum = Number(a.discount) || 0;
    const now = new Date();
    const expires = new Date(a.expiresAt);
    const status = expires < now ? "expired" : "active";
    const type: "percentage" | "fixed" =
      discountNum > 0 && discountNum <= 100 ? "percentage" : "fixed";

    return {
      id: a._id,
      code: a.code,
      discount: a.discount,
      type: "percentage",
      expiresAt: a.expiresAt,
      usageCount: (a as any).usageCount,
      maxUsage: (a as any).maxUsage,
      status,
      backgroundColor: a.backgroundColor || "#f5f5f5",
      title: a.title,
      description: a.description,
      vendor: a.vendor,
    };
  };

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons/get`,
      );
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const payload = await res.json();
      const arr: ApiCoupon[] = payload.data || payload.coupons || [];
      setCoupons(arr.map(mapApiToUi));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error fetching coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        backgroundColor: formData.backgroundColor,
        isPopular: false,
        discount: String(formData.discount),
        title: formData.title,
        description: formData.description,
        vendor: formData.vendor,
        isPopular: formData.isPopular,
        expiresAt: formData.expiresAt,
        category: formData.category,
        code: formData.code.toUpperCase(),
      };

      const url = editingCouponId
        ? `http://localhost:5000/api/coupons/update/${editingCouponId}`
        : "http://localhost:5000/api/coupons/create";
      const method = editingCouponId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed");
      }

      await fetchCoupons();
      setShowAddForm(false);
      setEditingCouponId(null);
      setFormData({
        code: "",
        discount: "",
        type: "percentage",
        expiresAt: "",
        maxUsage: "",
        backgroundColor: "#FDF2F8",
        title: "",
        description: "",
        vendor: "",
        category: "",
        isPopular: false,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error submitting coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: CouponUI) => {
    setEditingCouponId(coupon.id);
    setFormData({
      code: coupon.code,
      discount: String(coupon.discount),
      type: coupon.type,
      expiresAt: coupon.expiresAt,
      maxUsage: coupon.maxUsage ? String(coupon.maxUsage) : "",
      backgroundColor: coupon.backgroundColor || "#FDF2F8",
      title: coupon.title || "",
      description: coupon.description || "",
      vendor: coupon.vendor || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/coupons/delete/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to delete coupon");
      await fetchCoupons();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error deleting coupon");
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Coupon Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage discount coupons for your users
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingCouponId(null);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Add / Edit Coupon Form */}
      {showAddForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>
              {editingCouponId ? "Edit Coupon" : "Create New Coupon"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* form fields as before */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coupon Code</label>
                  <Input
                    placeholder="e.g., WELCOME20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </div>

                {/* Discount Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "percentage" | "fixed",
                      })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Discount Value{" "}
                    {formData.type === "percentage" ? "(%)" : "(₦)"}
                  </label>
                  <Input
                    type="text"
                    placeholder={formData.type === "percentage" ? "20" : "5000"}
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="e.g., 20% OFF First Purchase"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Short description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Category */}
                <select
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                </select>

                {/* Vendor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vendor</label>
                  <Input
                    placeholder="e.g., DealsNaija"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={formData.isPopular}
                    onChange={(e) =>
                      setFormData({ ...formData, isPopular: e.target.checked })
                    }
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isPopular" className="text-sm font-medium">
                    Mark as Popular
                  </label>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      placeholder="#FDF2F8"
                      value={formData.backgroundColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          backgroundColor: e.target.value,
                        })
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.backgroundColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCouponId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading
                    ? editingCouponId
                      ? "Updating..."
                      : "Creating..."
                    : editingCouponId
                      ? "Update Coupon"
                      : "Create Coupon"}
                </Button>
              </div>
            </form>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Coupons Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) => (
          <Card
            key={coupon.id}
            className="border-border transition hover:shadow-md"
            style={{
              // Only set one kind of background-related property
              ...(coupon.backgroundImage
                ? {
                    backgroundImage: `url(${coupon.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    color: "white", // ensure text contrast on images
                  }
                : coupon.backgroundColor?.startsWith("linear-gradient(")
                  ? {
                      backgroundImage: coupon.backgroundColor, // gradient
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      color: "white",
                    }
                  : {
                      backgroundColor: coupon.backgroundColor || "#f5f5f5",
                      color: "inherit",
                    }),
            }}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header with Edit/Delete */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center">
                      <Tag className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-lg">
                        {coupon.code}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          coupon.status === "active"
                            ? "bg-primary/10 text-primary"
                            : coupon.status === "expired"
                              ? "bg-muted text-muted-foreground"
                              : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {coupon.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit
                        color={"white"}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </button>
                    <button
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      onClick={() => handleDelete(coupon.id)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Discount */}
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Percent size={20} />
                  <div className="flex items-center gap-2 text-2xl font-bold">
                    <Percent size={20} />
                    {isNaN(Number(coupon.discount))
                      ? coupon.discount // plain text like "Buy 1 Get 1"
                      : coupon.type === "percentage"
                        ? `${coupon.discount}% OFF`
                        : `₦${Number(coupon.discount).toLocaleString()} OFF`}
                  </div>
                </div>

                {/* Expiry & usage */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar color={"white"} size={14} />
                    <span className="text-white">
                      Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  {typeof coupon.usageCount === "number" &&
                    typeof coupon.maxUsage === "number" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Usage</span>
                          <span className="font-medium">
                            {coupon.usageCount} / {coupon.maxUsage}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{
                              width: `${(coupon.usageCount / coupon.maxUsage) * 100}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredCoupons.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Tag className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">No coupons found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Try adjusting your search query"
                : "Create your first coupon to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// helper
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
