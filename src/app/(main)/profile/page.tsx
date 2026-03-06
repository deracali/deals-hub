"use client";

import { useEffect, useState } from "react";
import Header from "@/components/general/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, LogOut, Settings } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const popup = (message: string) => {
    const div = document.createElement("div");
    div.innerText = message;
    div.className =
      "fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 transition-all";
    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 2000);
  };

  useEffect(() => {
    // ✅ Get user from localStorage
    const userString = localStorage.getItem("user");

    if (!userString) {
      popup("Please login to view your profile.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    try {
      const parsedUser = JSON.parse(userString);
      setUser(parsedUser);
    } catch (err) {
      console.error("Failed to parse user:", err);
      popup("Session error. Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } finally {
      setLoading(false);
    }
  }, []);


  const getAccountStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'suspended':
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted rounded-md" />
        </div>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-muted rounded-full" />
              <div className="space-y-3">
                <div className="h-5 w-40 bg-muted rounded-md" />
                <div className="h-4 w-56 bg-muted rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <Header />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account security
          </p>
        </div>

      </div>

      {/* PROFILE INFO */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-background shadow-sm">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserCircle className="text-primary" size={56} />
              )}
            </div>

            <div className="text-center sm:text-left space-y-1">
  <h3 className="text-2xl font-bold">
    {user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name || "User Name"}
  </h3>

  <div className="flex items-center justify-center sm:justify-start text-muted-foreground gap-2">
    <Mail size={14} />
    <span className="text-sm">{user.email}</span>
  </div>

  {/* Dynamic Status Badge */}
  <div className={`
    inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mt-2
    ${getAccountStatusStyles(user?.status || 'active')}
  `}>
    {user?.status || 'active'}
  </div>
</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t">

             <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account ID</p>
                <p className="text-sm font-medium">#{user._id?.slice(-8).toUpperCase() || 'N/A'}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* LOGOUT / DANGER ZONE */}
      <Card className="bg-card border-destructive/20 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-destructive/5 border border-destructive/10 rounded-xl gap-4">
            <div className="text-center sm:text-left">
              <p className="font-semibold">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Logout from your current session safely
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full sm:w-auto shadow-sm"
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
