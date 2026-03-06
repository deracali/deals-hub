import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Star,
  Copy,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  Ban,
  ShieldCheck,
  Check,
  Unlock,
  AlertCircle,
  FileText, // Added for doc icon
  Eye,      // Added for preview
  Download  // Added for footer
} from "lucide-react";

interface VendorDetailModalProps {
  vendor: any;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void; // ✅ Add this
}


export function VendorDetailModal({ vendor, onClose, onStatusChange, }: VendorDetailModalProps) {
  const [activeTab, setActiveTab] = useState("active");

  // Status/Logic States
  const [isBlocked, setIsBlocked] = useState(vendor?.status === "Blocked");
  const [isSuspended, setIsSuspended] = useState(vendor?.status === "Suspended");
  const [showCACModal, setShowCACModal] = useState(false);

  // Modal Visibility States
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showAcceptSuccess, setShowAcceptSuccess] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showSuspendSuccess, setShowSuspendSuccess] = useState(false);
  const [showUnsuspendConfirm, setShowUnsuspendConfirm] = useState(false);
  const [showUnsuspendSuccess, setShowUnsuspendSuccess] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);



  useEffect(() => {
  const fetchBrandDeals = async () => {
    if (!vendor?.name) return;
    try {
      setLoadingDeals(true);
      // Using the brand name to fetch deals
      const res = await fetch(`https://dealshub-server.onrender.com/api/deals/brand/${vendor.name}`);
      const json = await res.json();
      setDeals(json.deals || []);
    } catch (err) {
      console.error("Failed to fetch brand deals:", err);
    } finally {
      setLoadingDeals(false);
    }
  };

  fetchBrandDeals();
}, [vendor?.name]);


const activeDeals = deals.filter(deal => {
  const createdDate = new Date(deal.createdAt);
  const now = new Date();
  // Example: "Current" is defined as created within the last 30 days
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  return createdDate >= thirtyDaysAgo;
});

const pastDeals = deals.filter(deal => {
  const createdDate = new Date(deal.createdAt);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  return createdDate < thirtyDaysAgo;
});

