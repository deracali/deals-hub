"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check, Zap, Crown, Star, Info, Loader2 } from 'lucide-react';
import { usePaystackPayment } from "@/utils/usePaystackPayment";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: "free" | "pro" | "premium";
  userEmail?: string; // Made optional to allow static fallback
}

type ModalView = "selection" | "confirm-cancel" | "cancel-success";

const PLAN_PRICES = {
  pro: 500000,     // ₦5,000
  premium: 1000000  // ₦10,000
};

export default function SubscriptionModal({
  isOpen,
  onClose,
  currentPlan,
  userEmail = "test-user@example.com" // <--- STATIC FALLBACK DATA
}: SubscriptionModalProps) {
  const [view, setView] = useState<ModalView>("selection");
  const [isProcessing, setIsProcessing] = useState(false);
  const { openPaystackPayment } = usePaystackPayment();

  const [selectedPlan, setSelectedPlan] = useState<"pro" | "premium">("pro");


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
    if (currentPlan === "premium") setSelectedPlan("premium");
    else setSelectedPlan("pro");
  }, [currentPlan, isOpen]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    // Check for Public Key in .env
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      popup("Missing Paystack Public Key in your .env.local file!");
      return;
    }

    setIsProcessing(true);

    try {
      await openPaystackPayment({
        email: userEmail, // Uses static data if prop is missing
        amount: PLAN_PRICES[selectedPlan],
        businessName: "Vendor Pro",
        onSuccess: (transaction: any) => {
          setIsProcessing(false);
          console.log("Transaction Successful:", transaction);
          setView("selection"); // Reset view
          onClose();
        },
        onCancel: () => {
          setIsProcessing(false);
          console.log("User closed the payment modal");
        }
      });
    } catch (error: any) {
      setIsProcessing(false);
      console.error("Paystack Error:", error);
      popup(`Payment Error: ${error?.message || "Check console"}`);
    }
  };

  const handleCancelClick = () => {
    if (currentPlan === "free") onClose();
    else setView("confirm-cancel");
  };

  // --- SUB-VIEWS ---
  if (view === "confirm-cancel") {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="text-6xl text-red-500 font-black">X</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Cancel Subscription?</h2>
          <p className="text-slate-500 text-sm mb-8">Your post won't be boosted and reach will be limited.</p>
          <div className="space-y-3">
            <button onClick={() => setView("cancel-success")} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors">Yes, cancel</button>
            <button onClick={() => setView("selection")} className="w-full py-4 text-slate-700 font-bold hover:underline">No, Go back</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "cancel-success") {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6"><div className="text-6xl text-red-500 font-black">X</div></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Subscription canceled</h2>
          <button onClick={onClose} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl">Close</button>
        </div>
      </div>
    );
  }

  // --- MAIN VIEW ---
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Subscription & Plan payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>

        <div className="p-8">
          <div className={`rounded-2xl p-4 flex items-start gap-3 mb-6 border ${currentPlan === "free" ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}>
            {currentPlan === "free" ? <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" /> : <Star className="w-5 h-5 text-blue-600 mt-0.5" />}
            <p className="text-sm text-slate-600"><span className="font-bold text-slate-800">You are on {currentPlan} plan. </span>Upgrade to grow your reach.</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">Upgrade your account</h3>
              <p className="text-xs text-slate-400 mt-1">Choose your preferred subscription plan</p>
            </div>
            <div className="text-right">
               <div className="flex items-center gap-3 justify-end">
                  <span className="text-sm text-slate-500 font-medium">Allow auto-renewal</span>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pro Card */}
            <div onClick={() => setSelectedPlan("pro")} className={`relative border rounded-[2rem] p-8 cursor-pointer transition-all ${selectedPlan === 'pro' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40' : 'border-blue-100'}`}>
               <div className="flex gap-2 mb-4"><span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3 fill-white"/> POPULAR</span></div>
               <div className="flex items-baseline gap-1 mb-6 relative z-10">
                  <h4 className="text-4xl font-black text-slate-900">₦5,000</h4>
                  <span className="text-sm font-bold text-slate-400">/month (Pro)</span>
               </div>
               <ul className="space-y-4 mb-2 relative z-10">
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-bold"><div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center"><Check className="w-3 h-3 text-green-600 stroke-[4]"/></div>Upload 10 products</li>
               </ul>
               <div className="absolute right-[-10%] bottom-[-5%] text-blue-600/10 font-black italic text-8xl select-none">Pro</div>
            </div>

            {/* Premium Card */}
            <div onClick={() => setSelectedPlan("premium")} className={`relative border rounded-[2rem] p-8 cursor-pointer transition-all ${selectedPlan === 'premium' ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/40' : 'border-orange-100'}`}>
               <div className="mb-4"><span className="bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">ENTERPRISE</span></div>
               <div className="flex items-baseline gap-1 mb-6 relative z-10">
                  <h4 className="text-4xl font-black text-slate-900">₦10,000</h4>
                  <span className="text-sm font-bold text-slate-400">/month (Premium)</span>
               </div>
               <ul className="space-y-4 relative z-10">
                  <li className="flex items-center gap-3 text-sm text-slate-600 font-bold"><div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center"><Check className="w-3 h-3 text-green-600 stroke-[4]"/></div>Upload 25 products</li>
               </ul>
               <div className="absolute right-[-5%] bottom-[-5%] text-orange-600/10 font-black italic text-7xl select-none leading-none">Premium</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleCancelClick} className="py-4 border-2 font-bold rounded-2xl border-red-100 text-red-500 hover:bg-red-50">
              {currentPlan === 'free' ? 'Cancel' : 'Cancel subscription'}
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`py-4 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all ${selectedPlan === 'premium' ? 'bg-orange-600' : 'bg-blue-600'} disabled:opacity-70`}
            >
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
              {isProcessing ? "Processing..." : `Renew ₦${(PLAN_PRICES[selectedPlan] / 100).toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
