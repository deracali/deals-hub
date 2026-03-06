"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "./component/AdminHeader";
import { AdminSidebar } from "./component/sidebar"; // Import the new Sidebar

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (user.role !== "Admin") {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  // Prevent render until auth check completes
  if (isAuthorized === null) return null;

  return (
    <div className="min-h-screen bg-white flex">
      {/* 1. Add the Sidebar here */}
      <AdminSidebar />

      {/* 2. Main wrapper now needs "flex-1" and "lg:ml-64" to offset the sidebar width */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
        {/* Header */}
        <AdminHeader />

        <main className="flex-1 w-full">
          {/* Removed pb-32 since the FloatingNav is gone */}
          <div className="w-full px-8 pt-8 pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
