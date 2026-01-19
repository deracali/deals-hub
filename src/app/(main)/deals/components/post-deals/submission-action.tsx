/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Save,
  Send,
  Bell,
  AlertCircle,
  Info,
  Clock,
  Users,
  Zap,
  Eye,
  FileText,
  Home,
  X,
} from "lucide-react";
import { detectPlatform } from "@/services/deals";

type NotificationPrefs = {
  emailUpdates: boolean;
  communityFeedback: boolean;
  moderationStatus: boolean;
};

type UserProfileLocal = {
  type: "regular" | "vendor";
  dealsCount?: number;
  dealsPosted?: number;
};

interface SubmissionActionsProps {
  formData: Record<string, any>;
  onSubmit?: (data: any) => void;
  onPreview?: (data: any) => void;
  isValid?: boolean;
  isSubmitting?: boolean;
  agreementChecked: boolean;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  setAgreementChecked: (val: boolean) => void;
  userProfile?: UserProfileLocal;
}

const SubmissionActions: React.FC<SubmissionActionsProps> = ({
  formData,
  onSubmit,
  onPreview,
  isValid = false,
  isSubmitting = false,
  agreementChecked,
  setAgreementChecked,
  userProfile,
  showModal,
  setShowModal,
}) => {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    {
      emailUpdates: false,
      communityFeedback: false,
      moderationStatus: false,
    },
  );

  const handleNotificationChange = (
    key: keyof NotificationPrefs,
    checked: boolean,
  ) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const isOverQuota = (() => {
    if (!userProfile) return false;
    const platform = detectPlatform(formData?.url || "");
    const isMajor = [
      "Amazon",
      "Aliexpress",
      "Temu",
      "eBay",
      "Walmart",
    ].includes(platform);
    if (userProfile.type === "regular") {
      if (!isMajor && (userProfile.dealsCount ?? 0) <= 0) return true;
    }
    if (userProfile.type === "vendor" && (userProfile.dealsPosted ?? 0) >= 3)
      return true;
    return false;
  })();

  const handleSubmit = () => {
    if (isOverQuota) {
      alert("You have reached your posting limit. Upgrade to post more deals.");
      return;
    }
    if (!agreementChecked) {
      alert("Please agree to the community guidelines before submitting.");
      return;
    }

    onSubmit?.({
      ...formData,
      notificationPrefs,
      submittedAt: new Date().toISOString(),
    });
  };

  // ✅ Fixed draft save
  const handleSaveDraft = () => {
    try {
      // Remove non-serializable fields like File objects
      const serializableDraft = {
        ...formData,
        images: Array.isArray(formData.images)
          ? formData.images.map(({ id, url, name }) => ({ id, url, name }))
          : [],
      };

      localStorage.setItem(
        "dealSubmissionDraft",
        JSON.stringify(serializableDraft),
      );
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("Failed to save draft. Check console for details.");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-4 bg-gray-50/30">
        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-blue-500 fill-blue-500" />
            <h4 className="text-sm font-bold text-gray-400">
              Notification Preferences
            </h4>
          </div>
          <div className="space-y-5">
            {[
              {
                id: "emailUpdates",
                label: "Email me about deal updates",
                desc: "Get notified when your deal receives votes or comments",
              },
              {
                id: "communityFeedback",
                label: "Community feedback notifications",
                desc: "Receive alerts when community members interact with your deal",
              },
              {
                id: "moderationStatus",
                label: "Moderation status updates",
                desc: "Get notified about the approval status of your submission",
              },
            ].map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={(notificationPrefs as any)[item.id]}
                  onCheckedChange={(checked) =>
                    handleNotificationChange(
                      item.id as keyof NotificationPrefs,
                      !!checked,
                    )
                  }
                  className="mt-1 border-gray-300 data-[state=checked]:bg-[#0383F2] data-[state=checked]:border-[#0383F2] data-[state=checked]:text-white"
                />
                <div className="grid gap-0.5">
                  <Label
                    htmlFor={item.id}
                    className="text-[15px] font-semibold text-gray-700 cursor-pointer"
                  >
                    {item.label}
                  </Label>
                  <p className="text-sm text-gray-400 font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Before You Submit */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 fill-red-600 text-white" />
            <h4 className="text-xl font-bold text-red-600">
              Before You Submit
            </h4>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <Checkbox
              id="agreement"
              className="mt-1 border-gray-300 data-[state=checked]:bg-[#0383F2] data-[state=checked]:border-[#0383F2] data-[state=checked]:text-white"
              checked={agreementChecked}
              onCheckedChange={(checked) => setAgreementChecked(!!checked)}
            />
            <div className="grid gap-0.5">
              <Label
                htmlFor="agreement"
                className="text-[15px] font-semibold text-gray-700 cursor-pointer"
              >
                I agree to the Community Guidelines
              </Label>
              <p className="text-sm text-gray-400 font-medium leading-tight">
                I confirm this deal is genuine, accurately described, and
                follows community standards
              </p>
            </div>
          </div>

          {/* Quick Guidelines */}
          <div className="bg-[#f0f7ff] border border-blue-400 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <p className="text-[15px] font-semibold text-gray-800">
                  Quick Guidelines:
                </p>
                <ul className="space-y-1.5 text-[13.5px] text-gray-700 font-medium">
                  <li className="flex gap-2">
                    <span>•</span> Ensure the deal is currently active and
                    accessible
                  </li>
                  <li className="flex gap-2">
                    <span>•</span> Provide accurate pricing and discount
                    information
                  </li>
                  <li className="flex gap-2">
                    <span>•</span> Include relevant details about shipping,
                    taxes, or restrictions
                  </li>
                  <li className="flex gap-2">
                    <span>•</span> Use clear, descriptive titles without
                    excessive capitalization
                  </li>
                  <li className="flex gap-2">
                    <span>•</span> Avoid duplicate posts of the same deal
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onPreview?.(formData)}
              className="flex-1 h-10 px-4 rounded-lg border-blue-400 text-blue-500 font-semibold text-sm hover:bg-blue-50"
            >
              Preview deal <Eye className="ml-2 w-4 h-4 text-blue-400" />
            </Button>

            <Button
              variant="outline"
              onClick={handleSaveDraft} // ✅ Fixed here
              className="flex-1 h-10 px-4 rounded-lg border-red-400 text-red-500 font-semibold text-sm hover:bg-red-50"
            >
              Save as draft <FileText className="ml-2 w-4 h-4 text-red-400" />
            </Button>
          </div>

          <div className="mt-4">
            <Button
              className={`w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-opacity ${!isValid || !agreementChecked || isOverQuota ? "opacity-50" : ""}`}
              onClick={handleSubmit}
              disabled={
                !isValid || !agreementChecked || isSubmitting || isOverQuota
              }
            >
              <Send className="mr-2 w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit Deal Now"}
            </Button>
            {isOverQuota && (
              <p className="text-center text-sm text-red-600 mt-2 font-medium">
                You have reached your posting limit. Upgrade to continue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full mx-4 shadow-2xl relative text-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-300 hover:text-gray-500"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <Image
                  src="/Group 258.png"
                  alt="Deal Submitted Successfully"
                  width={160}
                  height={160}
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Deal Submitted!
            </h3>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8 px-2 font-medium">
              We are reviewing your deal. Your deal will be out soon, please be
              patient. Thank You
            </p>

            <Button
              className="w-full bg-[#0383F2] hover:bg-blue-600 text-white h-12 rounded-xl font-bold text-base shadow-lg shadow-blue-100 mb-6"
              onClick={() => setShowModal(false)}
            >
              View deal
            </Button>

            <button
              onClick={() => setShowModal(false)}
              className="flex items-center justify-center gap-2 w-full text-[#0383F2] font-bold text-[15px] hover:underline"
            >
              <Home size={18} />
              Go to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionActions;
