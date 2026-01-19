"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Edit,
  Trash2,
  UsersIcon,
  Shield,
  Mail,
  Ban,
  CheckCircle,
} from "lucide-react";

interface User {
  _id: string;
  email: string;
  type: "regular" | "vendor" | "admin";
  createdAt: string;
  status?: "active" | "suspended";
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`,
        );
        const data = await res.json();
        if (data.users) {
          // Add fallback values (like name and status) for display
          const formattedUsers = data.users.map((u: any) => ({
            ...u,
            name: u.email.split("@")[0], // derive a temporary name from email
            status: u.status || "active", // default status
          }));
          setUsers(formattedUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";

    try {
      // 1️⃣ Update the user's status in backend
      const res = await fetch(
        `http://localhost:5000/api/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update user status");

      // 2️⃣ Update UI immediately
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user,
        ),
      );

      // 3️⃣ Send email if the account is suspended
      if (newStatus === "suspended") {
        await fetch("/api/send-suspension-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: data.email }), // email returned from backend
        });
        alert("🚫 User suspended and notified by email");
      } else {
        await fetch("/api/send-reactivation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: data.email }),
        });
        alert("✅ User account reactivated and notified by email");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      alert("An error occurred while updating user status");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || user.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <p className="text-center text-muted-foreground mt-10">
        Loading users...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, vendors, and administrators
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="px-4 py-2 bg-background border border-input rounded-lg text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="regular">Regular Users</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.type === "admin" ? (
                            <Shield className="text-primary" size={18} />
                          ) : user.type === "vendor" ? (
                            <UsersIcon className="text-primary" size={18} />
                          ) : (
                            <Mail className="text-primary" size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.type === "admin"
                            ? "bg-destructive/10 text-destructive"
                            : user.type === "vendor"
                              ? "bg-chart-2/10 text-chart-2"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {user.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === "active"
                            ? "bg-primary/10 text-primary"
                            : user.status === "pending"
                              ? "bg-chart-3/10 text-chart-3"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            toggleUserStatus(user._id, user.status!)
                          }
                          className={`p-2 hover:bg-accent rounded-lg transition-colors ${
                            user.status === "suspended" && "hover:bg-primary/10"
                          }`}
                          title={
                            user.status === "suspended"
                              ? "Activate user"
                              : "Suspend user"
                          }
                        >
                          {user.status === "suspended" ? (
                            <CheckCircle size={16} className="text-primary" />
                          ) : (
                            <Ban size={16} className="text-muted-foreground" />
                          )}
                        </button>
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                          <Edit size={16} className="text-muted-foreground" />
                        </button>
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <UsersIcon
              className="mx-auto text-muted-foreground mb-4"
              size={48}
            />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
