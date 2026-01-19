/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Save, Send } from "lucide-react";
import { useState } from "react";
// inside submission-action.tsx
import { detectPlatform } from "@/services/featured-deals";

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
  onSaveDraft?: (data: any) => void;
  onPreview?: (data: any) => void;
  isValid?: boolean;
  isSubmitting?: boolean;
  // required props to be passed from parent
  agreementChecked: boolean;
  setAgreementChecked: (val: boolean) => void;

  // NEW: pass userProfile so this component can check quota & disable submit
  userProfile?: UserProfileLocal;
}

const SubmissionActions: React.FC<SubmissionActionsProps> = ({
  formData,
  onSubmit,
  onSaveDraft,
  onPreview,
  isValid = false,
  isSubmitting = false,
  agreementChecked,
  setAgreementChecked,
  userProfile,
}) => {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    {
      emailUpdates: true,
      communityFeedback: true,
      moderationStatus: true,
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

  // ---------- Quota check (local to this component) ----------
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

  // ---------- Actions ----------
  const handleSubmit = () => {
    // extra guard: don't allow submission when over quota (defensive)
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

  const handleSaveDraft = () => {
    onSaveDraft?.({
      ...formData,
      savedAt: new Date().toISOString(),
      status: "draft",
    });
  };

  const handlePreview = () => {
    onPreview?.(formData);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="space-y-6">
        {/* Community Guidelines Agreement */}
        <div className="space-y-4">
          <h4 className="font-semibold text-card-foreground">
            Before You Submit
          </h4>

          <div className="space-y-3 flex items-start gap-2">
            <Checkbox
              id="agreement"
              checked={agreementChecked}
              onCheckedChange={(checked) =>
                setAgreementChecked(Boolean(checked))
              }
              required
            />
            <div className="space-y-1">
              <Label htmlFor="agreement" className="font-medium">
                I agree to the Community Guidelines
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm this deal is genuine, accurately described, and
                follows community standards
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-card-foreground mb-1">
                  Quick Guidelines:
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Ensure the deal is currently active and accessible</li>
                  <li>• Provide accurate pricing and discount information</li>
                  <li>
                    • Include relevant details about shipping, taxes, or
                    restrictions
                  </li>
                  <li>
                    • Use clear, descriptive titles without excessive
                    capitalization
                  </li>
                  <li>• Avoid duplicate posts of the same deal</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <h4 className="font-semibold text-card-foreground">
            Notification Preferences
          </h4>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="emailUpdates"
                checked={notificationPrefs.emailUpdates}
                onCheckedChange={(checked) =>
                  handleNotificationChange("emailUpdates", Boolean(checked))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="emailUpdates">
                  Email me about deal updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your deal receives votes or comments
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="communityFeedback"
                checked={notificationPrefs.communityFeedback}
                onCheckedChange={(checked) =>
                  handleNotificationChange(
                    "communityFeedback",
                    Boolean(checked),
                  )
                }
              />
              <div className="space-y-1">
                <Label htmlFor="communityFeedback">
                  Community feedback notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when community members interact with your deal
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="moderationStatus"
                checked={notificationPrefs.moderationStatus}
                onCheckedChange={(checked) =>
                  handleNotificationChange("moderationStatus", Boolean(checked))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="moderationStatus">
                  Moderation status updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about the approval status of your submission
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handlePreview}
            className="sm:w-auto"
          >
            Preview Deal
          </Button>

          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            className="sm:w-auto flex items-center gap-2"
          >
            <Save />
            Save Draft
          </Button>

          <div className="flex-1" />

          <div className="w-full sm:w-auto">
            <Button
              variant="default"
              size="lg"
              onClick={() => {
                console.log(
                  "🔘 SubmissionActions: submit clicked — formData:",
                  formData,
                );
                console.log(
                  "🔘 SubmissionActions: onSubmit exists?",
                  typeof onSubmit !== "undefined",
                );
                handleSubmit();
              }}
              disabled={
                !isValid || !agreementChecked || isSubmitting || isOverQuota
              }
              className={`sm:w-auto flex items-center gap-2 ${!isValid || !agreementChecked || isSubmitting || isOverQuota ? "opacity-50 pointer-events-none" : ""}`}
              type="button"
              aria-disabled={
                !isValid || !agreementChecked || isSubmitting || isOverQuota
              }
            >
              <Send />
              {isSubmitting ? "Submitting..." : "Submit Deal"}
            </Button>

            {isOverQuota && (
              <p className="text-sm text-red-600 mt-2">
                You have reached your posting limit. Upgrade to continue.
              </p>
            )}
          </div>
        </div>

        {/* Submission Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <Icon name="Clock" size={12} className="inline mr-1" />
            Deals are typically reviewed within 2-4 hours
          </p>
          <p>
            <Icon name="Users" size={12} className="inline mr-1" />
            High-quality deals get featured in community highlights
          </p>
          <p>
            <Icon name="Award" size={12} className="inline mr-1" />
            Earn reputation points for successful deal submissions
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionActions;
