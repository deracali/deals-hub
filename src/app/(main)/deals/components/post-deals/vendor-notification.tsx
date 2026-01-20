"use client";

import { useState } from "react";
import {
  X,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  BadgeCheck,
  Rocket,
  Star,
  Package,
} from "lucide-react";

type UserType = "regular" | "vendor";
type UserPlan = "free" | "pro" | "premium";

interface UserProfile {
  type: UserType;
  plan?: UserPlan;
  dealsCount?: number; // regular users only
  dealsPosted?: number; // vendors only
}

interface VendorNotificationBannerProps {
  userProfile?: UserProfile;
}

/* =========================
   PLAN LIMITS (SOURCE OF TRUTH)
========================== */
const PLAN_LIMITS: Record<UserPlan, number> = {
  free: 3,
  pro: 10,
  premium: 20,
};

const VendorNotificationBanner = ({
  userProfile,
}: VendorNotificationBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!userProfile || isDismissed) return null;

  const { type, plan = "free", dealsCount = 0, dealsPosted = 0 } = userProfile;

  /* =========================
     DEAL USAGE LOGIC (FIXED)
  ========================== */
  const isVendor = type === "vendor";
  const maxDeals = PLAN_LIMITS[plan];

  // 🔴 CRITICAL FIX:
  // Vendors ALWAYS use dealsPosted
  // Regular users ALWAYS use dealsCount
  const usedDeals = isVendor ? dealsPosted : dealsCount;
  const remainingDeals = Math.max(maxDeals - usedDeals, 0);

  /* =========================
     UI CONFIG
  ========================== */
  const config = isVendor
    ? {
        container:
          plan === "premium"
            ? "bg-orange-50 border-orange-200"
            : plan === "pro"
              ? "bg-blue-50 border-blue-200"
              : "bg-red-50 border-red-200",
        title:
          plan === "premium"
            ? "You are on Premium plan"
            : plan === "pro"
              ? "You are on Pro plan"
              : "You are on Free plan",
        icon:
          plan === "premium" ? (
            <ShieldCheck className="text-orange-500" size={32} />
          ) : plan === "pro" ? (
            <ShieldCheck className="text-blue-500" size={32} />
          ) : (
            <AlertTriangle className="text-red-500" size={28} />
          ),
        message:
          plan === "free" ? (
            <span>
              You have used{" "}
              <span className="font-bold text-red-500">
                {usedDeals}/{maxDeals}
              </span>{" "}
              deals.{" "}
              <span className="font-bold text-green-600">
                {remainingDeals} left
              </span>{" "}
              —{" "}
              <button className="font-bold text-red-600 hover:underline">
                Upgrade to post more
              </button>
            </span>
          ) : (
            <span>
              You’ve posted{" "}
              <span className="font-bold text-red-500">{usedDeals}</span> of{" "}
              <span className="font-bold">{maxDeals}</span> deals this month.{" "}
              <span className="font-bold text-green-600">
                {remainingDeals} left
              </span>
            </span>
          ),
      }
    : {
        container: "bg-red-50 border-red-200",
        title: "You are on Free plan",
        icon: <AlertTriangle className="text-red-500" size={28} />,
        message: (
          <span>
            You have used{" "}
            <span className="font-bold text-red-500">
              {usedDeals}/{maxDeals}
            </span>{" "}
            deals.{" "}
            <span className="font-bold text-green-600">
              {remainingDeals} left
            </span>{" "}
            —{" "}
            <button className="font-bold text-red-600 hover:underline">
              Upgrade to post more
            </button>
          </span>
        ),
      };

  /* =========================
     BENEFITS (VENDOR ONLY)
  ========================== */
  const benefits =
    isVendor && plan === "premium"
      ? [
          { icon: <Package size={12} />, label: "Upload 20 products monthly" },
          { icon: <TrendingUp size={12} />, label: "Advanced analytics" },
          { icon: <BadgeCheck size={12} />, label: "Premium badge" },
          { icon: <Rocket size={12} />, label: "2 free boosts" },
          { icon: <Star size={12} />, label: "Featured placement" },
        ]
      : isVendor && plan === "pro"
        ? [
            {
              icon: <Package size={12} />,
              label: "Upload 10 products monthly",
            },
            { icon: <TrendingUp size={12} />, label: "Basic analytics" },
          ]
        : [];

  return (
    <div
      className={`${config.container} border rounded-xl p-4 mb-6 relative shadow-sm`}
    >
      {/* Close */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X size={18} />
      </button>

      <div className="flex gap-4">
        {config.icon}

        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-800">{config.title}</h4>

          <p className="text-xs text-gray-600 mt-1">{config.message}</p>

          {benefits.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Plan benefits
              </p>
              <div className="flex flex-wrap gap-3">
                {benefits.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-xs text-gray-700"
                  >
                    {b.icon}
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorNotificationBanner;
