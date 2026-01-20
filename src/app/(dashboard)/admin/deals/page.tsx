"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  Package,
} from "lucide-react";

interface Deal {
  _id: string;
  title: string;
  brand?: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  createdAt: string;
  status?: "pending" | "approved" | "rejected";
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const LIMIT = 10;

  const fetchDeals = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/deals/get?page=${pageNumber}&limit=${LIMIT}`,
      );
      if (!res.ok) throw new Error("Failed to fetch deals");

      const data = await res.json();

      const newDeals = (data.deals || []).map((d: Deal) => ({
        ...d,
        status: d.status || "pending",
      }));

      setDeals((prev) => (append ? [...prev, ...newDeals] : newDeals));
      setHasMore(pageNumber < data.pages);
    } catch (err) {
      console.error(err);
      setError("Error loading deals");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDeals(nextPage, true);
  };

  // const handleApprove = async (id: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:5000/api/deals/${id}/approve`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //     });
  //
  //     const data = await res.json();
  //
  //     if (!res.ok) throw new Error(data.message || "Failed to approve deal");
  //
  //     // ✅ Update local state instantly
  //     setDeals((prev) =>
  //       prev.map((d) => (d._id === id ? { ...d, status: "approved" } : d))
  //     );
  //   } catch (error) {
  //     console.error("❌ Error approving deal:", error);
  //     alert("Failed to approve deal");
  //   }
  // };

  const handleApprove = async (dealId: string) => {
    try {
      // Step 1: Approve the deal in backend
      const approveRes = await fetch(
        `http://localhost:5000/api/deals/${dealId}/approve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!approveRes.ok) throw new Error("Failed to approve deal");
      const updatedDeal = await approveRes.json();

      // Step 2: Get creator info
      const userRes = await fetch(
        `http://localhost:5000/api/users/${updatedDeal.createdBy}`,
      );
      if (!userRes.ok) throw new Error("Failed to fetch user info");
      const user = await userRes.json();

      // Step 3: Send approval email
      await fetch("/api/send-approval-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          dealTitle: updatedDeal.title,
          dealImage: updatedDeal.images?.[0],
          dealUrl: updatedDeal.url,
        }),
      });

      // Step 4: Update UI
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, status: "approved" } : d)),
      );

      alert("✅ Deal approved and email sent with image!");
    } catch (error) {
      console.error(error);
      alert("❌ Something went wrong while approving the deal");
    }
  };

  const handleReject = async (dealId: string) => {
    try {
      // Step 1: Reject the deal in backend
      const rejectRes = await fetch(
        `http://localhost:5000/api/deals/${dealId}/reject`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );

      const updatedDeal = await rejectRes.json();
      if (!rejectRes.ok)
        throw new Error(updatedDeal.message || "Failed to reject deal");

      // Step 2: Get creator info using createdBy
      const userRes = await fetch(
        `http://localhost:5000/api/users/${updatedDeal.createdBy}`,
      );
      if (!userRes.ok) throw new Error("Failed to fetch user info");
      const user = await userRes.json();

      // Step 3: Send rejection email
      await fetch("/api/send-rejection-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          dealTitle: updatedDeal.title,
          dealImage: updatedDeal.images?.[0],
        }),
      });

      // Step 4: Update UI locally
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, status: "rejected" } : d)),
      );

      alert("❌ Deal rejected and email sent to vendor");
    } catch (error) {
      console.error("❌ Error rejecting deal:", error);
      alert("Failed to reject deal");
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = deal.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && page === 1) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading deals...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Deal Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage deals submitted by vendors
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 bg-background border border-input rounded-lg text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Deals List */}
      <div className="space-y-4">
        {filteredDeals.map((deal) => (
          <Card
            key={deal._id}
            className="bg-card border-border hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="text-muted-foreground" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {deal.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">
                          {deal.brand || "Unknown Brand"}
                        </span>
                        <span>•</span>
                        <span>{deal.category}</span>
                        <span>•</span>
                        <span>
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        ₦{deal.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₦{deal.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
                      -{deal.discountPercentage}%
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded capitalize",
                        deal.status === "pending" &&
                          "bg-yellow-100 text-yellow-700",
                        deal.status === "active" &&
                          "bg-green-100 text-green-700",
                        deal.status === "rejected" && "bg-red-100 text-red-700",
                        !["pending", "active", "rejected"].includes(
                          deal.status,
                        ) && "bg-gray-100 text-gray-600", // fallback
                      )}
                    >
                      {deal.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {deal.status === "pending" && (
                    <>
                      <Button
                        onClick={() => handleApprove(deal._id)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(deal._id)}
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                    <MoreVertical size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-muted text-foreground hover:bg-muted/80"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDeals.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Package className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-medium mb-2">No deals found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No deals have been submitted yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
