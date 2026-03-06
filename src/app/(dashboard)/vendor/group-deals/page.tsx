"use client";

import React, { useState } from "react";
import Image from "next/image";
import { VendorHeader } from "../component/VendorHeader";
import { Plus, Trash2, Calendar, X, UploadCloud, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { VendorSidebar } from "../component/sidebar";


export default function CreateGroupDealPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [moqQuantity, setMoqQuantity] = useState("1");
  const [maxQuantityPerUser, setMaxQuantityPerUser] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
const [loading, setLoading] = useState(false);

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


  const handleImageChange = (e) => {
    if (!e.target.files) return;
    setImages([...images, ...Array.from(e.target.files)]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };


  const getVendorIdByBrand = async (brand) => {
    try {
      const res = await fetch(
        `https://dealshub-server.onrender.com/api/vendors/name/${encodeURIComponent(brand)}`
      );

      if (!res.ok) return null;

      const data = await res.json();

      return data?.vendor?._id || data?._id || null;
    } catch (err) {
      console.error("Vendor fetch error:", err);
      return null;
    }
  };



  const handleSubmit = async () => {
    if (loading) return; // prevent double click

    if (
      !title ||
      !description ||
      images.length === 0 ||
      !originalPrice ||
      !discountedPrice ||
      !moqQuantity ||
      !maxQuantityPerUser ||
      !expiresAt
    ) {
      popup("Please fill all fields");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user?._id) {
      popup("User not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // Get vendorId using brand name
      const vendorId = await getVendorIdByBrand(user.brand);

      if (!vendorId) {
        popup("Vendor not found for this account");
        return;
      }

      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("vendorId", vendorId);

      formData.append("title", title);
      formData.append("description", description);
      formData.append("originalPrice", originalPrice);
      formData.append("discountedPrice", discountedPrice);
      formData.append("moqQuantity", moqQuantity);
      formData.append("maxQuantityPerUser", maxQuantityPerUser);
      formData.append("expiresAt", expiresAt);

      images.forEach((img) => formData.append("images", img));

      const res = await fetch("https://dealshub-server.onrender.com/api/group-deals/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create deal");
      }


      // ✅ clear form state
         setTitle("");
         setDescription("");
         setImages([]);
         setOriginalPrice("");
         setDiscountedPrice("");
         setMoqQuantity("1");
         setMaxQuantityPerUser("1");
         setExpiresAt("");


      popup("Group deal created successfully!");
      router.push("/vendor/group-deals");
    } catch (err) {
      console.error(err);
      popup(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
     <VendorSidebar />

     <div className="flex-1 pb-20 font-sans text-slate-900">
           <VendorHeader />
      <div className="max-w-3xl mx-auto px-6 mt-10">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Create New Group Deal</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below to launch your group buying campaign.</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/50 p-6 md:p-10 space-y-8">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Deal Title <Info size={14} className="text-gray-400" />
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 15 Pro Max - Bulk Group Buy"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product and the terms of the group deal..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none h-32 transition-all"
            />
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Product Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                  <Image src={URL.createObjectURL(img)} alt="preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-400 group">
                <UploadCloud size={24} className="group-hover:text-blue-500 transition-colors" />
                <span className="text-[10px] mt-1 font-medium group-hover:text-blue-500">Upload</span>
                <input type="file" multiple className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Original Price (₦)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-600">Group Deal Price (₦)</label>
              <input
                type="number"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"
              />
            </div>
          </div>

          {/* Group Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Min. Order (MOQ)</label>
              <select
                value={moqQuantity}
                onChange={(e) => setMoqQuantity(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat"
              >
                {[...Array(50)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} units</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Max per Customer</label>
              <select
                value={maxQuantityPerUser}
                onChange={(e) => setMaxQuantityPerUser(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1rem_center] bg-no-repeat"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} units</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Deal Expiration Date</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              />
              <Calendar size={18} className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col md:flex-row gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 py-4 px-6 border border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
        onClick={handleSubmit}
        disabled={loading}
        className={`flex-[2] py-4 px-6 rounded-2xl font-bold shadow-lg transition-all
          ${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
          }`}
      >
        {loading ? "Creating..." : "Launch Group Deal"}
      </button>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
