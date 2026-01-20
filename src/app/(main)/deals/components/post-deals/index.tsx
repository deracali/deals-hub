"use client";

import Header from "@/components/general/header";
import DealDetailsForm from "./details-form";
import SubmissionActions from "./submission-action";
import URLInputSection from "./url-inspection";
import VendorNotificationBanner from "./vendor-notification";
import DealFormHeader from "./form-header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageUploadSection from "./image-upload";
import DealValidationPanel from "./deal-validation";
import { usePaystackPayment } from "@/utils/usePaystackPayment";
import {
  detectPlatform,
  submitDeal,
  incrementDealsPosted,
  decrementDealsCount,
} from "@/services/deals";
import { getStoredUserId, fetchUserProfile } from "@/services/user";

type Availability = "In Stock" | "Out of Stock";

export interface DealFormData {
  url: string;
  title: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercentage?: number;
  category: string;
  brand: string;
  shippingCost: string;
  couponCode: string;
  featured?: boolean;
  createdBy: string;
  expirationDate: string;
  freeShipping?: boolean;
  tags: string[];
  images: { id: number | string; file: File; url: string; name: string }[];
  platform: string;
  availability: Availability;
  specifications: Record<string, string>;
  colors: string[];
  sizes: string[];
}

export interface UserProfile {
  type: "regular" | "vendor";
  plan: "free" | "pro" | "premium";
  status?: "active" | "suspended";
  dealsCount?: number;
  dealsPosted?: number;
  reputation?: number;
}

export interface FormErrors {
  [key: string]: string;
}

