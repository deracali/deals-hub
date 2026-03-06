"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Wallet, TrendingUp, Calendar, ArrowUpRight,
  CheckCircle2, XCircle, RefreshCcw, CreditCard,
  FileText, Search, ChevronDown, AlertCircle, X, ArrowLeft, Home
} from 'lucide-react';
import { VendorHeader } from "../component/VendorHeader";
import { VendorSidebar } from "../component/sidebar";

// --- MOCK DATA ---
const TRANSACTIONS = [
  { id: 1, type: 'Premium Subscription', status: 'success', date: '1 mins ago', amount: '200,000,000.00', category: 'Today' },
  { id: 2, type: 'Pro Subscription', status: 'success', date: '1 mins ago', amount: '200,000,000.00', category: 'Today' },
  { id: 3, type: 'Deals Payment', status: 'deals', date: '1 mins ago', amount: '200,000,000.00', category: 'Today' },
  { id: 4, type: 'Deals Refund!', status: 'refund', date: '1 mins ago', amount: '200,000,000.00', category: 'Today' },
  { id: 5, type: 'Withdrawal Successful!', status: 'success_withdraw', date: '1 mins ago', amount: '200,000,000.00', category: 'Today' },
  { id: 6, type: 'Withdrawal Failed!', status: 'failed', date: '1 mins ago', amount: '200,000,000.00', category: 'Today' },
];


interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasAccount: boolean;
  setHasAccount: (val: boolean) => void;
  user: { _id: string; displayName?: string };
}
// --- SUB-COMPONENTS ---




