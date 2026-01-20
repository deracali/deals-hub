"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MoveUpRight,
} from "lucide-react";
import Header from "@/components/general/header";
import RelatedDeals from "../components/details/related-deals";

type CartItem = {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  currency: string;
  images: string[];
  selected: boolean;
};

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("cart");
      const savedCart: CartItem[] = raw
        ? JSON.parse(raw).map((item: CartItem) => ({ ...item, selected: true }))
        : [];
      setCartItems(savedCart);
    }
  }, []);

  // Save cart to localStorage
  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  // Select all toggle
  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setCartItems(cartItems.map((item) => ({ ...item, selected: !selectAll })));
  };

  // Individual item selection
  const toggleItemSelect = (id: string) => {
    const newCart = cartItems.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item,
    );
    setCartItems(newCart);
    setSelectAll(newCart.every((item) => item.selected));
  };

  // Quantity handlers
  const increaseQuantity = (id: string) => {
    const newCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    );
    updateCart(newCart);
  };

  const decreaseQuantity = (id: string) => {
    const newCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item,
    );
    updateCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cartItems.filter((item) => item.id !== id);
    updateCart(newCart);
  };

  // Totals for selected items only
  const selectedItems = cartItems.filter((item) => item.selected);
  const itemsTotal = selectedItems.reduce(
    (acc, item) => acc + item.discountedPrice * item.quantity,
    0,
  );
  const originalTotal = selectedItems.reduce(
    (acc, item) => acc + item.originalPrice * item.quantity,
    0,
  );
  const discountTotal = originalTotal - itemsTotal;
  const selectedCount = selectedItems.length;

  // Checkout handler
  const checkout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }

    setIsCheckingOut(true);

    if (typeof window !== "undefined") {
      const orderItems = selectedItems.map((item) => ({
        ...item,
        totalPrice: item.discountedPrice * item.quantity,
      }));
      localStorage.setItem("order", JSON.stringify(orderItems));

      const remainingCart = cartItems.filter((item) => !item.selected);
      updateCart(remainingCart);

      setTimeout(() => {
        router.push("/deals/checkout");
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 font-sans text-slate-900">
      <Header />

      {/* Top Nav */}
      <div className="max-w-7xl mx-auto flex items-center mb-6">
        <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-black transition-colors">
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Cart Items */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-orange-100 p-3 rounded-2xl">
              <span className="text-2xl text-orange-500">🛒</span>
            </div>
            <div>
              <h1 className="text-3xl font-black">My Cart</h1>
              <p className="text-gray-500 text-sm">
                You have{" "}
                <span className="font-bold">({cartItems.length}) items</span> in
                your cart
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 mb-4 border-b pb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 accent-blue-600"
              />
              <span className="text-sm font-semibold text-gray-600">
                Select all ({cartItems.length})
              </span>
            </div>
            <button
              className="text-blue-500 text-sm font-bold flex items-center gap-1"
              onClick={() => setEditMode(!editMode)}
            >
              <span className="inline-block border-b border-blue-500">
                {editMode ? "Done" : "Edit cart"}
              </span>
            </button>
          </div>

          <div className="space-y-8">
            {cartItems.map((item) => (
              <div key={item.id} className="border-b pb-6">
                {/* Top Row */}
                <div className="flex gap-4 items-start">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItemSelect(item.id)}
                    className="mt-4 w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />

                  {/* Image */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-2xl flex-shrink-0 overflow-hidden">
                    <img
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title + Delete */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm md:text-[15px] font-bold leading-snug text-gray-800">
                        {item.title}
                      </h3>

                      {editMode && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-xl md:text-2xl font-black text-slate-900">
                        {item.currency}
                        {item.discountedPrice}
                      </span>
                      <span className="text-gray-300 text-xs md:text-sm line-through">
                        {item.currency}
                        {item.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Savings */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -
                        {Math.round(
                          ((item.originalPrice - item.discountedPrice) /
                            item.originalPrice) *
                            100,
                        )}
                        % OFF
                      </span>
                      <span className="text-[11px] text-gray-400">
                        You save {item.currency}
                        {(item.originalPrice - item.discountedPrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="mt-4 flex justify-end md:justify-start">
                  <div className="flex items-center bg-blue-50 rounded-xl p-1 gap-4">
                    <button
                      className="p-2 bg-blue-200/50 rounded-lg text-blue-600"
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      <Minus size={18} />
                    </button>

                    <span className="font-bold text-lg text-slate-700">
                      {item.quantity.toString().padStart(2, "0")}
                    </span>

                    <button
                      className="p-2 bg-blue-600 text-white rounded-lg"
                      onClick={() => increaseQuantity(item.id)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right Side: Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">Total price</h2>

            <div className="space-y-4 text-[13px] text-gray-400 font-medium">
              <div className="flex justify-between">
                <span>Items Total:</span>
                <span className="text-gray-600">
                  {cartItems[0]?.currency}
                  {itemsTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items Discount:</span>
                <span className="text-orange-400">
                  - {cartItems[0]?.currency}
                  {discountTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-500">Sub Total:</span>
                <span className="text-black font-bold text-lg">
                  {cartItems[0]?.currency}
                  {itemsTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping fee:</span>
                <span className="text-gray-600">$0.00</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 font-medium">Total Fee:</span>
                <span className="text-3xl font-black text-slate-900">
                  {cartItems[0]?.currency}
                  {itemsTotal.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 italic mb-6">
                Please refer to your final actual payment amount.
              </p>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg"
                onClick={checkout}
                disabled={isCheckingOut}
              >
                {isCheckingOut
                  ? "Checking out.."
                  : `Checkout (${selectedCount} items)`}
              </button>

              <div className="mt-4 flex gap-2 text-[#007AFF] items-start">
                <Lock
                  size={14}
                  fill="currentColor"
                  className="shrink-0 mt-0.5"
                />
                <p className="text-[11px] leading-tight text-gray-500">
                  Item availability and pricing are not guaranteed until payment
                  is final.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Guarantees Section */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex gap-3 text-[#007AFF] items-start">
              <Lock size={16} fill="currentColor" className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-gray-600 leading-tight">
                You will not be charged until you review this order on the next
                page
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Lock size={16} fill="#3b82f6" className="text-blue-500" />
                <h3 className="text-[14px] font-medium">
                  Safe Payment Options
                </h3>
              </div>
              <div className="space-y-4 text-[12px] text-gray-700 leading-snug">
                <p>
                  Slyce is committed to protecting your payment information. We
                  follow PCI DSS standards, use strong encryption, and perform
                  regular reviews of its system to protect your privacy.
                </p>
                <div className="space-y-1">
                  <p className="font-bold text-gray-800">
                    Payment & Security methods
                  </p>
                  <p>
                    I confirm this deal is genuine, accurately described, and
                    follows community standards
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck
                  size={16}
                  fill="currentColor"
                  className="text-blue-500"
                />
                <h3 className="text-[14px] font-medium">Secure privacy</h3>
              </div>
              <p className="text-[12px] text-gray-700 leading-snug">
                Protecting your privacy is important to us! Please be assured
                that your information will be kept secured and uncompromised. We
                will only use your information in accordance with our privacy
                policy to provide and improve our services to you.
              </p>
              <button className="flex items-center gap-1 text-[#0095FF] font-bold text-[13px] hover:underline">
                Learn more <MoveUpRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <ShieldCheck
                  size={16}
                  fill="currentColor"
                  className="text-blue-500"
                />
                <h3 className="text-[14px] font-medium">
                  Secure Slyce Purchase Protection
                </h3>
              </div>
              <p className="text-[12px] text-gray-700 leading-snug">
                Shop confidently on Slyce knowing that if something goes wrong,
                we've always got your back.
              </p>
              <button className="flex items-center gap-1 text-[#0095FF] font-bold text-[13px] hover:underline">
                Learn more <MoveUpRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Truck size={16} fill="#3b82f6" className="text-blue-500" />
                <h3 className="text-[14px] font-medium">Delivery guarantee</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                  <CheckCircle2 size={14} className="text-green-600" /> Return
                  if item damaged
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                  <CheckCircle2 size={14} className="text-green-500" /> Return
                  if item is different from order
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                  <CheckCircle2 size={14} className="text-green-600" /> 15-day
                  no update refund
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                  <CheckCircle2 size={14} className="text-green-600" /> 60-day
                  no delivery refund
                </div>
              </div>
              <button className="flex items-center gap-1 text-[#0095FF] font-bold text-[13px] hover:underline pt-1">
                Learn more <MoveUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
        //{" "}
        <section className="mt-12 pt-8 border-t border-gray-200 lg:col-span-12">
          // <h2 className="text-2xl font-bold mb-6">Related Deals</h2>
          // <RelatedDeals />
          //{" "}
        </section>
      </main>
    </div>
  );
};

export default CartPage;
