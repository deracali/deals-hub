"use client";

import React, { useState, useEffect } from 'react';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
  onDealUpdated?: (updatedDeal: any) => void;
}

export const EditDealModal = ({ isOpen, onClose, deal, onDealUpdated }: EditDealModalProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // State focused on standard deal properties
  const [formData, setFormData] = useState({
    title: "",
    originalPrice: "",
    discountedPrice: "",
    category: "Fashion",
    description: "",
    colors: [] as string[],
    sizes: [] as string[]
  });

  // Sync state when modal opens with a deal
  useEffect(() => {
    if (deal && isOpen) {
      setFormData({
        title: deal.title || "",
        originalPrice: deal.originalPrice || "",
        discountedPrice: deal.discountedPrice || "",
        category: deal.category || "Fashion",
        description: deal.description || "",
        colors: deal.colors || [],
        sizes: deal.sizes || []
      });
    }
  }, [deal, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dealId = deal._id || deal.id;
      // Integration with dealsRoute.put("/update/:id", updateDeal)
      const response = await fetch(`https://dealshub-server.onrender.com/api/deals/update/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updated = await response.json();
        if (onDealUpdated) onDealUpdated(updated);
        setShowSuccess(true);
      }
    } catch (err) {
      console.error("Failed to update deal", err);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden">

        {!showSuccess ? (
          <>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex items-center text-sm font-bold mb-4 transition-colors">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h2 className="text-2xl font-black text-gray-900">Edit deal</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 custom-scrollbar">

              <div className="grid grid-cols-1 gap-6">

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deal Title <span className="text-red-500">*</span></label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Original Price <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                       <input
                        name="originalPrice"
                        type="text"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-xl py-4 pl-8 pr-16 text-sm font-bold text-gray-900"
                       />
                       <div className="absolute right-2 top-2 bg-white rounded-lg px-2 py-2 flex items-center shadow-sm">
                          <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-4 h-3 mr-1" />
                          <span className="text-xs font-bold text-gray-600 mr-1">USD</span>
                       </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Discount Price <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <span className="absolute left-4 top-4 text-gray-400 font-bold">$</span>
                       <input
                        name="discountedPrice"
                        type="text"
                        value={formData.discountedPrice}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none rounded-xl py-4 pl-8 pr-16 text-sm font-bold text-gray-900"
                       />
                       <div className="absolute right-2 top-2 bg-white rounded-lg px-2 py-2 flex items-center shadow-sm">
                          <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-4 h-3 mr-1" />
                          <span className="text-xs font-bold text-gray-600 mr-1">USD</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Category Only */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deal Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold text-gray-900 appearance-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option>Kitchen</option>
                       <option>Fashion</option>
                       <option>Electronics</option>
                     </select>
                     <div className="absolute right-4 top-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                     </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Deal description <span className="text-red-500">*</span></label>
                  <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs leading-relaxed text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Visuals - Colors & Sizes */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Additional information</h3>
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 italic mb-2">Product color</label>
                    <div className="flex flex-wrap items-center gap-4">
                      {['Blue', 'Green', 'Red', 'Black', 'White'].map((color) => (
                        <label key={color} className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300" defaultChecked={formData.colors.includes(color)} />
                          <span className="text-xs font-medium text-gray-700">{color}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 italic mb-2">Product sizes</label>
                    <div className="flex items-center w-full bg-white border border-gray-100 rounded-xl px-2 py-2 shadow-sm">
                       <div className="flex items-center bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 mr-2">
                        <span className="text-xs text-blue-600 font-bold mr-2">42</span>
                        <button className="text-blue-400 hover:text-blue-600"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg></button>
                      </div>
                      <input type="text" placeholder="Type sizes..." className="flex-1 text-xs border-none focus:ring-0 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Image Stack */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2 flex justify-between">
                    <span>Upload product images</span>
                    <span className="text-gray-300">4/10 images</span>
                  </label>
                  <div className="bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center border border-gray-100">
                    <div className="flex -space-x-3 mb-3">
                    {deal.images?.slice(1).map((imgUrl, i) => (
<div key={i} className="w-10 h-14 rounded-md border-2 border-white bg-gray-200 shadow-sm relative overflow-hidden">
  <img src={imgUrl} alt={`Product ${i+2}`} className="w-full h-full object-cover" />
</div>
))}
                        <button className="w-10 h-14 rounded-md border-2 border-white bg-white flex items-center justify-center shadow-sm text-green-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                    <div className="w-48 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-green-500 w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex space-x-4 bg-white">
              <button onClick={onClose} className="flex-1 py-4 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save changes"}
              </button>
            </div>
          </>
        ) : (
          /* Success View */
          <div className="p-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Changes saved</h2>
            <p className="text-gray-500 font-medium mb-10">Your deal has been updated successfully.</p>
            <button
              onClick={resetAndClose}
              className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-100 transition-all active:scale-95"
            >
              View all deals
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
