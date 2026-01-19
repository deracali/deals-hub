import { DealFormData } from "@/app/(dashboard)/vendor/apply/page";
import { usePaystackPayment } from "@/utils/usePaystackPayment";

// ✅ Define a fully typed Paystack transaction structure (no `any`)
interface PaystackTransaction {
  reference: string;
  status: "success" | "failed" | "cancelled";
  message: string;
  transaction: string;
  amount: number;
  currency: string;
  channel: string;
  transaction_date: string;
  authorization_code?: string;
  customer_email?: string;
}

export const detectPlatform = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes("amazon")) return "Amazon";
  if (lower.includes("aliexpress")) return "Aliexpress";
  if (lower.includes("temu")) return "Temu";
  if (lower.includes("ebay")) return "eBay";
  if (lower.includes("walmart")) return "Walmart";
  return "";
};

// ✅ Main function: only submits when Paystack payment succeeds
export const submitDeal = async (
  submissionData: DealFormData,
  userId: string,
  openPaystackPayment: (params: {
    email: string;
    amount: number;
    businessName?: string;
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
  }) => Promise<void>,
) => {
  const platform = detectPlatform(submissionData.url);

  // ✅ Validate file sizes before upload
  const MAX_FILE_SIZE_MB = 10;
  const oversizedFiles = submissionData.images.filter(
    (img) => img.file.size / (1024 * 1024) > MAX_FILE_SIZE_MB,
  );
  if (oversizedFiles.length > 0) {
    const names = oversizedFiles.map((f) => f.file.name).join(", ");
    throw new Error(
      `❌ The following image(s) exceed ${MAX_FILE_SIZE_MB} MB: ${names}. Please upload smaller files.`,
    );
  }

  // ✅ Run Paystack payment first
  const paymentPromise = new Promise<void>((resolve, reject) => {
    openPaystackPayment({
      email: submissionData.createdBy || "default@email.com",
      amount: 500 * 100, // ₦500 in kobo
      businessName: submissionData.title,
      onSuccess: (transaction) => {
        console.log("✅ Paystack Success:", transaction.reference);
        if (transaction.status === "success") resolve();
        else reject(new Error("Payment failed"));
      },
      onCancel: () => {
        console.warn("❌ Paystack payment cancelled");
        reject(new Error("Payment cancelled"));
      },
    });
  });

  await paymentPromise; // Wait for payment before proceeding

  // ✅ After successful payment, submit deal to backend
  const formDataToSend = new FormData();
  formDataToSend.append("url", submissionData.url);
  formDataToSend.append("title", submissionData.title);
  formDataToSend.append("description", submissionData.description);
  formDataToSend.append("category", submissionData.category);
  formDataToSend.append("tags", JSON.stringify(submissionData.tags || []));
  formDataToSend.append("originalPrice", submissionData.originalPrice);
  formDataToSend.append("discountedPrice", submissionData.discountedPrice);
  if (submissionData.discountPercentage !== undefined)
    formDataToSend.append(
      "discountPercentage",
      submissionData.discountPercentage.toString(),
    );
  formDataToSend.append("currency", "USD");
  formDataToSend.append("shippingCost", submissionData.shippingCost);
  formDataToSend.append("couponCode", submissionData.couponCode);
  formDataToSend.append("brand", submissionData.brand);
  formDataToSend.append("platform", platform);
  formDataToSend.append("availability", submissionData.availability);
  formDataToSend.append("expirationDate", submissionData.expirationDate);
  formDataToSend.append("createdBy", userId);
  formDataToSend.append("featured", submissionData.featured ? "true" : "false");
  formDataToSend.append(
    "freeShipping",
    submissionData.freeShipping ? "true" : "false",
  );
  if (submissionData.specifications)
    formDataToSend.append(
      "specifications",
      JSON.stringify(submissionData.specifications),
    );
  submissionData.images.forEach((img) =>
    formDataToSend.append("images", img.file),
  );

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/deals/create`,
    {
      method: "POST",
      body: formDataToSend,
    },
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create deal");

  return { data, platform };
};

// ✅ Utility functions (unchanged)
export const incrementDealsPosted = async (userId: string) => {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/increment-deals-posted/${userId}`,
    {
      method: "PUT",
    },
  );
};

export const decrementDealsCount = async (userId: string) => {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/decrement-deals/${userId}`,
    {
      method: "PUT",
    },
  );
};
