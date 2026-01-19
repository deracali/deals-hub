"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  Package,
} from "lucide-react";

interface VendorPlan {
  _id: string;
  name: string;
  price: number;
  duration: "monthly" | "yearly";
  features: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function VendorPlanPage(): JSX.Element {
  const [plans, setPlans] = useState<VendorPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "monthly" as "monthly" | "yearly",
    features: [""],
  });

  // Fetch Plans
  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor-plans/get`,
      );
      if (!res.ok) throw new Error("Failed to fetch vendor plans");
      const data = await res.json();
      setPlans(data.data || data);
    } catch (err: any) {
      setError(err.message || "Error fetching plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        duration: formData.duration,
        features: formData.features.filter(Boolean),
      };

      const url = editingPlanId
        ? `http://localhost:5000/api/vendor-plans/update/${editingPlanId}`
        : "http://localhost:5000/api/vendor-plans/create";
      const method = editingPlanId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save vendor plan");

      await fetchPlans();
      setShowAddForm(false);
      setEditingPlanId(null);
      setFormData({ name: "", price: "", duration: "monthly", features: [""] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (plan: VendorPlan) => {
    setEditingPlanId(plan._id);
    setFormData({
      name: plan.name,
      price: String(plan.price),
      duration: plan.duration,
      features: plan.features,
    });
    setShowAddForm(true);
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/vendor-plans/delete/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to delete plan");
      await fetchPlans();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Plans</h1>
          <p className="text-muted-foreground">
            Manage and configure your vendor subscription plans
          </p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingPlanId(null);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={18} className="mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search plan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>
              {editingPlanId ? "Edit Plan" : "Create New Plan"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input
                    placeholder="e.g., Premium Vendor"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₦)</label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: e.target.value as "monthly" | "yearly",
                      })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    Features (one per line)
                  </label>
                  <textarea
                    className="w-full border rounded-md bg-background p-2"
                    rows={5}
                    placeholder="Enter features..."
                    value={formData.features.join("\n")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPlanId(null);
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
                    ? editingPlanId
                      ? "Updating..."
                      : "Creating..."
                    : editingPlanId
                      ? "Update Plan"
                      : "Create Plan"}
                </Button>
              </div>
            </form>
            {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card
            key={plan._id}
            className="border-border transition hover:shadow-md"
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Package size={18} /> {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm capitalize">
                    {plan.duration}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-2 hover:bg-accent rounded-lg"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit size={16} className="text-muted-foreground" />
                  </button>
                  <button
                    className="p-2 hover:bg-accent rounded-lg"
                    onClick={() => handleDelete(plan._id)}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-2xl font-bold">
                <DollarSign size={18} /> {plan.price.toLocaleString()}
              </div>

              <div className="space-y-1">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-primary" /> {f}
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                <Calendar size={12} className="inline mr-1" />
                Created: {new Date(plan.createdAt || "").toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredPlans.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Package className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">No vendor plans found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first plan to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