const WithdrawalModal = ({ isOpen, onClose, hasAccount, setHasAccount, user }: WithdrawalModalProps) => {
  const [step, setStep] = useState<'no_account' | 'add_form' | 'account_saved' | 'select_account' | 'enter_amount' | 'otp_verify' | 'final_success'>(
      hasAccount ? 'select_account' : 'no_account'
    );

    const [otp, setOtp] = useState('');


    useEffect(() => {
    if (isOpen) {
      setStep(hasAccount ? 'select_account' : 'no_account');
      setErrorMessage('');
    }
  }, [isOpen, hasAccount]);


  // Paystack & Withdrawal States
  const [banks, setBanks] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState({ bankCode: '', accountNumber: '', bankName: '' });
  const [selectedAccount, setSelectedAccount] = useState<any>(user?.saved_accounts?.[0] || null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


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
    fetch("https://dealshub-server.onrender.com/api/paystack/banks")
      .then(res => res.json())
      .then(json => setBanks(json.data || []))
      .catch(err => console.error("Error fetching banks", err));
  }, []);

  const handleAddBank = async () => {
    if (!bankDetails.bankCode || !bankDetails.accountNumber) {
      setErrorMessage("Please fill all fields");
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const resp = await fetch("https://dealshub-server.onrender.com/api/paystack/create-recipient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name: user.displayName || "Vendor",
          account_number: bankDetails.accountNumber,
          bank_code: bankDetails.bankCode
        }),
      });
      const data = await resp.json();
      if (data.success) {
        const selectedBankObj = banks.find(b => b.code === bankDetails.bankCode);
        const newAcc = {
          recipient_code: data.recipient.recipient_code,
          account_number: bankDetails.accountNumber,
          bank_name: selectedBankObj ? selectedBankObj.name : "Unknown Bank"
        };
        setSelectedAccount(newAcc);
        setHasAccount(true);
        setStep('account_saved');
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
        if (data.success) {
          setStep('otp_verify'); // Move to OTP entry screen
        } else {
          popup(data.message);
        }
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
          body: JSON.stringify({
              userId: user._id,
              otp: otp,
              amount: withdrawalAmount
          }),
        });
        const data = await resp.json();
        if (data.success) setStep('final_success');
        else popup(data.message);
      } catch (err) {
        popup("Verification failed");
      } finally {
        setLoading(false);
      }
    };

  if (!isOpen) return null;

  return (
    <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        onClick={onClose} // 1. Clicking this outer div closes the modal
      >
        <div
          className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()} // 2. Prevents clicks inside from closing the modal
        >
        {/* STEP: SELECT ACCOUNT */}
        {step === 'select_account' && (
          <div className="p-8">
            <button onClick={onClose} className="flex items-center gap-2 text-gray-400 text-sm mb-6 font-medium">
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="text-lg font-bold mb-6 text-slate-900">Select account</h3>
            <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto">
              {user?.saved_accounts?.map((acc: any, index: number) => (
                <div
                  key={index}
                  onClick={() => setSelectedAccount(acc)}
                  className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer ${
                    selectedAccount?.recipient_code === acc.recipient_code ? 'border-blue-400 bg-blue-50/30' : 'border-gray-100'
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm">{acc.account_number}</p>
                    <p className="text-xs text-blue-500">{acc.bank_name}</p>
                  </div>
                  {selectedAccount?.recipient_code === acc.recipient_code && <CheckCircle2 size={14} className="text-blue-600" />}
                </div>
              ))}
              <button onClick={() => setStep('add_form')} className="w-full py-4 border-2 border-dotted border-blue-400 text-blue-500 rounded-2xl font-bold text-sm">
                + Add new bank account
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={onClose} className="flex-1 py-4 border border-red-500 text-red-500 rounded-2xl font-bold text-sm">Cancel</button>
              <button onClick={() => setStep('enter_amount')} disabled={!selectedAccount} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm">Continue</button>
            </div>
          </div>
        )}

        {/* STEP: ADD FORM */}
        {step === 'add_form' && (
          <div className="p-8">
            <button onClick={() => setStep(hasAccount ? 'select_account' : 'no_account')} className="flex items-center gap-2 text-gray-400 text-sm mb-6">
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="text-lg font-bold mb-6">Add new account</h3>
            <div className="space-y-4">
              <select
                value={bankDetails.bankCode}
                onChange={e => setBankDetails({ ...bankDetails, bankCode: e.target.value })}
                className="w-full p-4 border border-gray-100 rounded-2xl"
              >
                <option value="">Select bank</option>
                {banks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Account Number"
                value={bankDetails.accountNumber}
                onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full p-4 bg-gray-50 rounded-2xl"
              />
              {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
              <button onClick={handleAddBank} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">
                {loading ? 'Saving...' : 'Save Account'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: ACCOUNT SAVED */}
        {step === 'account_saved' && (
          <div className="p-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Account saved!</h3>
            <button onClick={() => setStep('select_account')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Withdraw Now</button>
          </div>
        )}

        {/* STEP: ENTER AMOUNT */}
        {step === 'enter_amount' && (
          <div className="p-8">
            <h3 className="text-lg font-bold mb-6">Enter Amount</h3>
            <input
              type="number"
              value={withdrawalAmount}
              onChange={e => setWithdrawalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-4 bg-gray-50 rounded-2xl text-2xl font-bold"
            />
            <button onClick={handleRequestWithdrawal} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-6">
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        )}


        {step === 'otp_verify' && (
           <div className="p-8 text-center">
             <h3 className="font-bold text-lg mb-2">Enter OTP</h3>
             <p className="text-sm text-slate-500 mb-6">Enter the code sent to your email</p>
             <input
               type="text"
               maxLength={6}
               className="w-full p-4 bg-slate-50 rounded-2xl text-center text-2xl tracking-[10px] font-bold mb-6 outline-none border focus:border-blue-500"
               onChange={(e) => setOtp(e.target.value)}
             />
             <button
               disabled={loading || otp.length < 5}
               onClick={handleFinalVerify}
               className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold disabled:opacity-50"
             >
               {loading ? "Verifying..." : "Confirm Withdrawal"}
             </button>
           </div>
         )}

        {/* STEP: FINAL SUCCESS */}
        {step === 'final_success' && (
          <div className="p-12 text-center">
            <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
            <h3 className="text-2xl font-bold mb-2">Withdrawal Sent!</h3>
            <p className="text-gray-400 mb-8">It will take 2-3 business days to process.</p>
            <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Done</button>
          </div>
        )}

      </div>
    </div>
  );
};




const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="relative mb-6">
      <div className="mb-6">
        <Image
          src="/Group 49.png"
          alt="Nothing here"
          width={100}
          height={100}
          className="opacity-80"
        />
      </div>
    </div>
    <h3 className="text-gray-900 font-medium">Oops! Nothing to see.</h3>
    <p className="text-sm text-gray-400 max-w-[220px] mt-1">
      We'll let you know when something new comes in
    </p>
  </div>
);

const BalanceCard = ({ title, amount, escrow, hasData, showWithdraw, onWithdraw }: any) => (
  <div className="relative overflow-hidden bg-[#F4F9FF] p-6 rounded-3xl border border-blue-50 flex-1 min-w-[300px]">
    <div className="absolute -right-4 -top-4 opacity-5">
      <Wallet size={160} />
    </div>

    <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
      {title === 'Wallet balance' ? <Wallet size={18} className="text-blue-500" /> : <TrendingUp size={18} className="text-blue-500" />}
      <span className="text-sm">{title}</span>
    </div>

    <div className="flex items-center gap-3 mb-1">
      <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-md text-[10px] font-bold">
        <div className="w-3 h-3 bg-green-600 rounded-full border border-white" />
        NGN <ChevronDown size={12} />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        {hasData ? amount : '0.00'}
      </h2>
    </div>
    <p className="text-[11px] text-gray-400">
      Escrow balance: <span className="font-medium text-gray-600">{hasData ? escrow : '0.00'}</span>
    </p>

    {showWithdraw && (
      <button
        onClick={onWithdraw}
        className="absolute bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
      >
        Withdraw <ArrowUpRight size={14} />
      </button>
    )}
  </div>
);

export default function WalletPage() {
  const [hasData, setHasData] = useState(true);
  const [hasAccount, setHasAccount] = useState(false); // State to track if bank account is added
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(TRANSACTIONS[5]);
  const [wallet, setWallet] = useState<any>(null); // Added state here
    const [loading, setLoading] = useState(true);   // Added loading state

    const latestTx = hasData && wallet?.transactions?.length ? wallet.transactions[0] : null;
    const [activeTab, setActiveTab] = useState('All transactions');


    const [user, setUser] = useState<any>(null);

      useEffect(() => {
        const fetchWallet = async () => {
          try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return;

            let parsedUser = JSON.parse(storedUser);

            // MIGRATION LOGIC (Same as Dashboard)
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
            setHasAccount(parsedUser.saved_accounts.length > 0);

            const brand = parsedUser?.brand;
            if (!brand) return;

            const res = await fetch(`https://dealshub-server.onrender.com/api/wallet/history/${brand}`);
            const data = await res.json();
            setWallet(data);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        };

        fetchWallet();
      }, []);



    const filteredTransactions = wallet?.transactions?.filter((tx: any) => {
      if (activeTab === 'All transactions') return true;
      if (activeTab === 'Sales') return tx.type.toLowerCase().includes('deal') || tx.type.toLowerCase().includes('payment');
      if (activeTab === 'Subscriptions') return tx.type.toLowerCase().includes('subscription');
      if (activeTab === 'Withdrawal') return tx.type.toLowerCase().includes('withdraw');
      return false;
    }) || [];



    return (
    <div className="flex h-screen w-full bg-[#FDFDFF] font-sans text-slate-900 overflow-hidden">
      {/* 1. SIDEBAR: Added flex-shrink-0 to prevent it from collapsing */}
      <div className="hidden md:flex md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-100">
        <VendorSidebar />
      </div>

      {/* 2. MAIN CONTENT: Remains flex-1 to fill the rest of the screen */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 pb-24 relative">
        <VendorHeader />

        {/* Top Cards */}
        <div className="flex flex-wrap py-10 gap-6 mb-10">
          <BalanceCard
            title="Wallet balance"
            amount={wallet?.availableBalance?.toLocaleString() || "0.00"}
            escrow={wallet?.escrowBalance?.toLocaleString() || "0.00"}
            hasData={!!wallet}
            showWithdraw
            onWithdraw={() => setIsModalOpen(true)}
          />
          <BalanceCard
            title="Total revenue"
            amount={wallet?.totalRevenue?.toLocaleString() || "0.00"}
            escrow={wallet?.escrowBalance?.toLocaleString() || "0.00"}
            hasData={!!wallet}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Transaction History Column */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold">Transaction history</h2>
              <Calendar size={18} className="text-gray-400" />
            </div>

            <div className="flex gap-4 border-b border-gray-100 mb-6 pb-2 overflow-x-auto no-scrollbar">
              {['All transactions', 'Sales', 'Subscriptions', 'Withdrawal'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs whitespace-nowrap px-4 py-2 rounded-full font-medium ${
                    activeTab === tab
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {!hasData ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx: any) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold">{tx.type}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold">₦{tx.amount.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-10">
                    No transactions found for this tab.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Message Preview Column */}
          <section>
            <h2 className="font-bold mb-6">Message preview</h2>
            <div className="border border-gray-50 rounded-[32px] p-8 h-full min-h-[500px] flex flex-col bg-white">
              {!hasData ? (
                <EmptyState />
              ) : (
                <div className="animate-in fade-in duration-500">
                  {latestTx ? (
                    <>
                      <div
                        className={`p-4 rounded-2xl flex items-center gap-4 mb-6 ${
                          latestTx.status === "failed"
                            ? "bg-[#FEF2F2]"
                            : latestTx.status === "success"
                            ? "bg-[#F0FDF4]"
                            : "bg-[#FFFBEB]"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-full ${
                            latestTx.status === "failed"
                              ? "bg-red-500"
                              : latestTx.status === "success"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {latestTx.status === "failed" && <XCircle size={16} className="text-white" />}
                          {latestTx.status === "success" && <CheckCircle2 size={16} className="text-white" />}
                          {latestTx.status === "deals" && <RefreshCcw size={16} className="text-white" />}
                        </div>

                        <div className="flex-1">
                          <h4 className="text-sm font-bold capitalize">{latestTx.type}</h4>
                          <p className="text-[10px] text-gray-500">
                            ₦{parseFloat(latestTx.amount).toLocaleString()} — {latestTx.category}
                          </p>
                        </div>

                        <span className="text-[10px] text-gray-400 italic">{latestTx.date}</span>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mb-8">
                        {latestTx.status === "failed"
                          ? "Your withdrawal failed. Please check the account details and try again."
                          : "Your transaction was successful."}
                      </p>

                      <div className="space-y-4 border-t border-gray-50 pt-8">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                          Transaction details
                        </h5>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Transaction type</span>
                          <span className="font-medium text-slate-800">{latestTx.type}</span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Status</span>
                          <span className="font-medium text-slate-800 capitalize">{latestTx.status}</span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Amount</span>
                          <span className="font-medium text-slate-800">₦{parseFloat(latestTx.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <EmptyState />
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <WithdrawalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          hasAccount={hasAccount}
          setHasAccount={setHasAccount}
          user={user}
        />
      </main>
    </div>
  );
}
