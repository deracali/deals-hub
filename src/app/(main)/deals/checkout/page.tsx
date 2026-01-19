"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Edit3,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/general/header";
import { usePaystackPayment } from "@/utils/usePaystackPayment"; // adjust path if needed
import { useRouter } from "next/navigation";

const CheckoutPage = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { paystackReady, openPaystackPayment } = usePaystackPayment();
  const [user, setUser] = useState(null);
  const router = useRouter();
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")); // or the key you used
    if (storedUser) setUser(storedUser);
  }, []);

  // Shipping address state with default values
  const [shippingAddress, setShippingAddress] = useState({
    name: "John Doe",
    address: "123 Main Street, City Center",
    phone: "+1 000 000 0000",
    lga: "N/A",
    postalCode: "000000",
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Shipping method state
  const [selectedShipping, setSelectedShipping] = useState("standard");

  // Order state from localStorage
  const [orderItems, setOrderItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load order from localStorage
  useEffect(() => {
    const storedOrder = JSON.parse(localStorage.getItem("order")) || [];
    setOrderItems(storedOrder);

    const total = storedOrder.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );
    setTotalPrice(total);
  }, []);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const uploadOrder = async (transaction) => {
    try {
      const response = await fetch(`${baseURL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          items: orderItems.map((item) => ({
            productId: item.id,
            title: item.title,
            originalPrice: item.originalPrice,
            discountedPrice: item.discountedPrice,
            quantity: item.quantity,
            currency: "USD",
            images: item.images || [],
            size: item.size || null,
            color: item.color || null,
            totalPrice: item.totalPrice,
            addedAt: item.addedAt || new Date(),
          })),
          itemsTotal: totalPrice,
          discountTotal: 0,
          shippingFee: selectedShipping === "standard" ? 0 : 0,
          grandTotal: totalPrice, // can add shipping if not free
          currency: "USD",
          paymentReference: transaction.reference, // Paystack reference
          status: "paid",
          shippingAddress: {
            name: shippingAddress.name,
            address: shippingAddress.address,
            lga: shippingAddress.lga,
            state: shippingAddress.lga, // or separate state field
            postalCode: shippingAddress.postalCode,
            phone: shippingAddress.phone,
          },
          shippingMethod: {
            label: selectedShipping === "standard" ? "Standard" : "Pickup",
            price: 0,
            deliveryDates:
              selectedShipping === "standard" ? "Nov 14-25" : "Nov 14-20",
            courier: "Speedaf, GIG",
          },
        }),
      });

      const data = await response.json();
      console.log("Order uploaded successfully:", data);

      localStorage.removeItem("order");
      setOrderItems([]); // Optional: clear state so UI updates immediately
      setTotalPrice(0); // Optional: reset total price
    } catch (err) {
      console.error("Error uploading order:", err);
    }
  };

  const handlePayment = async () => {
    if (!paystackReady) {
      alert("Paystack is not ready yet. Please wait...");
      return;
    }

    if (!user?.email) {
      alert("User email not found.");
      return;
    }

    // Convert total price to kobo
    const amountInKobo = Math.round(totalPrice * 100);

    await openPaystackPayment({
      email: user.email,
      amount: amountInKobo,
      businessName: "Cardzip",
      onSuccess: async (transaction) => {
        console.log("Payment successful!", transaction);

        // Upload order to backend
        await uploadOrder(transaction);

        // Show modal
        setShowSuccessModal(true);
      },
      onCancel: () => {
        console.warn("Payment cancelled");
      },
    });
  };

  return (
    <div
      className={`min-h-screen bg-white font-sans text-slate-900 ${showSuccessModal ? "overflow-hidden" : ""}`}
    >
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6">
        <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-black transition-colors">
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-10">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                <span className="text-2xl">🛒</span>
              </div>
              <div>
                <h1 className="text-3xl font-black">Checkout</h1>
                <p className="text-gray-400 text-sm font-medium">
                  You have{" "}
                  <span className="text-slate-900 font-bold">
                    ({orderItems.length}) items
                  </span>{" "}
                  in your cart
                </p>
              </div>
            </div>

            {/* Payment Method Alert */}
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 flex items-center gap-4">
              <div className="bg-[#22C55E] p-2 rounded-xl text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Payment method
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  All payment are made through{" "}
                  <span className="text-[#00BFFF] font-black italic">
                    paystack
                  </span>
                </p>
              </div>
            </div>

            {/* Shipping Address Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black flex items-center gap-2">
                  Shipping address
                </h2>
                <button
                  className="text-blue-500 text-sm font-bold flex items-center gap-1"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                >
                  <Edit3 size={14} />{" "}
                  <span className="border-b border-blue-500">
                    {isEditingAddress ? "Cancel" : "Edit address"}
                  </span>
                </button>
              </div>

              <div className="relative border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                {/* Name */}
                <input
                  type="text"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleShippingChange}
                  disabled={!isEditingAddress}
                  className={`w-full text-xl font-black border-b border-gray-200 pb-1 mb-1 transition-colors ${isEditingAddress ? "text-black" : "text-gray-400"}`}
                />

                {/* Address */}
                <textarea
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  disabled={!isEditingAddress}
                  className={`w-full text-sm leading-relaxed border-b border-gray-200 pb-1 mb-1 resize-none transition-colors ${isEditingAddress ? "text-black" : "text-gray-400"}`}
                />

                {/* Phone */}
                <input
                  type="text"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleShippingChange}
                  disabled={!isEditingAddress}
                  className={`w-full text-sm border-b border-gray-200 pb-1 mb-1 transition-colors ${isEditingAddress ? "text-black" : "text-gray-400"}`}
                />

                {/* State/LGA */}
                <input
                  type="text"
                  name="lga"
                  value={shippingAddress.lga}
                  onChange={handleShippingChange}
                  disabled={!isEditingAddress}
                  className={`w-full text-sm border-b border-gray-200 pb-1 mb-1 transition-colors ${isEditingAddress ? "text-black" : "text-gray-400"}`}
                />

                {/* Postal Code */}
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleShippingChange}
                  disabled={!isEditingAddress}
                  className={`w-full text-sm border-b border-gray-200 pb-1 mb-1 transition-colors ${isEditingAddress ? "text-black" : "text-gray-400"}`}
                />

                <span className="bg-[#007AFF] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase absolute top-4 right-4">
                  Default address
                </span>
              </div>
            </section>

            {/* Shipping Methods Section */}
            <section>
              <h2 className="text-lg font-black mb-6">Shipping methods</h2>

              <div className="space-y-4">
                {/* Standard Shipping */}
                <div
                  onClick={() => setSelectedShipping("standard")}
                  className={`flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-colors
                    ${
                      selectedShipping === "standard"
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-gray-100 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <Truck size={24} />
                    </div>
                    <div
                      className={`${selectedShipping === "standard" ? "opacity-100" : "opacity-40"}`}
                    >
                      <h4 className="font-black text-slate-800 uppercase tracking-tight">
                        Standard: FREE
                      </h4>
                      <p className="text-blue-500 text-xs font-bold">
                        Delivery: Nov 14-25
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        Courier company: Speedaf, GIG, etc.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedShipping === "standard"}
                    readOnly
                    className="w-5 h-5 rounded-md accent-blue-600"
                  />
                </div>

                {/* Pickup Option */}
                <div
                  onClick={() => setSelectedShipping("pickup")}
                  className={`flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-colors
                    ${
                      selectedShipping === "pickup"
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-gray-100 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                      <Truck size={24} />
                    </div>
                    <div
                      className={`${selectedShipping === "pickup" ? "opacity-100 text-slate-800" : "opacity-40"}`}
                    >
                      <h4 className="font-black uppercase tracking-tight">
                        Pickup: FREE
                      </h4>
                      <p className="text-gray-500 text-xs font-bold">
                        Delivery: Nov 14-20
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        Courier company: Speedaf, GIG, etc.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedShipping === "pickup"}
                    readOnly
                    className="w-5 h-5 rounded-md accent-blue-600"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-50 rounded-[40px] p-8 shadow-sm lg:sticky lg:top-10">
              <h2 className="text-xl font-bold mb-6">Total price</h2>

              <div className="space-y-4 text-[13px] text-gray-400 font-medium">
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span className="text-gray-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-orange-400">
                  <span>Items Discount:</span>
                  <span>- $0.00</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-4">
                  <span className="text-gray-500">Sub Total:</span>
                  <span className="text-black font-black text-lg">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping fee:</span>
                  <span className="text-gray-600">
                    {selectedShipping === "standard" ? "$0.00" : "$0.00"}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 font-bold">Total Fee:</span>
                  <span className="text-3xl font-black text-slate-900">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 italic mb-8">
                  Please refer to your final actual payment amount.
                </p>

                <button
                  onClick={handlePayment}
                  className="w-full cursor-pointer bg-[#007AFF] hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-100"
                >
                  Proceed to payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4">
          <div className="bg-white rounded-[40px] w-full max-w-[440px] p-12 flex flex-col items-center text-center shadow-2xl">
            <div className="mb-6 relative">
              <div className="bg-white rounded-full p-1 shadow-sm border border-gray-50">
                <div className="bg-[#F0FDF4] p-5 rounded-full border-[6px] border-white ring-1 ring-green-100">
                  <CheckCircle2
                    size={56}
                    className="text-[#22C55E]"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Order successful
            </h2>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-10 px-6">
              We are processing your order, we will let you know when your order
              is on its way.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full cursor-pointer bg-[#007AFF] hover:bg-blue-600 text-white py-4.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 transition-all mb-2"
            >
              View order
            </button>
            <button
              onClick={() => router.push("/deals")} // redirect to deals page
              className="w-full cursor-pointer text-slate-500 hover:text-slate-800 py-2 font-bold text-sm"
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
