"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Store,
  DollarSign,
  Calendar,
  CheckCircle,
  Eye,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  name: string;
  businessEmail: string;
  businessPhone: string;
  type: string;
  joinedDate: string;
  totalDeals: number;
  revenue: number;
  subscriptionPlan?: "basic" | "premium" | "enterprise";
  subscriptionStatus?: "active" | "expired" | "trial";
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // ✅ Fetch vendors using fetch()
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/get`,
        );
        const data = await response.json();
        if (data?.data) {
          const mapped = data.data.map((v: any) => ({
            id: v._id,
            name: v.name,
            businessEmail: v.businessEmail,
            businessPhone: v.businessPhone,
            type: v.type,
            joinedDate: v.joinedDate,
            totalDeals: v.totalDeals || 0,
            revenue: v.revenue || 0,
            subscriptionPlan: "basic", // placeholder until backend provides
            subscriptionStatus: "active", // placeholder until backend provides
          }));
          setVendors(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch vendors:", err);
      }
    };

    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.businessEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan =
      planFilter === "all" || vendor.subscriptionPlan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Paid Vendors</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor subscriptions and business accounts
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Store size={16} className="mr-2" />
          Add New Vendor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold mt-1">{vendors.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold mt-1">
                  {vendors.reduce((sum, v) => sum + v.totalDeals, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(
                    vendors.reduce((sum, v) => sum + (v.revenue || 0), 0),
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold mt-1">
                  {
                    vendors.filter((v) => v.subscriptionStatus === "active")
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 bg-background border border-input rounded-lg text-sm"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Vendor List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => (
          <Card
            key={vendor.id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{vendor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vendor.type}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize",
                    vendor.subscriptionStatus === "active"
                      ? "bg-primary/10 text-primary"
                      : vendor.subscriptionStatus === "trial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-destructive/10 text-destructive",
                  )}
                >
                  {vendor.subscriptionStatus}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium capitalize">
                    {vendor.subscriptionPlan}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">
                    {new Date(vendor.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium">
                    {formatCurrency(vendor.revenue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Deals: </span>
                  <span className="font-semibold">{vendor.totalDeals}</span>
                </div>
                <Button variant="outline" size="sm">
                  <Eye size={14} className="mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">No vendors found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
