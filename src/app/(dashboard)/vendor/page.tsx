"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Briefcase, Plus, ExternalLink, ChevronDown,
  Calendar, Tag, AlertCircle, MoreVertical, FolderOpen,
  CheckCircle2, Crown, X, ArrowLeft, Loader2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import SubscriptionModal from './component/SubscriptionModal';
import { VendorHeader } from "./component/VendorHeader";
import { VendorSidebar } from "./component/sidebar";
import DealSubmission from './component/post-deals';

export default function AdvancedDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateDealOpen, setIsCreateDealOpen] = useState(false);

  // Withdrawal States
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const [wStep, setWStep] = useState<'no_account' | 'add_form' | 'account_saved' | 'select_account' | 'enter_amount' | 'final_success'>('no_account');
const [isVendorRejected, setIsVendorRejected] = useState(false);
const [rejectComment, setRejectComment] = useState<string | null>(null);
  // User & Data States
  const [user, setUser] = useState(null);
  const [dealsData, setDealsData] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(true);

  const [wallet, setWallet] = useState({
    availableBalance: 0,
    escrowBalance: 0,
    transactions: []
  });
  // Dynamic Analytics State
  const [analytics, setAnalytics] = useState({
    salesData: [],
    activityData: [],
    platformData: []
  });
 const [currentPlan, setCurrentPlan] = useState("free")


 const [banks, setBanks] = useState([]);
   const [loading, setLoading] = useState(false);
   const [bankDetails, setBankDetails] = useState({ bankCode: '', accountNumber: '', bankName: '' });
   const [withdrawalAmount, setWithdrawalAmount] = useState('');
   const [otp, setOtp] = useState('');
   const [errorMessage, setErrorMessage] = useState('');