const displayDeals = activeTab === "active" ? activeDeals : pastDeals;


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


  // ----- Actions -----
  const confirmAccept = async () => {
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/vendors/${vendor._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      if (!res.ok) throw new Error("Failed to accept vendor");

      setShowAcceptConfirm(false);
      setShowAcceptSuccess(true);
      setIsBlocked(false);
      setIsSuspended(false);

      // Update parent table immediately
      onStatusChange(vendor._id, "active");

    } catch (error) {
      console.error(error);
      popup("Failed to accept vendor.");
    }
  };

  const confirmReject = async () => {
    try {
      const res = await fetch(`https://dealshub-server.onrender.com/api/vendors/${vendor._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", reason: rejectComment }),
      });
      if (!res.ok) throw new Error("Failed to reject vendor");

      setShowRejectConfirm(false);
      setShowRejectSuccess(true);
      setIsBlocked(true);
      setIsSuspended(false);

      // Update parent table immediately
      onStatusChange(vendor._id, "rejected");

    } catch (error) {
      console.error(error);
      popup("Failed to reject vendor.");
    }
  };


  const confirmSuspend = async () => {
    setIsSuspended(true);
    setShowSuspendConfirm(false);
    setShowSuspendSuccess(true);
  };

  const confirmUnsuspend = async () => {
    setIsSuspended(false);
    setShowUnsuspendConfirm(false);
    setShowUnsuspendSuccess(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="w-full max-w-4xl max-h-[90vh] bg-white overflow-y-auto rounded-xl shadow-lg animate-in fade-in duration-300">

          {/* Header Navigation */}
          <div className="p-4 flex items-center gap-2 text-gray-500 border-b border-gray-100 sticky top-0 bg-white z-10">
            <button onClick={onClose} className="flex items-center gap-1 text-[13px] font-medium hover:text-gray-900">
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* Banner Section */}
          <div className="relative h-48 w-full bg-[#FFD700]">
            <img
              src={vendor?.businessBanner}
              alt="Banner"
              className="w-full h-full object-cover mix-blend-multiply opacity-60"
            />
            <div className="absolute -bottom-10 left-8">
              <div className="relative w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                <img src={vendor?.passportPhoto || "https://avatar.vercel.sh/slyce"} alt="Avatar" className="w-full h-full object-cover" />
                {!isBlocked && (
                   <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full border-2 border-white p-0.5">
                    <CheckCircle2 size={12} className="text-white fill-current" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 pt-12 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{vendor?.name || "Sims Closet"}</h2>

                </div>
                <div className="flex items-center gap-4 mt-1 text-gray-400 text-[13px]">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> {vendor?.country}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-orange-400 fill-current" />
                    <span className="text-gray-900 font-bold">4.7</span> (310+)
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-gray-500 max-w-md leading-relaxed">
                {vendor?.description}
                </p>
                <div className="flex gap-3 mt-4">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#007AFF] text-[11px] font-bold rounded-md">
                    <ExternalLink size={12} /> {vendor?.totalDeals} Active deals
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-500 text-[11px] font-bold rounded-md">
                    {vendor?.subscription}
                  </button>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="space-y-4 text-[11px]">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Store Address</p>
                  <p className="text-gray-700 font-semibold leading-tight max-w-[200px]">
                    {vendor?.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-gray-700 font-semibold">{vendor?.businessEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Phone No.</p>
                  <div className="flex items-center gap-4">
                     <p className="text-gray-700 font-semibold">{vendor?.businessPhone}</p>
                     <button className="flex items-center gap-1 px-3 py-1.5 bg-[#22C55E] text-white rounded-md font-bold">
                       Copy phone <Copy size={12} />
                     </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="mt-10">
              <h3 className="text-[14px] font-bold text-gray-900 mb-4">Subscription & Plan payment</h3>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Star className="text-white fill-current" size={20} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">{vendor?.subscription}</p>
                    <p className="text-[12px] text-gray-500">Subscription will expired 15th, November, 2025</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MY DOCUMENTS SECTION (STYLED AS PER image_d8c118.png) */}
            <div className="mt-10">
              <h3 className="text-[14px] font-bold text-gray-900 mb-4">My Documents</h3>

              <div className="mb-4">
                <label className="text-[11px] text-gray-400 font-bold uppercase mb-2 block">Document type</label>
                <div className="relative">
                  <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-[13px] text-gray-600 appearance-none outline-none">
                    <option>CAC Registration</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-bold uppercase mb-2 block">Upload document</label>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
                   <div
                    onClick={() => setShowCACModal(true)}
                    className="relative w-32 h-40 bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all shadow-sm"
                   >
                     <img
                      src={vendor?.cacDocument}
                      alt="CAC Preview"
                      className="w-full h-full object-cover opacity-90"
                     />
                     <div className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye size={24} className="text-white drop-shadow-md" />
                     </div>
                   </div>

                   <div className="flex items-center gap-2">
                     <span className="text-[12px] font-bold text-gray-700">MYCACDoc.PDF</span>
                     <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                       Upload Successful <Check size={12} strokeWidth={3} />
                     </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAcceptConfirm(true)}
                  className="flex-1 py-3 bg-[#22C55E] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                >
                  ✓ Accept Vendor
                </button>
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="flex-1 py-3 border border-red-100 text-red-500 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                >
                  ✕ Reject Vendor
                </button>
              </div>

              {!isBlocked && (
                <button
                  onClick={() => isSuspended ? setShowUnsuspendConfirm(true) : setShowSuspendConfirm(true)}
                  className={`w-full py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all ${
                    isSuspended ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {isSuspended ? <Unlock size={18} /> : <Ban size={18} />}
                  {isSuspended ? "Unsuspend Vendor" : "Suspend Vendor"}
                </button>
              )}
            </div>

            {/* Tabs & Content */}
            <div className="w-full mt-10">
    <div className="flex justify-center items-center gap-12 border-b border-gray-100">
      <button
        onClick={() => setActiveTab("active")}
        className={`flex items-center gap-2 pb-3 text-[14px] transition-all duration-200 ${
          activeTab === "active" ? "text-[#007AFF] font-bold border-b-2 border-[#007AFF]" : "text-gray-400 font-medium border-b-2 border-transparent"
        }`}
      >
        Active deals <span className="bg-[#F97316] text-white text-[10px] px-1.5 py-0.5 rounded-full">{activeDeals.length}</span>
      </button>
      <button
        onClick={() => setActiveTab("past")}
        className={`flex items-center gap-2 pb-3 text-[14px] transition-all duration-200 ${
          activeTab === "past" ? "text-[#007AFF] font-bold border-b-2 border-[#007AFF]" : "text-gray-400 font-medium border-b-2 border-transparent"
        }`}
      >
        Past deals <span className="bg-[#F97316] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pastDeals.length}</span>
      </button>
    </div>

    <div className="mt-8">
      {loadingDeals ? (
        <div className="py-20 text-center text-gray-400">Loading deals...</div>
      ) : displayDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDeals.map((deal) => (
            <div key={deal._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-200">
                <img src={deal.images[0]} alt={deal.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
                  -{deal.discountPercentage}%
                </div>
              </div>
              <div className="p-4">
                 <h4 className="text-[14px] font-bold text-gray-900 line-clamp-1">{deal.title}</h4>
                 <div className="flex items-center gap-2 mt-2">
                   <span className="text-[16px] font-bold text-gray-900">{deal.currencySymbol}{deal.discountedPrice}</span>
                   <span className="text-[12px] text-gray-400 line-through">{deal.currencySymbol}{deal.originalPrice}</span>
                 </div>
                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                   <span className="text-[10px] text-gray-400">{new Date(deal.createdAt).toLocaleDateString()}</span>
                   <span className="text-[10px] font-bold text-blue-500 uppercase">{deal.availability}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative w-48 h-32 mb-4">
            <img src="/Group 49.png" alt="No deals" className="w-full h-full object-contain opacity-80" />
          </div>
          <h3 className="text-gray-400 text-[14px] font-medium max-w-[280px] leading-relaxed">
            Oops! Nothing to see. We'll let you know when something new comes in
          </h3>
        </div>
      )}
    </div>
  </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL (STYLED AS PER image_d9228f.png) */}
      {showCACModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">

            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setShowCACModal(false)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <h3 className="text-sm font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">Certificate Preview</h3>
              <button
                onClick={() => setShowCACModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Body */}
            <div className="flex-1 bg-gray-50 overflow-auto flex justify-center p-8">
              <div className="bg-white shadow-lg border border-gray-200 p-4 rounded-sm">
                <img
                  src="/image_d9228f.png"
                  alt="Full Certificate"
                  className="max-w-full h-auto"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50">
                <Download size={16} /> Download PDF
              </button>
              <button
                onClick={() => setShowCACModal(false)}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------
          LOGIC OVERLAYS
      ------------------------- */}

      {/* Accept Confirmation */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Accept Application?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to approve this vendor application?</p>
            <div className="flex gap-3">
              <button onClick={confirmAccept} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold">Yes, Accept</button>
              <button onClick={() => setShowAcceptConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-in zoom-in-95">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold">Reject Application?</h3>
              <p className="text-sm text-gray-500 text-center mt-1">Please provide a reason for rejecting this vendor.</p>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full mt-4 p-3 border border-gray-100 rounded-lg text-sm focus:ring-1 focus:ring-red-200 outline-none"
                rows={4}
              />
              <div className="flex gap-3 w-full mt-6">
                <button onClick={confirmReject} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Reject Vendor</button>
                <button onClick={() => setShowRejectConfirm(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold">Go back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation */}
      {showSuspendConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">Suspend Vendor?</h3>
            <p className="text-sm text-gray-500 mb-6">The vendor will be temporarily restricted from accessing the platform.</p>
            <div className="flex gap-3">
              <button onClick={confirmSuspend} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold">Yes, Suspend</button>
              <button onClick={() => setShowSuspendConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Unsuspend Confirmation */}
      {showUnsuspendConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Unlock size={32} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold">Unsuspend Vendor?</h3>
            <p className="text-sm text-gray-500 mb-6">This will restore the vendor's full access to the platform.</p>
            <div className="flex gap-3">
              <button onClick={confirmUnsuspend} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold">Yes, Unsuspend</button>
              <button onClick={() => setShowUnsuspendConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Success Feedback */}
      {(showAcceptSuccess || showRejectSuccess || showSuspendSuccess || showUnsuspendSuccess) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60">
          <div className="bg-white w-full max-w-xs rounded-2xl p-8 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${showRejectSuccess ? 'bg-red-50' : 'bg-green-50'}`}>
              <ShieldCheck size={32} className={showRejectSuccess ? 'text-red-500' : 'text-green-500'} />
            </div>
            <h3 className="text-xl font-bold">Success!</h3>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              {showAcceptSuccess && "Vendor has been approved."}
              {showRejectSuccess && "Vendor has been rejected/blocked."}
              {showSuspendSuccess && "Vendor has been suspended."}
              {showUnsuspendSuccess && "Vendor has been unsuspended."}
            </p>
            <button
              onClick={() => {
                setShowAcceptSuccess(false);
                setShowRejectSuccess(false);
                setShowSuspendSuccess(false);
                setShowUnsuspendSuccess(false);
              }}
              className="text-blue-600 font-bold text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
