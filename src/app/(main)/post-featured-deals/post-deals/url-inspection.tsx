/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

// Type for the mock data or scraped deal details
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

// Type for supported platforms
type SupportedPlatform = {
  name: string;
  domain: string;
  icon: string;
  color: string;
};

// Props for the component
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
    {
      name: "Amazon",
      domain: "amazon.com",
      icon: "ShoppingBag",
      color: "text-orange-600",
    },
    {
      name: "AliExpress",
      domain: "aliexpress.com",
      icon: "Globe",
      color: "text-red-600",
    },
    {
      name: "Temu",
      domain: "temu.com",
      icon: "Package",
      color: "text-purple-600",
    },
    { name: "eBay", domain: "ebay.com", icon: "Gavel", color: "text-blue-600" },
    {
      name: "Walmart",
      domain: "walmart.com",
      icon: "Store",
      color: "text-blue-500",
    },
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
      // Fake delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockData: AnalyzedData = {
        title: "Premium Wireless Bluetooth Headphones - Noise Cancelling",
        description: `High-quality wireless headphones with active noise cancellation technology.\n\nFeatures:\n• 30-hour battery life\n• Quick charge: 5 minutes = 3 hours playback\n• Premium sound quality with deep bass\n• Comfortable over-ear design\n• Built-in microphone for calls\n• Compatible with all devices`,
        originalPrice: "199.99",
        currentPrice: "89.99",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
        ],
        category: "electronics",
        brand: "AudioTech Pro",
        availability: "In Stock",
        shippingCost: "0.00",
      };

      setFormData((prev) => ({
        ...prev,
        ...mockData,
        platform: detectedPlatform?.name || "Other",
      }));

      onURLAnalyzed?.(mockData);
    } catch (error) {
      setUrlError(
        "Failed to analyze URL. Please try again or fill details manually.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Link" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">Deal URL</h3>
      </div>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="https://example.com/product-page"
              value={formData?.url || ""}
              onChange={handleURLChange}
            />
            {urlError && (
              <p className="text-sm text-destructive mt-1">{urlError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Paste the direct link to the product or deal page
            </p>
          </div>
          <div className="flex items-end">
            <Button
              variant="default"
              onClick={analyzeURL}
              disabled={!formData?.url || isAnalyzing}
            >
              <Search />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>

        {/* Platform Detection */}
        {detectedPlatform && (
          <div className="flex items-center space-x-3 p-3 bg-success/10 border border-success/20 rounded-lg">
            <Icon
              name={detectedPlatform.icon}
              size={20}
              className={detectedPlatform.color}
            />
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Platform Detected: {detectedPlatform.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Auto-fill will populate product details from this platform
              </p>
            </div>
          </div>
        )}

        {/* Supported Platforms */}
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-card-foreground mb-3">
            Supported Platforms
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {supportedPlatforms.map((platform) => (
              <div
                key={platform.name}
                className="flex items-center space-x-2 p-2 bg-muted rounded-lg"
              >
                <Icon
                  name={platform.icon}
                  size={16}
                  className={platform.color}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Other platforms are supported but may require manual entry
          </p>
        </div>
      </div>
    </div>
  );
};

export default URLInputSection;
