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
import { getStoredUserId, fetchUserProfile } from "@/services/user";
import {
  submitDeal,
  incrementDealsPosted,
  decrementDealsCount,
} from "@/services/featured-deals";

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
  createdBy: string;
  expirationDate: string;
  freeShipping?: boolean;
  tags: string[];
  images: {
    id: number | string;
    file: File;
    url: string;
    name: string;
  }[];
  platform: string;
  availability: Availability;
  specifications: Record<string, string>;
}

export interface UserProfile {
  type: "regular" | "vendor";
  dealsCount?: number; // optional for regular users
  dealsPosted?: number; // optional for vendors
  reputation: number;
}

export interface FormErrors {
  [key: string]: string;
}

const DealSubmission = () => {
  const navigate = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
  const { openPaystackPayment } = usePaystackPayment();

  const totalSteps = 4;

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
    freeShipping: false,
    createdBy: "",
    tags: [],
    images: [],
    platform: "",
    availability: "In Stock",
    specifications: {},
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load userId from localStorage via service
  useEffect(() => {
    const id = getStoredUserId();
    if (id) {
      setUserId(id);
    } else {
      console.error("No user found in localStorage");
      setErrors({ submit: "You must be logged in to submit a deal." });
    }
  }, []);

  // Fetch user profile when userId is present (uses service)
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(userId);
        setUserProfile(profile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setErrors({ submit: "Could not load user profile." });
      }
    };

    loadProfile();
  }, [userId]);

  // Load draft
  useEffect(() => {
    const draftKey = "dealSubmissionDraft";
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsedDraft: DealFormData = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsedDraft,
          tags: Array.isArray(parsedDraft.tags)
            ? parsedDraft.tags
            : parsedDraft.tags
              ? [parsedDraft.tags]
              : [],
        }));
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, []);

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

  // Calculate discount percentage
  useEffect(() => {
    const original = parseFloat(formData.originalPrice);
    const discounted = parseFloat(formData.discountedPrice);

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

  const handleURLAnalyzed = (analyzedData: Partial<DealFormData>) => {
    setFormData((prev) => ({ ...prev, ...analyzedData }));
    setCurrentStep(2);
  };

  const handleSubmit = async (submissionData: DealFormData) => {
    if (!userId) {
      alert("You must be logged in to submit a deal.");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const latestUser = userId ? await fetchUserProfile(userId) : null;

      // ✅ Add featured flag here
      const featuredSubmission = {
        ...submissionData,
        featured: true, // <--- mark it featured here
      };

      const { data: dealData, platform } = await submitDeal(
        featuredSubmission,
        userId,
        openPaystackPayment,
      );

      const majorPlatforms = [
        "Amazon",
        "Aliexpress",
        "Temu",
        "eBay",
        "Walmart",
      ];

      if (!majorPlatforms.includes(platform)) {
        if (latestUser?.type === "regular") {
          await decrementDealsCount(userId);
          setUserProfile((prev) =>
            prev ? { ...prev, dealsCount: (prev.dealsCount || 0) - 1 } : prev,
          );
        }
      }

      if (latestUser?.type === "vendor") {
        await incrementDealsPosted(userId);
        setUserProfile((prev) =>
          prev ? { ...prev, dealsPosted: (prev.dealsPosted || 0) + 1 } : prev,
        );
      }

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
        platform: "",
        availability: "In Stock",
        specifications: {},
        featured: false, // reset it after submit
      });

      navigate.push("/deals");
    } catch (err) {
      console.error("Submission failed:", err);
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
    console.log("Preview deal:", previewData);
    alert("Preview functionality would open here");
  };

  const handleClose = () => {
    if (formData.title || formData.url || formData.description) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave? Your progress will be saved as a draft.",
        )
      ) {
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
      <DealFormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onClose={handleClose}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <VendorNotificationBanner userProfile={userProfile ?? undefined} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <URLInputSection
                onURLAnalyzed={handleURLAnalyzed}
                formData={formData}
                setFormData={setFormData}
              />
              <DealDetailsForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
              <ImageUploadSection
                formData={formData}
                setFormData={setFormData}
              />
            </div>
            <div className="space-y-6">
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
              />
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
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