const DealSubmission = () => {
  const navigate = useRouter();
  const openPaystackPayment = usePaystackPayment();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
  const totalSteps = 4;
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<DealFormData>({
    url: "",
    title: "",
    description: "",
    originalPrice: "",
    discountedPrice: "",
    discountPercentage: undefined,
    category: "",
    brand: "",
    shippingCost: "0.00",
    couponCode: "",
    expirationDate: "",
    createdBy: "",
    tags: [],
    images: [],
    freeShipping: false,
    featured: false,
    platform: "",
    availability: "In Stock",
    specifications: {},
    colors: [],
    sizes: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load userId from localStorage
  useEffect(() => {
    const id = getStoredUserId();
    if (id) setUserId(id);
    else setErrors({ submit: "You must be logged in to submit a deal." });
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!userId) return;
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(userId);
        setUserProfile(profile);
        console.log("✅ FULL PROFILE:", profile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setErrors({ submit: "Could not load user profile." });
      }
    };
    loadProfile();
  }, [userId]);

  // Auto-save draft every 30s
  useEffect(() => {
    const draftKey = "dealSubmissionDraft";
    const saveInterval = setInterval(() => {
      if (formData.title || formData.url || formData.description) {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [formData]);

  // Calculate discount percentage safely
  useEffect(() => {
    const original = parseFloat(formData.originalPrice || "0");
    const discounted = parseFloat(formData.discountedPrice || "0");

    if (
      !isNaN(original) &&
      !isNaN(discounted) &&
      original > 0 &&
      discounted >= 0 &&
      discounted <= original
    ) {
      const percentage = ((original - discounted) / original) * 100;
      setFormData((prev) => ({
        ...prev,
        discountPercentage: parseFloat(percentage.toFixed(2)),
      }));
    } else {
      setFormData((prev) => ({ ...prev, discountPercentage: undefined }));
    }
  }, [formData.originalPrice, formData.discountedPrice]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title || formData.title.length < 10)
      newErrors.title = "Title must be at least 10 characters long";
    if (!formData.description || formData.description.length < 50)
      newErrors.description = "Description must be at least 50 characters long";
    if (!formData.discountedPrice || parseFloat(formData.discountedPrice) <= 0)
      newErrors.discountedPrice = "Please enter a valid discounted price";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.url) newErrors.url = "Product URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPlatformFromDescription = (description?: string) => {
    if (!description) return "";
    return description.split(" ")[0].replace(/[:,-]/g, "");
  };

  const getVendorBrandFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const user = JSON.parse(raw);
      return user.brand || "";
    } catch {
      return "";
    }
  };

  const handleSubmit = async (submissionData: DealFormData) => {
    if (!userId) {
      alert("You must be logged in to submit a deal.");
      return;
    }

    if (userProfile?.status === "suspended") {
      setErrors({
        submit:
          "Your account has been suspended. You cannot post deals at this time.",
      });
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // ✅ USE LOCAL STATE (no re-fetch here)
      const latestUser = userProfile;
      if (!latestUser) {
        throw new Error("User profile not loaded");
      }

      const platform = detectPlatform(submissionData.url);
      const majorPlatforms = [
        "Amazon",
        "Aliexpress",
        "Temu",
        "eBay",
        "Walmart",
      ];
      const isMajorPlatform = majorPlatforms.includes(platform);

      console.log("🔍 Platform detected:", platform);
      console.log("⭐ Is major platform:", isMajorPlatform);
      console.log("🧑 User before submit:", latestUser);

      // ✅ REGULAR USER LIMIT CHECK
      if (latestUser.type === "regular") {
        const remaining = latestUser.dealsCount ?? 0;

        if (!isMajorPlatform && remaining <= 0) {
          setErrors({
            submit:
              "You have reached your free posting limit. Upgrade to post more deals.",
          });
          return;
        }
      }

      // ✅ VENDOR LIMIT CHECK
      if (latestUser.type === "vendor") {
        const posted = latestUser.dealsPosted ?? 0;

        if (posted >= 3) {
          setErrors({
            submit:
              "You have reached the vendor free posting limit (3). Upgrade to post more deals.",
          });
          return;
        }
      }

      // 🚀 SUBMIT DEAL
      const { platform: submittedPlatform } = await submitDeal(
        submissionData,
        userId,
      );

      console.log("✅ Deal submitted on:", submittedPlatform);

      // ✅ REDUCE DEALS COUNT (REGULAR + NON-MAJOR ONLY)
      if (
        latestUser.type === "regular" &&
        !majorPlatforms.includes(submittedPlatform)
      ) {
        await decrementDealsCount(userId);

        setUserProfile((prev) =>
          prev ? { ...prev, dealsCount: (prev.dealsCount ?? 0) - 1 } : prev,
        );

        console.log("📉 dealsCount reduced by 1");
      }

      // ✅ INCREMENT DEALS POSTED (VENDOR)
      if (latestUser.type === "vendor") {
        await incrementDealsPosted(userId);

        setUserProfile((prev) =>
          prev ? { ...prev, dealsPosted: (prev.dealsPosted ?? 0) + 1 } : prev,
        );

        console.log("📈 dealsPosted incremented by 1");
      }

      console.log("🧾 User after submit:", {
        dealsCount: userProfile?.dealsCount,
        dealsPosted: userProfile?.dealsPosted,
      });

      setShowSuccessModal(true);

      // 🧹 RESET
      localStorage.removeItem("dealSubmissionDraft");
      setFormData({
        url: "",
        title: "",
        description: "",
        originalPrice: "",
        discountedPrice: "",
        discountPercentage: undefined,
        category: "",
        brand: "",
        shippingCost: "0.00",
        couponCode: "",
        expirationDate: "",
        createdBy: "",
        tags: [],
        images: [],
        freeShipping: false,
        featured: false,
        platform: "",
        availability: "In Stock",
        specifications: {},
        colors: [],
        sizes: [],
      });
    } catch (err) {
      console.error("❌ Submission failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit deal.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleSaveDraft = (draftData: DealFormData) => {
    localStorage.setItem("dealSubmissionDraft", JSON.stringify(draftData));
    alert("Draft saved successfully!");
  };

  const handlePreview = (previewData: DealFormData) => {
    alert("Preview functionality would open here");
  };

  const handleClose = () => {
    if (formData.title || formData.url || formData.description) {
      if (window.confirm("You have unsaved changes. Leave and save draft?")) {
        handleSaveDraft(formData);
        navigate.push("/deals-dashboard");
      }
    } else {
      navigate.push("/deals-dashboard");
    }
  };

  const isFormValid = (): boolean => {
    return (
      (formData.title?.trim().length ?? 0) >= 10 &&
      (formData.description?.trim().length ?? 0) >= 50 &&
      !!formData.discountedPrice &&
      !isNaN(Number(formData.discountedPrice)) &&
      Number(formData.discountedPrice) > 0 &&
      !!formData.category &&
      !!formData.url
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
        <div className="container mx-auto py-6">
      <DealFormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onClose={handleClose}
      />
      <div className="container mx-auto px-4 py-8">
        <VendorNotificationBanner userProfile={userProfile ?? undefined} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <URLInputSection
              onURLAnalyzed={(data) => {
                setFormData((prev) => {
                  const isVendor = userProfile?.type === "vendor";

                  const extractedPlatform =
                    data.platform?.trim() ||
                    getPlatformFromDescription(data.description);

                  const finalBrand = isVendor
                    ? getVendorBrandFromLocalStorage()
                    : data.brand || prev.brand;

                  return {
                    ...prev,
                    ...data,

                    // ✅ PLATFORM RULE (BOTH USERS)
                    platform: extractedPlatform,

                    // ✅ BRAND RULE
                    brand: isVendor ? finalBrand : data.brand || "",
                  };
                });
              }}
              formData={formData}
              setFormData={setFormData}
            />

            <DealDetailsForm
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              userProfile={userProfile}
            />
            <ImageUploadSection formData={formData} setFormData={setFormData} />
          </div>
          <div className="space-y-6 hidden lg:block">
            <DealValidationPanel formData={formData} />
            <SubmissionActions
              formData={formData}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              onPreview={handlePreview}
              isValid={isFormValid()}
              isSubmitting={isSubmitting}
              agreementChecked={agreementChecked}
              setAgreementChecked={setAgreementChecked}
              userProfile={userProfile}
              showModal={showSuccessModal}
              setShowModal={setShowSuccessModal}
            />
          </div>
        </div>
        <div className="lg:hidden p-4 bg-card border-t border-border">
          <SubmissionActions
            formData={formData}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            onPreview={handlePreview}
            isValid={isFormValid()}
            isSubmitting={isSubmitting}
            agreementChecked={agreementChecked}
            setAgreementChecked={setAgreementChecked}
            userProfile={userProfile}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default DealSubmission;
