"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Shield, LogOut } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


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



  useEffect(() => {
    // ✅ Get user from localStorage
    const userString = localStorage.getItem("user");

    if (!userString) {
      popup("No user found. Redirecting...");
      setTimeout(() => {
        window.location.href = "/admin/";
      }, 1500);
      return;
    }

    try {
      const parsedUser = JSON.parse(userString);

      // ✅ Check if user is admin
      if (parsedUser.role !== "Admin") {
        popup("❌ You are not an admin");
        setTimeout(() => {
          window.location.href = "/admin/";
        }, 1500);
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error("Failed to parse user:", err);
      popup("Invalid user data. Redirecting...");
      setTimeout(() => {
        window.location.href = "/admin/";
      }, 1500);
    } finally {
      setLoading(false);
    }
  }, []);


  // ✅ Logout clears user and token
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted rounded-md" />
        </div>

        {/* Profile Card Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-muted rounded-full" />

              {/* Name & Email */}
              <div className="space-y-3">
                <div className="h-5 w-40 bg-muted rounded-md" />
                <div className="h-4 w-56 bg-muted rounded-md" />
              </div>
            </div>

            {/* Role Badge Skeleton */}
            <div className="mt-6 p-4 border rounded-lg bg-muted/30 space-y-2">
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-3 w-64 bg-muted rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Skeleton */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-muted rounded-md" />
                <div className="h-3 w-56 bg-muted rounded-md" />
              </div>
              <div className="h-9 w-24 bg-muted rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

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
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="text-primary" size={40} />
              )}
            </div>
            <div>
              <h3 className="font-medium mb-1">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg mt-6">
            <Shield className="text-primary" size={20} />
            <div>
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-muted-foreground">
                You have full access to all admin features
              </p>
            </div>
          </div>
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
