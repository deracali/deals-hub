/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

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
    if (formData?.url || formData?.title || formData?.currentPrice) {
      validateDeal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData?.url,
    formData?.title,
    formData?.currentPrice,
    formData?.category,
  ]);

  const validateDeal = async () => {
    setIsValidating(true);

    // Simulate validation API calls
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results: ValidationResults = {
      urlValid: formData?.url ? validateURL(formData.url) : null,
      priceValid: formData?.currentPrice
        ? parseFloat(formData.currentPrice) > 0
        : null,
      duplicateCheck: formData?.url
        ? await checkDuplicates(formData.url)
        : null,
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

  const checkDuplicates = async (url: string): Promise<boolean> => {
    // Simulate duplicate check
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock: 20% chance of duplicate
    return Math.random() > 0.2;
  };

  const getValidationIcon = (
    status: boolean | null,
  ): { name: string; color: string } => {
    if (status === null)
      return { name: "Clock", color: "text-muted-foreground" };
    if (status === true) return { name: "CheckCircle", color: "text-success" };
    return { name: "XCircle", color: "text-error" };
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
    const validChecks = checks.filter((check) => check === true).length;
    const totalChecks = checks.filter((check) => check !== null).length;

    if (totalChecks === 0)
      return {
        status: "pending",
        message: "Start filling the form to see validation results",
      };
    if (validChecks === totalChecks)
      return {
        status: "success",
        message: "All validations passed! Ready to submit.",
      };
    if (validChecks > totalChecks / 2)
      return {
        status: "warning",
        message: "Some issues found. Please review and fix.",
      };
    return {
      status: "error",
      message: "Multiple issues detected. Please fix before submitting.",
    };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Shield" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">
          Deal Validation
        </h3>
        {isValidating && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Validating...</span>
          </div>
        )}
      </div>

      <div
        className={`p-4 rounded-lg mb-6 ${
          overallStatus.status === "success"
            ? "bg-success/10 border border-success/20"
            : overallStatus.status === "warning"
              ? "bg-warning/10 border border-warning/20"
              : overallStatus.status === "error"
                ? "bg-error/10 border border-error/20"
                : "bg-muted border border-border"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Icon
            name={
              overallStatus.status === "success"
                ? "CheckCircle"
                : overallStatus.status === "warning"
                  ? "AlertTriangle"
                  : overallStatus.status === "error"
                    ? "XCircle"
                    : "Clock"
            }
            size={20}
            className={
              overallStatus.status === "success"
                ? "text-success"
                : overallStatus.status === "warning"
                  ? "text-warning"
                  : overallStatus.status === "error"
                    ? "text-error"
                    : "text-muted-foreground"
            }
          />
          <span className="font-medium text-card-foreground">
            {overallStatus.message}
          </span>
        </div>
      </div>

      {/* Validation Checks */}
      <div className="space-y-4">
        {validationChecks.map((check) => {
          const status = validationResults[check.key];
          const icon = getValidationIcon(status);

          return (
            <div key={check.key} className="flex items-start space-x-3">
              <Icon name={icon.name} size={20} className={icon.color} />
              <div className="flex-1">
                <p className="font-medium text-card-foreground">
                  {check.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {check.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Warnings */}
      {formData?.url && !formData.url.includes("https://") && (
        <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span className="text-sm font-medium text-warning">
              Consider using HTTPS URLs for better security
            </span>
          </div>
        </div>
      )}

      {formData?.originalPrice &&
        formData?.currentPrice &&
        parseFloat(formData.currentPrice) >=
          parseFloat(formData.originalPrice) && (
          <div className="mt-6 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">
                Deal price should be lower than original price
              </span>
            </div>
          </div>
        )}
    </div>
  );
};

export default DealValidationPanel;
