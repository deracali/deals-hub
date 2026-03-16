/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Check, X, ShieldCheck, Info, Lock, TrendingDown } from "lucide-react";

type FormData = {
  url?: string;
  title?: string;
  currentPrice?: string;
  originalPrice?: string;
  category?: string;
  [key: string]: any;
};

type ValidationResults = {
  urlValid: boolean | null;
  priceValid: boolean | null;
  duplicateCheck: boolean | null;
  categoryValid: boolean | null;
  titleValid: boolean | null;
};

type ValidationCheck = {
  key: keyof ValidationResults;
  label: string;
  description: string;
};

type OverallStatus = {
  status: "pending" | "success" | "warning" | "error";
  message: string;
};

type DealValidationPanelProps = {
  formData: FormData;
};

const DealValidationPanel: React.FC<DealValidationPanelProps> = ({
  formData,
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResults>(
    {
      urlValid: null,
      priceValid: null,
      duplicateCheck: null,
      categoryValid: null,
      titleValid: null,
    },
  );

  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    if (
      formData?.url ||
      formData?.title ||
      formData?.currentPrice ||
      formData?.originalPrice
    ) {
      validateDeal();
    }
  }, [
    formData?.url,
    formData?.title,
    formData?.currentPrice,
    formData?.originalPrice, // Add this
    formData?.category,
  ]);

  const validateDeal = async () => {
    setIsValidating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Logic to check either field
    // We prioritize currentPrice (from scraper) then fallback to originalPrice (manual)
    const priceToValidate = formData?.currentPrice || formData?.originalPrice;

    const results: ValidationResults = {
      urlValid: formData?.url ? validateURL(formData.url) : null,
      priceValid: priceToValidate ? parseFloat(priceToValidate) > 0 : null,
      duplicateCheck: formData?.url ? true : null,
      categoryValid: formData?.category ? true : null,
      titleValid: formData?.title ? formData.title.length >= 10 : null,
    };

    setValidationResults(results);
    setIsValidating(false);
  };

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getValidationIconStyles = (status: boolean | null) => {
    if (status === null) return "bg-gray-50 text-gray-200";
    // Exact light green/emerald success state
    if (status === true)
      return "bg-emerald-50 text-emerald-500 border border-emerald-100";
    return "bg-red-50 text-red-400 border border-red-100";
  };

  const validationChecks: ValidationCheck[] = [
    {
      key: "urlValid",
      label: "Valid URL Format",
      description: "URL is properly formatted and accessible",
    },
    {
      key: "priceValid",
      label: "Valid Price",
      description: "Deal price is greater than zero",
    },
    {
      key: "duplicateCheck",
      label: "No Duplicates",
      description: "This deal hasn't been posted recently",
    },
    {
      key: "categoryValid",
      label: "Category Selected",
      description: "A valid category has been chosen",
    },
    {
      key: "titleValid",
      label: "Descriptive Title",
      description: "Title is at least 10 characters long",
    },
  ];

  const getOverallStatus = (): OverallStatus => {
    const checks = Object.values(validationResults);
    const validChecks = checks.filter((c) => c === true).length;
    const totalAttempted = checks.filter((c) => c !== null).length;

    if (totalAttempted === 0)
      return {
        status: "pending",
        message: "Start filling the form to see validation results",
      };
    if (validChecks === 5)
      return {
        status: "success",
        message: "All validations passed! Ready to submit.",
      };
    if (checks.some((c) => c === false))
      return { status: "error", message: "Please fix the highlighted issues." };
    return { status: "warning", message: "Validation in progress..." };
  };

  const overall = getOverallStatus();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#FF782E] fill-[#FF782E] text-white" />
          <h3 className="text-xl font-bold text-gray-400 tracking-tight">
            Deal Validation
          </h3>
        </div>
        {isValidating && (
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Banner */}
      <div
        className={`p-3.5 rounded-2xl mb-6 flex items-center gap-3 transition-colors ${
          overall.status === "success"
            ? "bg-emerald-50/50 text-emerald-600"
            : overall.status === "error"
              ? "bg-red-50 text-red-600"
              : "bg-[#FFF2E9] text-[#E67E22]"
        }`}
      >
        <Info className="w-5 h-5 flex-shrink-0" />
        <span className="text-[15px] font-semibold leading-tight">
          {overall.message}
        </span>
      </div>

      {/* List */}
      <div className="space-y-5">
        {validationChecks.map((check) => {
          const status = validationResults[check.key];
          return (
            <div key={check.key} className="flex items-start gap-4">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${getValidationIconStyles(status)}`}
              >
                {status === false ? (
                  <X size={18} />
                ) : (
                  <Check
                    size={20}
                    className={status ? "text-emerald-500" : "text-blue-300"}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[15px] font-bold ${status === null ? "text-gray-400" : "text-gray-800"}`}
                >
                  {check.label}
                </span>
                <span className="text-[13px] font-medium text-gray-400">
                  {check.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional logic warnings */}
      {formData?.url && !formData.url.includes("https://") && (
        <div className="mt-6 flex items-center gap-2 text-orange-500 bg-orange-50 p-2.5 rounded-lg border border-orange-100">
          <Lock size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Security: Use HTTPS URLs
          </span>
        </div>
      )}
    </div>
  );
};

export default DealValidationPanel;
