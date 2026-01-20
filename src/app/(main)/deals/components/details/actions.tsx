"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import Icon from "@/components/ui/icon";
import {
  getStoredUserId,
  fetchUserProfile,
  UserProfile,
} from "@/services/user";

const DealActions = ({ deal }: { deal: any }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ✅ Load user profile once
  useEffect(() => {
    const loadProfile = async () => {
      const userId = getStoredUserId();
      if (!userId) return; // not logged in
      try {
        const profile = await fetchUserProfile(userId);
        setUserProfile(profile);
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    };
    loadProfile();
  }, []);

  // ✅ Always re-check per deal.id when component mounts or deal changes
  useEffect(() => {
    if (!deal?.id && !deal?._id) return;
    const dealId = deal.id || deal._id;
    const savedDeals = JSON.parse(localStorage.getItem("savedDeals") || "[]");
    const found = savedDeals.some(
      (d: any) => d.id === dealId || d._id === dealId,
    );
    setIsSaved(found);
  }, [deal]);

  const handleGetDeal = (e?: React.MouseEvent) => {
    e?.preventDefault();

    const link = deal?.url || deal?.dealUrl; // ✅ support both keys

    if (!link) {
      alert("No deal link available.");
      return;
    }

    try {
      // ✅ Ensure absolute URL
      const fullUrl = link.startsWith("http") ? link : `https://${link}`;
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open link:", error);
      alert("Unable to open this deal link.");
    }
  };

  const handleSaveDeal = () => {
    if (!deal?.id && !deal?._id) return;
    const dealId = deal.id || deal._id;
    const savedDeals = JSON.parse(localStorage.getItem("savedDeals") || "[]");
    let updatedDeals;

    if (isSaved) {
      updatedDeals = savedDeals.filter(
        (d: any) => d.id !== dealId && d._id !== dealId,
      );
    } else {
      const alreadySaved = savedDeals.some(
        (d: any) => d.id === dealId || d._id === dealId,
      );
      updatedDeals = alreadySaved ? savedDeals : [...savedDeals, deal];
    }

    localStorage.setItem("savedDeals", JSON.stringify(updatedDeals));
    setIsSaved(!isSaved);
  };

  // ✅ Block share for regular or unregistered users
  const handleShareClick = async () => {
    const userId = getStoredUserId();

    if (!userId) {
      alert("You must be registered to share deals.");
      return;
    }

    if (!userProfile) {
      try {
        const profile = await fetchUserProfile(userId);
        setUserProfile(profile);
        if (profile.type === "regular") {
          alert("Only registered vendors can share deals.");
          return;
        }
      } catch {
        alert("Error verifying user status. Please log in again.");
        return;
      }
    } else if (userProfile.type === "regular") {
      alert("Only registered vendors can share deals.");
      return;
    }

    // ✅ Open share menu if user is allowed
    setIsShareMenuOpen(!isShareMenuOpen);
  };

  const handleShare = (platform: string) => {
    const url = window.location?.href;
    const title = `Check out this deal: ${deal?.title}`;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard?.writeText(url);
        setIsShareMenuOpen(false);
        return;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setIsShareMenuOpen(false);
  };

  return (
    <div className="space-y-4">
      <Button
        variant="default"
        size="lg"
        onClick={handleGetDeal}
        className="text-lg py-4 w-full"
      >
        Get This Deal <ExternalLink className="ml-2" />
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={isSaved ? "default" : "outline"}
          size="default"
          onClick={handleSaveDeal}
          className="w-full flex items-center justify-center"
        >
          <span className="mr-2">
            {isSaved ? <BookmarkCheck /> : <Bookmark />}
          </span>
          {isSaved ? "Saved" : "Save Deal"}
        </Button>

        <div className="relative">
          <Button
            variant="outline"
            size="default"
            onClick={handleShareClick} // ✅ use permission check
            className="w-full flex items-center justify-center"
          >
            <Share2 className="mr-2" />
            Share
          </Button>

          {isShareMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-dropdown z-200">
              <div className="p-2">
                {["twitter", "facebook", "linkedin", "copy"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleShare(p)}
                    className="flex items-center space-x-2 w-full p-2 text-left rounded-md hover:bg-muted transition-colors"
                  >
                    <Icon
                      name={p.charAt(0).toUpperCase() + p.slice(1)}
                      size={16}
                    />
                    <span className="text-sm capitalize">
                      {p === "copy" ? "Copy Link" : p}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealActions;
