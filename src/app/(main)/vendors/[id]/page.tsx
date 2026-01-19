"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StoreProfile from "../vendor-profile";
import DealsSection from "../vendor-deals";
import CommunityDiscussion from "../comments";
import Header from "@/components/general/header";

const Vendor = () => {
  const { id } = useParams(); // ← gets 694cfec8d684b3f7674301b8
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    if (!id) return;

    const fetchVendor = async () => {
      try {
        const res = await fetch(`${baseURL}/vendors/get/${id}`);
        const data = await res.json();
        setVendor(data);
      } catch (err) {
        console.error("Failed to fetch vendor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading vendor...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Vendor not found
      </div>
    );
  }

  return (
    <>
      <Header />
      <StoreProfile vendor={vendor} />
      <DealsSection vendorId={vendor._id} brand={vendor.name} />
      <CommunityDiscussion vendorId={vendor._id} />
    </>
  );
};

export default Vendor;
