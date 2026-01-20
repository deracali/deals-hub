"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, ExternalLink } from "lucide-react";
import RelatedDeals from "./related-deals";
import DealPricing from "./pricing";
import DealComments from "./user-comments";
import DealInfo from "./deal-info";
import DealImageGallery from "./image-gallery";
import Icon from "@/components/ui/icon";
import Header from "@/components/general/header";


import { fetchDealById } from "@/services/fetchDeals";
import { getStoredUserId } from "@/services/user";
import { Deal } from "@/types/fetchDeals";

const DealDetails = () => {
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const id = getStoredUserId();
    setUserId(id);
    setIsAuthenticated(Boolean(id));
  }, []);

  useEffect(() => {
    if (!dealId) {
      setDeal(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    const getDeal = async () => {
      setLoading(true);
      try {
        const data = await fetchDealById(dealId);
        if (!mounted) return;
        setDeal(data);
      } catch (err) {
        console.error("Error fetching deal:", err);
        if (!mounted) return;
        setDeal(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getDeal();
    return () => {
      mounted = false;
    };
  }, [dealId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-[2rem] animate-pulse" />
            <div className="space-y-6 animate-pulse">
              <div className="h-64 bg-muted rounded-[2rem]" />
              <div className="h-32 bg-muted rounded-[2rem]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Icon
            name="AlertCircle"
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2">Deal Not Found</h2>
          <Button
            onClick={() => router.push("/deals")}
            className="flex items-center gap-x-2 mx-auto"
          >
            <ArrowLeft /> Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        {/* Breadcrumb - Matches the style we discussed */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <button
            onClick={() => router.push("/deals")}
            className="hover:text-gray-600"
          >
            Deals
          </button>
          <Icon name="ChevronRight" size={14} />
          <span className="hover:text-gray-600 cursor-pointer">
            {deal?.category || "Category"}
          </span>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {deal?.title}
          </span>
        </nav>

        {/* 60 / 40 Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-16 items-stretch">
          {/* Left Column: Image Gallery (50%) */}
          <div className="w-full">
            <DealImageGallery
              images={deal?.images || []}
              title={deal?.title || "Deal"}
            />
          </div>

          {/* Right Column: Pricing, Info, and Actions (50%) */}
          <div className="space-y-8">
            <DealPricing
              // Basic Info
              title={deal?.title}
              description={deal?.description}
              images={deal?.images} // Array of images
              category={deal?.category}
              tags={deal?.tags}
              // Pricing
              originalPrice={deal?.originalPrice}
              discountedPrice={deal?.discountedPrice}
              discountPercentage={deal?.discountPercentage}
              currency={deal?.currency}
              currencySymbol={deal?.currencySymbol}
              shippingCost={deal?.shippingCost}
              couponCode={deal?.couponCode}
              affiliateUrl={deal?.affiliateUrl}
              // Vendor Info
              brand={deal?.brand}
              platform={deal?.platform}
              // Specifications
              colors={deal?.colors}
              sizes={deal?.sizes}
              specifications={deal?.specifications}
              // Availability & Expiry
              availability={deal?.availability}
              expirationDate={deal?.expirationDate}
              expiresAt={deal?.expiresAt}
              // User Interactions
              likes={deal?.likes}
              bookmarks={deal?.bookmarks}
              upvotes={deal?.upvotes}
              views={deal?.views}
              isVerified={deal?.isVerified}
              isSaved={deal?.isSaved}
              freeShipping={deal?.freeShipping}
              featured={deal?.featured}
              // Comments
              comments={deal?.comments}
              // Metadata
              createdBy={deal?.createdBy}
              createdAt={deal?.createdAt}
              status={deal?.status}
            />
          </div>
        </div>

        <div className="mt-6 sm:mt-16 border-t border-gray-100 pt-6 sm:pt-12">
          <DealInfo deal={deal} />
        </div>

        {/* Bottom Section: Full-width Stacked Sections */}
        <div className="flex flex-col space-y-16 mt-6 sm:mt-16  border-t border-gray-100 pt-12">
          {/* Related Deals Section - Now Below and Full Width */}
          <section className="w-full">
            <RelatedDeals currentDealId={deal?._id} category={deal?.category} />
          </section>
          {/* Comments Section - Now Full Width */}
          <section className="w-full">
            <DealComments
              dealId={deal?._id}
              isAuthenticated={isAuthenticated}
            />
          </section>
        </div>
        <div className="lg:hidden h-24" />
      </main>
    </div>
  );
};

export default DealDetails;
