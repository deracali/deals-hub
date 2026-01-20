"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./component/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 🔹 Get user data (adjust based on your storage method)
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      // Not logged in → redirect to login
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "Admin") {
      // Not an admin → redirect to personal route
      router.replace(`/login`);
      return;
    }

    // Authorized
    setIsAuthorized(true);
  }, [router]);

  // Prevent flicker while checking
  if (isAuthorized === null) {
    return null; // or show a spinner if you prefer
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
