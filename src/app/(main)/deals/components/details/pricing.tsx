"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Icon from "@/components/ui/icon";
import AppImage from "@/components/ui/app-image";
import { Star } from "lucide-react";

type BrandDetails = {
  passportPhoto?: string;
  name?: string;
};

type DealPricingProps = {
  title?: string;
  description?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  rating?: number;

  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  currency?: string;
  currencySymbol?: string;
  shippingCost?: string;
  couponCode?: string;
  affiliateUrl?: string;

  brand?: string;
  platform?: string;

  colors?: string[];
  sizes?: string[];
  specifications?: Record<string, any>;

  availability?: string;
  expirationDate?: string;
  expiresAt?: Date;

  likes?: string[]; // array of userIds

  bookmarks?: number;
  upvotes?: number;
  views?: number;
  isVerified?: boolean;
  isSaved?: boolean;
  freeShipping?: boolean;
  featured?: boolean;

  comments?: any[];

  createdBy?: string;
  createdAt?: string | Date;
  status?: string;
};

const DealPricing = ({
  title = "Product name",
  description = "No description available for this deal.",
  brand = "Amazon",
  images = [],
  originalPrice = 100000,
  discountedPrice = 99999.9,
  discountPercentage = 25,
  currencySymbol = "$",
  freeShipping = false,
  likes = 0,
  rating = 4.5,
  comments = [],
  createdAt,
  colors = [],
  sizes = [],
}: DealPricingProps) => {
  const [brandDetails, setBrandDetails] = useState<BrandDetails>({});
  const savings = originalPrice - discountedPrice;
  const [addingToCart, setAddingToCart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] || null,
  );

  const params = useParams();
  const dealId = params?.id as string;

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;

  const userId = user?._id || user?.id;

  const [likesList, setLikesList] = useState<string[]>(
    Array.isArray(likes) ? likes : [],
  );

  const [isLiked, setIsLiked] = useState(
    userId ? likesList.includes(userId) : false,
  );

  const [likesCount, setLikesCount] = useState(likesList.length);

  const handleAddToCart = () => {
    if (!dealId) {
      alert("Deal ID missing");
      return;
    }

    setAddingToCart(true);

    try {
      const raw = localStorage.getItem("cart");
      const cart = raw ? JSON.parse(raw) : [];

      const newItem = {
        id: dealId,
        title,
        originalPrice,
        discountedPrice,
        currency: currencySymbol,
        images: images?.length ? images : ["/placeholder.png"],
        quantity: 1,
        selected: true,
        color: selectedColor,
        size: selectedSize,
        addedAt: Date.now(),
      };

      // prevent duplicates (optional)
      const exists = cart.find((item: any) => item.id === dealId);
      if (!exists) {
        cart.push(newItem);
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      // 🔔 notify header / other tabs
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSaveDeal = () => {
    if (!dealId) {
      alert("Deal ID missing");
      return;
    }

    setSaving(true);

    try {
      const raw = localStorage.getItem("savedDeals");
      const savedDeals = raw ? JSON.parse(raw) : [];

      // prevent duplicates
      if (!savedDeals.includes(dealId)) {
        savedDeals.push(dealId);
        localStorage.setItem("savedDeals", JSON.stringify(savedDeals));

        // 🔔 notify header / menu
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Failed to save deal", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!userId) {
      alert("Please login to like this deal");
      return;
    }

    if (!dealId) {
      console.error("Deal ID not found in route params");
      return;
    }

    // 🔥 optimistic update
    const alreadyLiked = likesList.includes(userId);

    const updatedLikes = alreadyLiked
      ? likesList.filter((id) => id !== userId)
      : [...likesList, userId];

    setLikesList(updatedLikes);
    setIsLiked(!alreadyLiked);
    setLikesCount(updatedLikes.length);

    try {
      const response = await fetch(
        `http://localhost:5000/api/deals/${dealId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();

      // ✅ sync with backend truth
      if (Array.isArray(data.likes)) {
        setLikesList(data.likes);
        setIsLiked(data.likes.includes(userId));
        setLikesCount(data.likes.length);
      }
    } catch (err) {
      console.error("Like toggle failed, reverting", err);

      // rollback if API fails
      setLikesList(likesList);
      setIsLiked(alreadyLiked);
      setLikesCount(likesList.length);
    }
  };

  // Fetch brand details
  // Fetch brand details
  useEffect(() => {
    if (!brand) return;

    fetch(`http://localhost:5000/api/vendors/name/${encodeURIComponent(brand)}`)
      .then((res) => res.json())
      .then((data) => {
        setBrandDetails({
          passportPhoto: data?.vendor?.businessLogo || "/avatar.png", // use businessLogo now
          name: data?.vendor?.name || brand,
        });
      })
      .catch(() => {
        setBrandDetails({ passportPhoto: "/avatar.png", name: brand });
      });
  }, [brand]);

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  const StarRating = ({
    rating,
    size = 16,
  }: {
    rating: number;
    size?: number;
  }) => {
    const rounded = Math.round(rating * 2) / 2; // force .5 steps

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          if (rounded >= star) {
            return (
              <Star
                key={star}
                size={size}
                className="text-orange-500 fill-orange-500"
              />
            );
          }

          if (rounded >= star - 0.5) {
            return (
              <div key={star} className="relative w-[16px] h-[16px]">
                <Star size={size} className="text-orange-500" />
                <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                  <Star
                    size={size}
                    className="text-orange-500 fill-orange-500"
                  />
                </div>
              </div>
            );
          }

          return <Star key={star} size={size} className="text-orange-500" />;
        })}
      </div>
    );
  };

  const trustedScore = Math.round((rating / 5) * 100);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-4 sm:p-8 shadow-sm font-sans w-full max-w-2xl mx-auto">
      {/* 1. Top Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <AppImage
              src={brandDetails.passportPhoto || "/avatar.png"}
              alt={brandDetails.name || brand}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-gray-700">
            {brand}
          </span>
          <Icon
            name="CheckCircle"
            size={12}
            className="text-blue-500 fill-blue-500 text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
          <Icon name="Megaphone" size={12} className="text-red-500" />
          <span className="text-[10px] sm:text-xs font-bold text-red-500 whitespace-nowrap">
            Limited Offer - Expires in 0h : 30m : 12s
          </span>
        </div>
      </div>

      {/* 2. Product Title */}
      <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-tight mb-4">
        {title}
      </h1>

      {/* 3. Ratings & Engagement Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <StarRating rating={rating} />
          <span className="font-bold text-gray-800">
            {rating.toFixed(1)}/5.0
          </span>
          <span className="text-gray-400 font-medium">
            ({comments?.length || 0})
          </span>
          <span className="text-gray-300 mx-1">•</span>
          <span className="text-gray-500 font-medium">
            {trustedScore}% trusted score
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Icon name="MessageSquare" size={16} />
            <span className="text-xs font-bold">10.1k</span>
          </div>
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 transition ${isLiked ? "text-green-600" : "text-gray-400"}`}
          >
            <div
              className={`p-1.5 rounded-full ${isLiked ? "bg-green-100" : "bg-gray-50"}`}
            >
              <Icon
                name="ThumbsUp"
                size={16}
                className={isLiked ? "fill-green-600" : ""}
              />
            </div>
            <span className="text-xs font-bold text-gray-800">
              {likesCount}
            </span>
          </button>
          <button className="p-1.5 bg-red-50 rounded-full">
            <Icon name="ThumbsDown" size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* 4. Pricing Section (Peach Box) */}
      <div className="bg-[#FFF8F3] rounded-[1.5rem] p-5 sm:p-6 mb-6 border border-orange-50">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-400">
            {currencySymbol}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-black tracking-tighter">
            {discountedPrice.toLocaleString()}
          </span>
          <span className="text-sm sm:text-base text-gray-300 line-through ml-2 font-medium">
            {currencySymbol}
            {originalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
            -{discountPercentage}% OFF
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-semibold">
            You save {currencySymbol}
            {savings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 5. Colors Selection */}
      {colors?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">
            Select color
          </h3>
          <div className="flex items-center gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-9 h-9 rounded-full border-2 transition-transform active:scale-90 ${
                  selectedColor === color
                    ? "border-red-500 p-0.5"
                    : "border-transparent"
                }`}
              >
                <div
                  className="w-full h-full rounded-full shadow-inner"
                  style={{ backgroundColor: color }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Sizes Selection */}
      {sizes?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">
            Select size (Euro)
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-2 border rounded-xl text-xs font-bold transition-all ${
                  selectedSize === size
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                    : "border-gray-100 text-gray-300 hover:bg-gray-50"
                }`}
              >
                {size} size
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Description */}
      <div className="mb-8">
        <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-2">
          Deal Description
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {description}
        </p>
        <button className="text-blue-500 text-xs font-bold mt-2 flex items-center gap-1 hover:underline">
          View full descriptions <Icon name="ChevronRight" size={14} />
        </button>
      </div>

      {/* 8. Shipping & Brand Info */}
      <div className="space-y-3 mb-8">
        {freeShipping && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-[11px] font-bold w-fit">
            <Icon name="Globe" size={14} />
            Free Shipping: 2-3 business days
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
            <AppImage
              src={brandDetails.passportPhoto || "/avatar.png"}
              alt="user"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            <span className="text-gray-700 font-bold">{formattedDate}</span> by{" "}
            {brandDetails.name || brand}
          </span>
        </div>
      </div>

      {/* 9. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        {/* 1. Get Deal Button - Full width on mobile, flex-[2.5] on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className={`w-full cursor-pointer sm:flex-[2.5] rounded-2xl py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-100
          ${addingToCart ? "bg-blue-400" : "bg-[#0085FF] hover:bg-blue-600 text-white"}`}
          disabled={addingToCart}
        >
          {addingToCart ? "Adding..." : "Get deal now"}
          <Icon name="ShoppingCart" size={18} />
        </button>

        {/* 2. Save Deal Button - Full width on mobile, flex-1 on desktop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSaveDeal();
          }}
          className="w-full cursor-pointer sm:flex-1 rounded-2xl py-3 sm:py-4 font-bold text-xs sm:text-sm border-2 border-red-500 text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-[0.98]"
          disabled={saving}
        >
          {saving ? "..." : "Save deal"}
        </button>

        {/* 3. Share Button - Full width on mobile, auto width on desktop */}
        <button className="w-full sm:w-auto p-4 bg-gray-50 text-blue-500 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors">
          <Icon name="Share2" size={20} />
          {/* Adding a label that only shows on small screens to make the full-width button look better */}
          <span className="sm:hidden ml-2 font-bold text-sm">Share Deal</span>
        </button>
      </div>
    </div>
  );
};

export default DealPricing;
