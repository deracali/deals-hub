import { DealFormData } from "@/app/(dashboard)/vendor/apply/page";
import { fetchUserProfile } from "@/services/user";

export const detectPlatform = (url: string): string => {
  const lower = url.toLowerCase();
  if (lower.includes("amazon")) return "Amazon";
  if (lower.includes("aliexpress")) return "Aliexpress";
  if (lower.includes("temu")) return "Temu";
  if (lower.includes("ebay")) return "eBay";
  if (lower.includes("walmart")) return "Walmart";
  return "Other";
};

export const submitDeal = async (
  submissionData: DealFormData,
  userId: string,
) => {
  // ✅ image existence validation (MOVED HERE)
  if (!submissionData.images || submissionData.images.length === 0) {
    throw new Error("Please upload at least one image.");
  }
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // ✅ fetch user to check suspension
  const user = await fetchUserProfile(userId);
  if (user.status === "suspended") {
    throw new Error(
      "Your account has been suspended. You cannot post deals at this time.",
    );
  }

  const platform = detectPlatform(submissionData.url);

  // ✅ file size validation
  const MAX_FILE_SIZE_MB = 10;

  const oversizedFiles = submissionData.images.filter(
    (img) => img?.file && img.file.size / (1024 * 1024) > MAX_FILE_SIZE_MB,
  );

  if (oversizedFiles.length > 0) {
    const names = oversizedFiles.map((f) => f.file.name).join(", ");
    throw new Error(
      `The following files exceed ${MAX_FILE_SIZE_MB}MB: ${names}`,
    );
  }

  const formDataToSend = new FormData();
  formDataToSend.append("url", submissionData.url);
  formDataToSend.append("title", submissionData.title);
  formDataToSend.append("description", submissionData.description);
  formDataToSend.append("category", submissionData.category);
  formDataToSend.append("tags", JSON.stringify(submissionData.tags || []));
  formDataToSend.append("originalPrice", submissionData.originalPrice);
  formDataToSend.append("discountedPrice", submissionData.discountedPrice);
  if (submissionData.discountPercentage !== undefined) {
    formDataToSend.append(
      "discountPercentage",
      submissionData.discountPercentage.toString(),
    );
  }

  formDataToSend.append("currency", "USD");
  formDataToSend.append("shippingCost", submissionData.shippingCost);
  formDataToSend.append("couponCode", submissionData.couponCode);
  formDataToSend.append("brand", submissionData.brand);
  formDataToSend.append("platform", platform);
  formDataToSend.append("availability", submissionData.availability);
  formDataToSend.append("expirationDate", submissionData.expirationDate);
  formDataToSend.append(
    "freeShipping",
    submissionData.freeShipping ? "true" : "false",
  );
  formDataToSend.append("createdBy", userId);

  if (submissionData.specifications) {
    formDataToSend.append(
      "specifications",
      JSON.stringify(submissionData.specifications),
    );
  }

  submissionData.images.forEach((img) => {
    if (img?.file) {
      formDataToSend.append("images", img.file);
    }
  });

  const res = await fetch(`${baseURL}/deals/create`, {
    method: "POST",
    body: formDataToSend,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create deal");

  return { data, platform };
};

export const incrementDealsPosted = async (userId: string) => {
  await fetch(`${baseURL}/increment-deals-posted/${userId}`, {
    method: "PUT",
  });
};

export const decrementDealsCount = async (userId: string) => {
  await fetch(`${baseURL}/decrement-deals/${userId}`, {
    method: "PUT",
  });
};
