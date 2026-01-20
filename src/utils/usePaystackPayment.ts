"use client";

import { useEffect, useRef, useState } from "react";

export const usePaystackPayment = () => {
  const paystackRef = useRef<any>(null);
  const [paystackReady, setPaystackReady] = useState(false);

  // Load Paystack inline script dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    import("@paystack/inline-js")
      .then((mod) => {
        if (!mounted) return;
        paystackRef.current = mod.default;
        setPaystackReady(true);
      })
      .catch((err) => {
        console.error("Failed to load Paystack inline-js:", err);
        setPaystackReady(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Ensure the Paystack class is loaded (used internally)
  const ensurePaystack = async () => {
    if (paystackRef.current) return paystackRef.current;
    if (typeof window === "undefined")
      throw new Error("Paystack requires browser environment");
    const mod = await import("@paystack/inline-js");
    paystackRef.current = mod.default;
    setPaystackReady(true);
    return paystackRef.current;
  };

  /**
   * Opens a Paystack payment popup
   * @param params - Payment options
   */
  const openPaystackPayment = async (params: {
    email: string;
    amount: number; // in kobo
    businessName?: string;
    onSuccess?: (transaction: any) => void;
    onCancel?: () => void;
  }) => {
    try {
      const PaystackClass = await ensurePaystack();
      const popup = new PaystackClass();

      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: params.email,
        amount: params.amount,
        currency: "NGN",
        metadata: {
          custom_fields: [
            {
              display_name: "Business Name",
              variable_name: "business_name",
              value: params.businessName || "N/A",
            },
          ],
        },
        onSuccess: (transaction: any) => {
          console.log("✅ Paystack payment success:", transaction);
          params.onSuccess?.(transaction);
        },
        onCancel: () => {
          console.warn("❌ Paystack payment cancelled");
          params.onCancel?.();
        },
      });
    } catch (err) {
      console.error("Error initializing Paystack payment:", err);
      throw err;
    }
  };

  return { paystackReady, openPaystackPayment };
};
