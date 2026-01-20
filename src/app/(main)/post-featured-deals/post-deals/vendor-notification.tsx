"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type UserType = "regular" | "vendor";
type BannerType = "error" | "warning" | "info";

interface BannerContent {
  type: BannerType;
  icon: string;
  title: string;
  message: string;
  action: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

interface UserProfile {
  type: UserType;
  dealsCount?: number; // for regular users
  dealsPosted?: number; // for vendors
  reputation?: number;
}

interface VendorNotificationBannerProps {
  userProfile?: UserProfile;
}

const VendorNotificationBanner = ({
  userProfile,
}: VendorNotificationBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  console.log("VendorNotificationBanner props:", userProfile);
  console.log("isDismissed:", isDismissed);

  if (!userProfile) {
    console.log("Banner not showing: no userProfile");
    return null;
  }

  if (isDismissed) {
    console.log("Banner not showing: dismissed");
    return null;
  }

  const { type: userType, dealsCount, dealsPosted, reputation } = userProfile;
  console.log(
    "userType:",
    userType,
    "dealsCount:",
    dealsCount,
    "dealsPosted:",
    dealsPosted,
    "reputation:",
    reputation,
  );

  const isVendor = userType === "vendor";

  const getBannerContent = (): BannerContent | null => {
    console.log("Calculating banner content...");

    // ---------- Regular User ----------
    if (userType === "regular") {
      const remainingDeals = dealsCount ?? 0;
      console.log("Regular user remainingDeals:", remainingDeals);

      if (remainingDeals === 0) {
        console.log("Regular user banner: error (limit reached)");
        return {
          type: "error",
          icon: "AlertCircle",
          title: "Posting Limit Reached",
          message:
            "You have reached your free posting limit (0 deals left). Upgrade to continue posting deals.",
          action: "Upgrade Now",
          bgColor: "bg-error/10",
          borderColor: "border-error/20",
          iconColor: "text-error",
        };
      }

      if (remainingDeals === 1) {
        console.log("Regular user banner: warning (approaching limit)");
        return {
          type: "warning",
          icon: "AlertTriangle",
          title: "Approaching Posting Limit",
          message:
            "You have 1 free deal remaining. Consider upgrading for unlimited posting.",
          action: "View Premium Plans",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20",
          iconColor: "text-warning",
        };
      }

      console.log("Regular user: no banner needed");
      return null;
    }

    // ---------- Vendor Info Banner ----------
    if (isVendor && (dealsPosted ?? 0) < 10) {
      console.log("Vendor info banner: account detected");
      return {
        type: "info",
        icon: "Store",
        title: "Vendor Account Detected",
        message:
          "As a vendor, you can post up to 10 free deals. Upgrade to Premium for unlimited posting and enhanced visibility.",
        action: "Learn More",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/20",
        iconColor: "text-primary",
      };
    }

    // ---------- Vendor Warnings / Errors ----------
    if (isVendor) {
      const posted = dealsPosted ?? 0;
      console.log("Vendor posted deals:", posted);

      if (posted >= 10) {
        console.log("Vendor banner: error (limit reached)");
        return {
          type: "error",
          icon: "AlertCircle",
          title: "Posting Limit Reached",
          message:
            "You have reached the free posting limit (10 deals). Upgrade to continue posting deals.",
          action: "Upgrade to Premium",
          bgColor: "bg-error/10",
          borderColor: "border-error/20",
          iconColor: "text-error",
        };
      }

      if (posted === 9) {
        console.log("Vendor banner: warning (approaching limit)");
        return {
          type: "warning",
          icon: "AlertTriangle",
          title: "Approaching Posting Limit",
          message:
            "You have 1 free deal remaining. Consider upgrading for unlimited posting.",
          action: "View Premium Plans",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20",
          iconColor: "text-warning",
        };
      }
    }

    console.log("No banner applicable");
    return null;
  };

  const bannerContent = getBannerContent();
  console.log("Banner content result:", bannerContent);

  if (!bannerContent) {
    console.log("Banner not showing: bannerContent is null");
    return null;
  }

  const showPremiumBenefits = bannerContent.type !== "info";

  return (
    <div
      className={`${bannerContent.bgColor} border ${bannerContent.borderColor} rounded-lg p-4 mb-6`}
    >
      <div className="flex items-start space-x-3">
        <Icon
          name={bannerContent.icon}
          size={20}
          className={bannerContent.iconColor}
        />
        <div className="flex-1">
          <h4 className="font-semibold text-card-foreground mb-1">
            {bannerContent.title}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {bannerContent.message}
          </p>
          <div className="flex items-center space-x-3">
            <Button
              variant={bannerContent.type === "error" ? "default" : "outline"}
              size="sm"
            >
              {bannerContent.action}
            </Button>
            {bannerContent.type !== "error" && (
              <button
                onClick={() => setIsDismissed(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        {bannerContent.type !== "error" && (
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded hover:bg-black/5 transition-colors"
          >
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {showPremiumBenefits && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium text-card-foreground mb-2">
            Premium Benefits:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Icon name="Infinity" size={14} className="text-primary" />
              <span className="text-muted-foreground">
                Unlimited deal posting
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={14} className="text-primary" />
              <span className="text-muted-foreground">Enhanced visibility</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="BarChart3" size={14} className="text-primary" />
              <span className="text-muted-foreground">Analytics dashboard</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorNotificationBanner;
