/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react"; // Matching the link icon in the button
import { useState } from "react";

export type AnalyzedData = {
  title: string;
  description: string;
  originalPrice: string;
  currentPrice: string;
  images: string[];
  category: string;
  brand: string;
  availability: string;
  shippingCost: string;
};

type SupportedPlatform = {
  name: string;
  domain: string;
  logoUrl?: string; // Added for actual logo display if available
  color: string;
};

interface URLInputSectionProps {
  onURLAnalyzed?: (data: AnalyzedData) => void;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const URLInputSection: React.FC<URLInputSectionProps> = ({
  onURLAnalyzed,
  formData,
  setFormData,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [detectedPlatform, setDetectedPlatform] =
    useState<SupportedPlatform | null>(null);

  const supportedPlatforms: SupportedPlatform[] = [
    { name: "JUMIA", domain: "jumia.com.ng", color: "text-black font-bold" },
    { name: "AliExpress", domain: "aliexpress.com", color: "text-orange-500" },
    { name: "amazon", domain: "amazon.com", color: "text-black" },
    { name: "Walmart", domain: "walmart.com", color: "text-blue-400" },
    { name: "TEMU", domain: "temu.com", color: "text-orange-600" },
    { name: "ebay", domain: "ebay.com", color: "text-blue-600" },
    { name: "konga", domain: "konga.com", color: "text-pink-600" },
  ];

  const detectPlatform = (url: string) => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return supportedPlatforms.find((platform) =>
        domain.includes(platform.domain.split(".")[0]),
      );
    } catch {
      return null;
    }
  };

  const validateURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, url }));
    setUrlError("");

    if (url && validateURL(url)) {
      const platform = detectPlatform(url);
      setDetectedPlatform(platform);
    } else {
      setDetectedPlatform(null);
    }
  };

  const analyzeURL = async () => {
    if (!formData?.url) {
      setUrlError("Please enter a valid URL");
      return;
    }
    if (!validateURL(formData.url)) {
      setUrlError("Please enter a valid URL format");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("http://localhost:5000/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.url }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze URL");
      }

      const realData: AnalyzedData = await res.json();

      setFormData((prev) => ({
        ...prev,
        ...realData,
        platform: detectedPlatform?.name || "Other",
      }));

      onURLAnalyzed?.(realData);
    } catch (error: any) {
      setUrlError(error.message || "Failed to analyze URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-600">
        Deal URL <span className="text-red-500">*</span>
      </label>

      {/* Input and Button Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Input text field"
            className="h-12 bg-gray-50/50 border-gray-100 rounded-xl focus-visible:ring-blue-500"
            value={formData?.url || ""}
            onChange={handleURLChange}
          />
        </div>
        <Button
          onClick={analyzeURL}
          disabled={!formData?.url || isAnalyzing}
          className="h-12 px-8 bg-[#0084FF] hover:bg-blue-600 text-white rounded-2xl flex items-center gap-2 font-medium transition-all"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze link"}
          <Link2 size={18} className="rotate-45" />
        </Button>
      </div>

      {/* Error and Helper Text */}
      <div className="space-y-1">
        {urlError && <p className="text-sm text-destructive">{urlError}</p>}
        <div className="flex items-center gap-1.5 text-[#f2994a]">
          <Icon name="Info" size={14} />
          <p className="text-xs italic">
            Paste the direct link to the product or deal page
          </p>
        </div>
      </div>

      {/* Detected Platform Alert (Optional UI logic preservation) */}
      {detectedPlatform && (
        <div className="text-xs text-green-600 font-medium">
          ✓ Detected platform: {detectedPlatform.name}
        </div>
      )}

      {/* Supported Platforms Box */}
      <div className="mt-6 p-5 bg-[#f0f7ff]/50 border border-[#cce3ff] rounded-3xl">
        <p className="text-sm font-semibold text-gray-400 mb-4">
          Supported Platforms
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          {supportedPlatforms.map((platform) => (
            <span
              key={platform.name}
              className={`text-lg md:text-xl font-bold tracking-tight opacity-80 hover:opacity-100 cursor-default transition-opacity ${platform.color}`}
            >
              {platform.name}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-[#ff4d4f] mt-4 font-medium italic">
          ***Other platforms are supported but may require manual entry
        </p>
      </div>
    </div>
  );
};

export default URLInputSection;
