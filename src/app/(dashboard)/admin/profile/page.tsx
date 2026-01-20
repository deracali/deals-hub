"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Shield, Save, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);

  // ✅ Fetch admin info from API
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const adminId = localStorage.getItem("userId"); // stored after login
        if (!adminId) {
          console.error("No admin ID found in localStorage");
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${adminId}`,
        );
        const data = await res.json();

        if (res.ok && data.user) {
          const user = data.user;
          setFormData((prev) => ({
            ...prev,
            id: user._id,
            name:
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.name || "",
            email: user.email || "",
          }));
        } else {
          console.error("Failed to load admin:", data.message);
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  // ✅ Update admin details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return alert("User ID not found");

    try {
      const [firstName, ...rest] = formData.name.trim().split(" ");
      const lastName = rest.join(" ");

      const res = await fetch(
        `http://localhost:5000/api/users/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            firstName,
            lastName,
          }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Profile updated successfully");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error updating profile");
    }
  };

  // ❌ Password update is ignored per instruction
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Password update functionality is disabled for now.");
  };

  // ✅ Logout clears user and redirects
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading)
    return <p className="text-muted-foreground mt-10">Loading profile...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-balance">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* PROFILE INFO */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCircle className="text-primary" size={40} />
              </div>
              <div>
                <h3 className="font-medium mb-1">{formData.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {formData.email}
                </p>
                <Button variant="outline" size="sm" disabled>
                  Change Avatar
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Shield className="text-primary" size={20} />
              <div>
                <p className="text-sm font-medium">Administrator</p>
                <p className="text-xs text-muted-foreground">
                  You have full access to all admin features
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* CHANGE PASSWORD (placeholder) */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
              >
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* LOGOUT */}
      <Card className="bg-card border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div>
              <p className="font-medium">Logout from all devices</p>
              <p className="text-sm text-muted-foreground">
                This will sign you out from all active sessions
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
