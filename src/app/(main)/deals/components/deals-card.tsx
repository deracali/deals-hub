/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AppImage from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const DealCard = ({
  deal,
  onSave,
  onVote,
}: {
  deal: any;
  onSave: (id: string | number, isSaved: boolean) => void;
  onVote: (id: string | number, vote: "up" | "down" | null) => void;
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [likesCount, setLikesCount] = useState(deal?.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [votes, setVotes] = useState({
    up: deal?.upvotes || 0,
    down: deal?.downvotes || 0,
  });

  // ✅ Safely get dealId
  const dealId = deal ? deal._id || deal.id : null;

  // ✅ Sync saved state from localStorage
  useEffect(() => {
    if (!dealId) return;
    const savedDeals = JSON.parse(
      localStorage.getItem("savedDeals") || "[]",
    ) as any[];
    const alreadySaved = savedDeals.some(
      (d: any) => d._id === dealId || d.id === dealId,
    );
    setIsSaved(alreadySaved);
  }, [dealId]);

  // ✅ Fetch initial like state
  useEffect(() => {
    if (!deal || !deal.likes) return;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const userObj = JSON.parse(storedUser);
      const userId = userObj._id; // extract _id

      const liked = deal.likes.some((like: any) => {
        // if like is an object with _id
        if (like._id) return like._id === userId;
        // if like is already a string
        return like.toString() === userId;
      });

      setIsLiked(liked);
    } catch (err) {
      console.error("Failed to parse stored user:", err);
    }
  }, [deal]);

  // ✅ Handle like/unlike toggle
  const handleLikeToggle = async () => {
    if (!dealId) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user._id || user.id; // handle both _id and id

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/deals/${dealId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }), // send id or _id
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setIsLiked(!isLiked);
      setLikesCount(data.likes ?? likesCount);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // ✅ Handle voting
  const handleVote = (voteType: "up" | "down") => {
    if (!dealId) return;

    const newVote = userVote === voteType ? null : voteType;
    const oldVote = userVote;

    setUserVote(newVote);
    setVotes((prev) => {
      const newVotes = { ...prev };
      if (oldVote === "up") newVotes.up--;
      if (oldVote === "down") newVotes.down--;
      if (newVote === "up") newVotes.up++;
      if (newVote === "down") newVotes.down++;
      return newVotes;
    });

    onVote?.(dealId, newVote);
  };

  // ✅ Handle save/unsave to localStorage
  const handleSave = () => {
    if (!dealId || !deal) return;

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    const savedDeals = JSON.parse(
      localStorage.getItem("savedDeals") || "[]",
    ) as any[];

    if (newSavedState) {
      const alreadySaved = savedDeals.some(
        (d: any) => d._id === dealId || d.id === dealId,
      );
      if (!alreadySaved) {
        savedDeals.push(deal);
        localStorage.setItem("savedDeals", JSON.stringify(savedDeals));
      }
    } else {
      const updatedDeals = savedDeals.filter(
        (d: any) => d._id !== dealId && d.id !== dealId,
      );
      localStorage.setItem("savedDeals", JSON.stringify(updatedDeals));
    }

    onSave?.(dealId, newSavedState);
  };

  // ✅ Calculate time left
  const calculateTimeLeft = () => {
    if (!deal?.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(deal.expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
  };

  const timeLeft = calculateTimeLeft();
  const discountPercentage =
    deal?.originalPrice && deal?.discountedPrice
      ? Math.round(
          ((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) *
            100,
        )
      : 0;

  if (!deal) return null; // extra safety

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-hover-elevation transition-all duration-200">
      <div className="relative overflow-hidden h-48">
        <AppImage
          src={deal?.images?.[0]}
          alt={deal?.title}
          className="w-full h-full object-cover"
        />

        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercentage}%
          </span>
        )}

        <button
          onClick={handleSave}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isSaved
              ? "bg-accent text-accent-foreground"
              : "bg-white/90 text-gray-700 hover:bg-white"
          }`}
        >
          <Icon name={isSaved ? "BookmarkCheck" : "Bookmark"} size={16} />
        </button>

        {deal?.hasCashback && (
          <div className="absolute bottom-2 left-2 bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium">
            Cashback Available
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                deal?.isVerifiedVendor
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }`}
            >
              <span>{deal?.brand || deal?.platform}</span>
            </span>
            {deal?.isVerifiedVendor && (
              <Icon name="BadgeCheck" size={14} className="text-success" />
            )}
          </div>

          {timeLeft && (
            <span
              className={`text-xs font-medium ${
                timeLeft === "Expired" ? "text-error" : "text-warning"
              }`}
            >
              {timeLeft}
            </span>
          )}
        </div>

        <Link
          href={`/deals/1?id=${dealId}`}
          className="block hover:text-primary transition-colors"
        >
          <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2">
            {deal?.title}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-card-foreground">
            ${Number(deal?.originalPrice || 0).toFixed(2)}
          </span>
          {deal?.originalPrice > deal?.discountedPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${Number(deal?.discountedPrice || 0).toFixed(2)}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {deal?.description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all ${
              isLiked
                ? "bg-primary/10 text-red-500" // red heart when liked
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <Icon
              name="Heart"
              size={14}
              className={isLiked ? "text-red-500" : ""}
            />
            <span className="text-xs font-medium">{likesCount}</span>
          </button>

          <Button variant="default" size="sm" asChild>
            <Link href={`/deals/1?id=${dealId}`}>View Deal</Link>
          </Button>
        </div>

        <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
          <span className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Icon name="MessageCircle" size={12} />
            <span>{deal?.commentsCount || 0} comments</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Posted {new Date(deal?.createdAt)?.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
