"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  Package,
  Tag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ActivityItem {
  type: string;
  title: string;
  user?: string;
  time: string;
}

interface PendingItem {
  type: string;
  title: string;
  vendor: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: "Total Users",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active Deals",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Package,
    },
    {
      title: "Active Coupons",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Tag,
    },
    {
      title: "Revenue",
      value: "₦0",
      change: "+0%",
      trend: "up",
      icon: TrendingUp,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersRes,
          dealsRes,
          couponsRes,
          vendorsRes,
          forumRes,
          pendingDealsRes,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/deals/get`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupons/get`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/get`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forum/get`),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/deals/get?status=pending`,
          ), // 👈 get pending deals
        ]);

        const usersData = await usersRes.json();
        const dealsData = await dealsRes.json();
        const couponsData = await couponsRes.json();
        const vendorsData = await vendorsRes.json();
        const forumData = await forumRes.json();
        const pendingDealsData = await pendingDealsRes.json();

        const totalUsers = usersData?.count || usersData?.users?.length || 0;
        const totalDeals = dealsData?.deals?.length || 0;
        const totalCoupons = couponsData?.data?.length || 0;

        // ✅ Update stats
        setStats((prev) =>
          prev.map((item) => {
            if (item.title === "Total Users")
              return { ...item, value: totalUsers.toString() };
            if (item.title === "Active Deals")
              return { ...item, value: totalDeals.toString() };
            if (item.title === "Active Coupons")
              return { ...item, value: totalCoupons.toString() };
            return item;
          }),
        );

        // ✅ Build activity feed
        const activities: ActivityItem[] = [];

        usersData?.users?.forEach((u: any) => {
          activities.push({
            type: "User",
            title: "New user registered",
            user: u.email,
            time: new Date(u.createdAt).toLocaleString(),
          });
        });

        dealsData?.deals?.forEach((d: any) => {
          activities.push({
            type: "Deal",
            title: d.title,
            user: d.brand || "Unknown",
            time: new Date(d.createdAt).toLocaleString(),
          });
        });

        couponsData?.data?.forEach((c: any) => {
          activities.push({
            type: "Coupon",
            title: c.title,
            user: c.vendor || "Admin",
            time: new Date(c.createdAt).toLocaleString(),
          });
        });

        vendorsData?.data?.forEach((v: any) => {
          activities.push({
            type: "Vendor",
            title: v.name,
            user: v.businessEmail,
            time: new Date(v.createdAt).toLocaleString(),
          });
        });

        forumData?.data?.forEach((f: any) => {
          activities.push({
            type: "Forum",
            title: f.title,
            user: f.author?.name,
            time: new Date(f.createdAt).toLocaleString(),
          });
        });

        const sorted = activities.sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );

        setRecentActivity(sorted.slice(0, 10));

        // ✅ Set pending deals dynamically
        const pendingItems =
          pendingDealsData?.deals?.map((d: any) => ({
            type: "Deal",
            title: d.title,
            vendor: d.brand || "Unknown",
            status: d.status || "pending",
          })) || [];

        setPendingApprovals(pendingItems);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here’s what’s happening on your platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="text-muted-foreground" size={18} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon
                    size={14}
                    className={
                      stat.trend === "up" ? "text-primary" : "text-destructive"
                    }
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      stat.trend === "up" ? "text-primary" : "text-destructive",
                    )}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Approvals Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.type}: {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.user || "Unknown"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* ✅ Pending Deals */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Pending Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded capitalize",
                            item.status === "pending" &&
                              "bg-yellow-100 text-yellow-700",
                            item.status === "active" &&
                              "bg-green-100 text-green-700",
                            item.status === "rejected" &&
                              "bg-red-100 text-red-700",
                            !["pending", "active", "rejected"].includes(
                              item.status,
                            ) && "bg-gray-100 text-gray-600", // fallback
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.vendor}
                      </p>
                    </div>
                    <button className="text-xs font-medium text-primary hover:underline whitespace-nowrap">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending deals</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