const [selectedAccount, setSelectedAccount] = useState(null);





  const hasData = dealsData.length > 0;

  const isFree = currentPlan === "free";
  const isPro = currentPlan === "pro";
  const isPremium = currentPlan === "premium";

  // Calculate totals for the summary boxes
  const totalViews = analytics.activityData.reduce((acc, curr) => acc + curr.views, 0);
  const totalClicks = analytics.activityData.reduce((acc, curr) => acc + curr.clicks, 0);


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
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const parsed = JSON.parse(storedUser);
    if (!parsed?._id) return;

    fetch(`https://dealshub-server.onrender.com/api/users/${parsed._id}`)
      .then(res => res.json())
      .then(data => {
        if (!data) return;

        const updatedUser = {
          ...parsed,
          ...data,
        };

        setUser(updatedUser);
        setCurrentPlan(updatedUser.plan || "free");

        // store plan dates in state-safe form
        if (updatedUser.planCreatedAt) {
          updatedUser.planCreatedAt = new Date(updatedUser.planCreatedAt);
        }
        if (updatedUser.planExpiresAt) {
          updatedUser.planExpiresAt = new Date(updatedUser.planExpiresAt);
        }

        if (updatedUser.saved_accounts?.length > 0) {
          setSelectedAccount(updatedUser.saved_accounts[0]);
        }

        localStorage.setItem("user", JSON.stringify(updatedUser));
      })
      .catch(err => console.error("Failed to fetch user", err));
  }, []);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.brand) return;

    fetch(`https://dealshub-server.onrender.com/api/vendors/name/${parsedUser.brand}`)
      .then((res) => res.json())
      .then((data) => {
        const vendor = data?.vendor;
        if (!vendor) return;

        if (vendor.status === "rejected") {
          // Grab the rejection comment from the dedicated field
          const rejectionComment = vendor.rejectComment || "No reason provided.";
          setRejectComment(rejectionComment); // store in state
          setIsVendorRejected(true);
        }
      })
      .catch((err) => console.error("Error fetching vendor info:", err));
  }, []);



  useEffect(() => {
    if (user?.brand) {
      fetch(`https://dealshub-server.onrender.com/api/wallet/history/${user.brand}`)
        .then(res => res.json())
        .then(data => setWallet(data))
        .catch(err => console.error("Error fetching wallet:", err));
    }
  }, [user]);



  // 1. Initial Load & Data Migration
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      let parsedUser = JSON.parse(storedUser);

      // MIGRATION: If user has old single-account format, convert to array
      if (!parsedUser.saved_accounts) {
        parsedUser.saved_accounts = [];
        if (parsedUser.recipient_code) {
          parsedUser.saved_accounts.push({
            recipient_code: parsedUser.recipient_code,
            account_number: parsedUser.saved_account_number || "Existing Account",
            bank_name: parsedUser.saved_bank_name || "Saved Bank"
          });
        }
      }

      setUser(parsedUser);
      setCurrentPlan(parsedUser.plan || "free");

      // Auto-select the first account if it exists
      if (parsedUser.saved_accounts.length > 0) {
        setSelectedAccount(parsedUser.saved_accounts[0]);
      }
    }

    // Fetch Banks List for the dropdown
    fetch("https://dealshub-server.onrender.com/api/paystack/banks")
      .then(res => res.json())
      .then(json => setBanks(json.data || []))
      .catch(err => console.error("Error fetching banks", err));
  }, []);



  // 2. Dashboard Data Fetching
  const fetchDashboardData = useCallback(async (brandName) => {
    try {
      setLoadingDeals(true);
      const [dealsRes, analyticsRes, walletRes] = await Promise.all([
        fetch(`https://dealshub-server.onrender.com/api/deals/brand/${brandName}`),
        fetch(`https://dealshub-server.onrender.com/api/deals/dashboard-analytic/${brandName}`),
        fetch(`https://dealshub-server.onrender.com/api/wallet/history/${brandName}`)
      ]);

      const dealsJson = await dealsRes.json();
      const analyticsJson = await analyticsRes.json();
      const walletJson = await walletRes.json();

      setDealsData(Array.isArray(dealsJson) ? dealsJson : dealsJson.deals || []);
      setAnalytics(analyticsJson);
      setWallet(walletJson);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoadingDeals(false);
    }
  }, []);

  useEffect(() => {
    if (user?.brand) {
      fetchDashboardData(user.brand);
    }
  }, [user?.brand, fetchDashboardData]);

  // 3. Logic Handlers
  const startWithdrawal = () => {
    const hasSavedAccounts = user?.saved_accounts && user.saved_accounts.length > 0;
    setWStep(hasSavedAccounts ? 'select_account' : 'no_account');
    setIsWithdrawalOpen(true);
  };

  const handleAddBank = async () => {
    if (!bankDetails.bankCode || !bankDetails.accountNumber) {
        setErrorMessage("Please fill all fields");
        return;
    }
    setLoading(true);
    setErrorMessage('');

    const selectedBankObj = banks.find(b => b.code === bankDetails.bankCode);
    const bankName = selectedBankObj ? selectedBankObj.name : "Unknown Bank";

    try {
      const resp = await fetch("https://dealshub-server.onrender.com/api/paystack/create-recipient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name: user.displayName || user.brand || "Vendor",
          account_number: bankDetails.accountNumber,
          bank_code: bankDetails.bankCode
        }),
      });
      const data = await resp.json();

      if (data.success) {
        const newAcc = {
            recipient_code: data.recipient.recipient_code,
            account_number: bankDetails.accountNumber,
            bank_name: bankName
        };

        // Add to array without replacing existing ones
        const updatedAccounts = [...(user.saved_accounts || []), newAcc];
        const updatedUser = { ...user, saved_accounts: updatedAccounts };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSelectedAccount(newAcc);
        setWStep('account_saved');
      } else {
        setErrorMessage(data.message || "Failed to add bank");
      }
    } catch (err) {
      setErrorMessage("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!selectedAccount) return popup("Please select an account");
    setLoading(true);
    try {
      const resp = await fetch("https://dealshub-server.onrender.com/api/paystack/request-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: user._id,
            amount: withdrawalAmount,
            recipient_code: selectedAccount.recipient_code
        }),
      });
      const data = await resp.json();
      if (data.success) setWStep('otp_verify');
      else popup(data.message);
    } catch (err) {
      popup("Error initiating withdrawal");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = async () => {
    setLoading(true);
    try {
      const resp = await fetch("https://dealshub-server.onrender.com/api/paystack/verify-and-withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, otp, amount: withdrawalAmount }),
      });
      const data = await resp.json();
      if (data.success) setWStep('final_success');
      else popup(data.message);
    } catch (err) {
      popup("Verification failed");
    } finally {
      setLoading(false);
    }
  };


  // 1. First, define the dates
  const expiryDate = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const createdDate = user?.planCreatedAt ? new Date(user.planCreatedAt) : null;

  // 2. Second, calculate the math
  const daysLeft = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / 86400000))
    : null;

  // 3. Finally, use the result of that math for your boolean check
  const isExpired = daysLeft !== null && daysLeft <= 0;


  return (
    <>
     {isVendorRejected && (
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
         <div className="bg-white p-8 rounded-2xl max-w-md text-center shadow-2xl">
           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
           <h2 className="text-2xl font-bold text-red-600 mb-2">
             Your vendor account has been rejected
           </h2>
           <p className="text-slate-500 mb-4">
           {rejectComment
        ? `Reason: ${rejectComment}`
        : "Unfortunately, your vendor account has been rejected. Contact support for assistance."}
           </p>
         </div>
       </div>
     )}
    <div className="flex min-h-screen bg-[#FDFDFF] font-sans text-slate-900">

        {/* 2. SIDEBAR: Placed first in the DOM for proper layout flow */}
        <div className="w-64 flex-shrink-0">
    <VendorSidebar />
  </div>

        {/* 3. MAIN CONTENT: Use flex-1 to take up remaining space and overflow-y-auto for scrolling */}
        <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 pb-24 relative">
          <VendorHeader />
      {/* Plan Alert Banner */}
      <div className={`max-w-7xl mx-auto mb-6 rounded-2xl p-4 flex items-start gap-3 border ${
          isFree ? 'bg-red-50 border-red-100' :
          isPro ? 'bg-blue-50 border-blue-100' :
          'bg-orange-50 border-orange-100'
        }`}>
          {isFree ? <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" /> :
           isPremium ? <Crown className="w-6 h-6 text-orange-500 mt-0.5" /> :
           <CheckCircle2 className="w-6 h-6 text-blue-500 mt-0.5" />}

          <div className="flex-1">
            <h4 className="font-bold font-helvetica text-slate-800">You are on {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan</h4>
            <p className="text-sm text-slate-500">
    {isFree && "You can only post 3 deals in a month."}

    {!isFree && expiryDate ? (
      <>
        Your subscription ends on{" "}
        <span className="font-semibold text-slate-700">
          {expiryDate.toLocaleDateString()}
        </span>

        {daysLeft !== null && !isExpired && (
          <span className="ml-1 font-semibold text-slate-600">
            ({daysLeft} {daysLeft === 1 ? "day" : "days"} left)
          </span>
        )}

        {isExpired && (
          <span className="ml-1 font-semibold text-red-600">
            (Expired)
          </span>
        )}
      </>
    ) : (
      !isFree && <span>Subscription information unavailable.</span>
    )}

    {createdDate && (
      <span className="block text-xs text-slate-400 mt-1">
        Plan started: {createdDate.toLocaleDateString()}
      </span>
    )}

    {/* BUTTON LOGIC */}
    <button
      onClick={() => setIsModalOpen(true)}
      className={`font-bold hover:underline ml-1 ${
        isFree
          ? "text-red-500"
          : isExpired
          ? "text-blue-600"
          : isPro
          ? "text-blue-500"
          : "text-orange-500"
      }`}
    >
      {isFree && "Upgrade to Pro"}
      {!isFree && isExpired && "Renew Plan"}
      {isPro && !isExpired && "Upgrade to Premium"}
    </button>
  </p>
          </div>
        </div>

      {isCreateDealOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-[2.5rem] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setIsCreateDealOpen(false)}
              className="absolute top-6 right-6 z-[160] p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
            <DealSubmission onModalClose={() => setIsCreateDealOpen(false)} />
          </div>
        </div>
      )}

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPlan={currentPlan}
      />

      {/* Withdrawal Modal Logic Stays the Same... */}
      {isWithdrawalOpen && (
        <div
className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
onClick={() => setIsWithdrawalOpen(false)}
>
<div
className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto"
onClick={(e) => e.stopPropagation()}
>
                    {wStep === 'no_account' && (
                        <div className="text-center">
                            <FolderOpen size={60} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold mb-6">No account added</h3>
                            <button onClick={() => setWStep('add_form')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Add account</button>
                        </div>
                    )}

                    {wStep === 'add_form' && (
                        <div className="space-y-4">
                            <button onClick={() => setWStep('select_account')} className="flex items-center gap-2 text-slate-400 mb-2"><ArrowLeft size={16}/> Back</button>
                            <h3 className="text-lg font-bold">Add Bank Account</h3>
                            <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setBankDetails({...bankDetails, bankCode: e.target.value})}>
                                <option value="">Select Bank</option>
                                {banks.map(b => <option key={b.id} value={b.code}>{b.name}</option>)}
                            </select>
                            <input type="text" placeholder="Account Number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} />
                            <button disabled={loading} onClick={handleAddBank} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">{loading ? "Saving..." : "Save Account"}</button>
                        </div>
                    )}

                    {wStep === 'account_saved' && (
                        <div className="text-center py-4">
                            <CheckCircle2 size={64} className="mx-auto text-blue-600 mb-4" />
                            <h3 className="text-xl font-bold mb-6">Bank Added!</h3>
                            <button onClick={() => setWStep('select_account')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Continue</button>
                        </div>
                    )}

                    {wStep === 'select_account' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                               <button onClick={() => setIsWithdrawalOpen(false)} className="text-slate-400"><X size={20}/></button>
                               <h3 className="font-bold">Select Account</h3>
                            </div>
                            <div className="space-y-3 mb-6">
                                {user?.saved_accounts?.map((acc, i) => (
                                    <div key={i} onClick={() => setSelectedAccount(acc)} className={`p-4 border rounded-2xl flex justify-between items-center cursor-pointer ${selectedAccount?.recipient_code === acc.recipient_code ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                                        <div>
                                            <p className="font-bold text-sm">{acc.account_number}</p>
                                            <p className="text-[10px] text-blue-500 uppercase">{acc.bank_name}</p>
                                        </div>
                                        {selectedAccount?.recipient_code === acc.recipient_code && <CheckCircle2 size={18} className="text-blue-600" />}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setWStep('add_form')} className="w-full py-3 border-2 border-dotted border-slate-200 text-slate-400 rounded-2xl font-bold mb-4">+ Add new bank</button>
                            <button disabled={!selectedAccount} onClick={() => setWStep('enter_amount')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Continue</button>
                        </div>
                    )}

                    {wStep === 'enter_amount' && (
                      <div>
                        <button onClick={() => setWStep('select_account')} className="text-slate-400 mb-6 flex items-center gap-1"><ArrowLeft size={16}/> Back</button>
                        <h3 className="text-lg font-bold mb-4">Amount</h3>
                        <div className="bg-slate-50 p-6 rounded-2xl mb-2 border border-slate-200 flex items-center">
                          <span className="text-xl font-bold mr-2">₦</span>
                          <input type="number" placeholder="0.00" className="bg-transparent font-bold outline-none w-full text-2xl" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(e.target.value)} />
                        </div>
                        <p className="text-xs text-slate-400 mb-8">Available: ₦{wallet.availableBalance.toLocaleString()}</p>
                        <button disabled={loading} onClick={handleRequestWithdrawal} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">{loading ? "Processing..." : "Get OTP"}</button>
                      </div>
                    )}

                    {wStep === 'otp_verify' && (
                        <div className="text-center">
                            <h3 className="font-bold mb-2">Verify</h3>
                            <input type="text" maxLength={6} className="w-full p-4 bg-slate-50 rounded-2xl text-center text-2xl tracking-widest font-bold mb-6 outline-none" onChange={(e) => setOtp(e.target.value)} />
                            <button onClick={handleFinalVerify} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Confirm</button>
                        </div>
                    )}

                    {wStep === 'final_success' && (
                        <div className="text-center">
                            <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
                            <h3 className="text-xl font-bold">Done!</h3>
                            <p className="text-sm text-slate-400 mt-2 mb-8">Processing 2-3 working days.</p>
                            <button onClick={() => setIsWithdrawalOpen(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Close</button>
                        </div>
                    )}
               </div>
            </div>
          )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50/40 border border-blue-100 rounded-[2rem] p-6">
              <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold">
                <Wallet className="w-5 h-5" /> Wallet balance
              </div>
              <div className="flex items-baseline gap-2 mb-1">
    <div className="flex items-center gap-1 bg-white border rounded px-1.5 py-0.5 text-[10px] font-bold">
      🇳🇬 NGN <ChevronDown className="w-3 h-3" />
    </div>
    <span className="text-3xl font-bold">
      {wallet.availableBalance.toLocaleString()}
    </span>
  </div>
  <p className="text-xs text-slate-400 mb-8">
    Escrow balance: {wallet.escrowBalance.toLocaleString()}
  </p>

              <div className="flex items-center justify-between">

                <button
                  onClick={startWithdrawal}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  Withdraw <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-orange-50/40 border border-orange-100 rounded-[2rem] p-6">
              <div className="flex items-center gap-2 mb-4 text-orange-500 font-semibold">
                <Briefcase className="w-5 h-5" /> Total deals
              </div>
              <span className="text-3xl font-bold block mb-1">{dealsData.length}</span>
              <p className="text-xs text-slate-400 mb-8">
                Available deals {dealsData.filter(d => d.status === 'active').length}
              </p>
              <div className="flex items-center justify-between">

                <button
                  onClick={() => setIsCreateDealOpen(true)}
                  className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create new deal
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm min-h-[400px]">
            <div className="flex justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Tag className="w-5 h-5 text-blue-600 fill-blue-600" /> Deals
              </div>
            </div>

            <div className="overflow-x-auto">
                {loadingDeals ? (
                  <div className="flex flex-col items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-50 text-left">
                        <th className="pb-4 font-normal">Product Image</th>
                        <th className="pb-4 font-normal">Title</th>
                        <th className="pb-4 font-normal">Original Price</th>
                        <th className="pb-4 font-normal">Discount Price</th>
                        <th className="pb-4 font-normal">Status</th>
                        <th className="pb-4 font-normal text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {dealsData.map((deal) => (
                        <tr key={deal._id} className="group hover:bg-slate-50/50 transition">
                          <td className="py-3">
                            <img src={deal.images?.[1]} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          </td>
                          <td className="py-3 font-semibold text-slate-700 max-w-[150px] truncate">{deal.title}</td>
                          <td className="py-3 text-slate-500">₦{deal.originalPrice?.toLocaleString()}</td>
                          <td className="py-3 text-slate-500">₦{deal.discountedPrice?.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${deal.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                              {deal.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <MoreVertical className="w-4 h-4 text-slate-300 ml-auto cursor-pointer" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>
          </div>
        </div>

        {/* Dynamic Analytics Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm">Performance Analysis</h3>
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${isFree ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                  {!isFree ? "Live Data" : "Preview Mode"}
                </span>
             </div>

             <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  {!isFree ? (
                    <LineChart data={analytics.activityData}>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Views" />
                      <Line type="monotone" dataKey="clicks" stroke="#fb923c" strokeWidth={2} dot={false} name="Clicks" />
                      <XAxis dataKey="name" hide />
                    </LineChart>
                  ) : (
                    <BarChart data={analytics.activityData}>
                      <Bar dataKey="views" fill="#f1f5f9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold mb-1">{!isFree ? totalClicks.toLocaleString() : "-"}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Clicks</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <div className="text-xl font-bold mb-1">{!isFree ? totalViews.toLocaleString() : "-"}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Views</div>
                </div>
             </div>

             {/* Platform Distribution Pie Chart */}
             <div className="flex justify-center mb-8 relative">
               <div className="w-32 h-32">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={analytics.platformData.length > 0 ? analytics.platformData : [{name: 'None', value: 1, color: '#f1f5f9'}]}
                       innerRadius={35}
                       outerRadius={50}
                       dataKey="value"
                       stroke="none"
                       paddingAngle={5}
                     >
                       {analytics.platformData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Top Platforms</span>
                  <span>Deals Count</span>
                </div>
                {analytics.platformData.map((plat) => (
                  <div key={plat.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full" style={{backgroundColor: plat.color}}></span>
                       <span className="font-semibold text-slate-500">{plat.name}</span>
                    </div>
                    <span className="text-slate-700 font-bold">{plat.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
  </main>
    </div>
    </>
  );
}
