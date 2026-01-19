import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
// import AppImage if it's a custom component
// import AppImage from "@/components/ui/app-image";

interface BrandDetails {
  passportPhoto?: string;
  name?: string;
}

const DealInfo = ({ deal }) => {
  const [timeLeft, setTimeLeft] = useState("0h : 30m : 12s");
  const [brandName, setBrandName] = useState(deal?.brand || "amazon");
  const [brandDetails, setBrandDetails] = useState<BrandDetails>({});

  // Countdown timer
  useEffect(() => {
    if (!deal?.expiresAt) return;

    const updateTime = () => {
      const diff = new Date(deal.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("0h : 0m : 0s");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h : ${minutes}m : ${seconds}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [deal?.expiresAt]);

  useEffect(() => {
    if (!deal?.brand) return;

    const fetchBrand = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/vendors/name/${encodeURIComponent(deal.brand)}`,
        );
        const data = await res.json();

        setBrandDetails({
          passportPhoto: data?.vendor?.passportPhoto || "/avatar.png",
          businessLogo: data?.vendor?.businessLogo || "/avatar.png", // <-- added this
          name: data?.vendor?.name || deal.brand,
        });
        setBrandName(data?.vendor?.name || deal.brand);
      } catch (err) {
        setBrandDetails({
          passportPhoto: "/avatar.png",
          businessLogo: "/avatar.png",
          name: deal.brand,
        });
        setBrandName(deal.brand);
      }
    };

    fetchBrand();
  }, [deal?.brand]);

  const formattedDate = deal?.createdAt
    ? new Date(deal.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown date";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-8 font-sans text-slate-900">
      {/* 1. Top Banners - Stacks on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex items-center p-3 sm:p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="bg-emerald-100 p-2 rounded-full mr-3 shrink-0">
            <Icon name="CheckCircle" className="text-emerald-600" size={20} />
          </div>
          <div>
            <h4 className="text-emerald-600 font-bold text-xs sm:text-sm">
              Community Verified
            </h4>
            <p className="text-gray-500 text-[10px] sm:text-xs">
              {deal?.isVerified
                ? "This deal has been confirmed by community members"
                : "Not verified yet"}
            </p>
          </div>
        </div>

        <div className="flex items-center p-3 sm:p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="bg-orange-100 p-2 rounded-full mr-3 shrink-0">
            <Icon name="AlertTriangle" className="text-orange-600" size={20} />
          </div>
          <div>
            <h4 className="text-orange-600 font-bold text-xs sm:text-sm">
              Affiliate Disclosure:
            </h4>
            <p className="text-gray-500 text-[10px] sm:text-xs">
              We may earn a commission when you purchase through our links.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Vendor & Timer Row - Wrap tightly on mobile */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 px-2 py-1 border rounded-md bg-white">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 italic uppercase">
            {brandName}
          </span>
          <Icon
            name="CheckCircle"
            size={12}
            className="text-blue-500 fill-current"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-pink-50 text-red-500 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-pink-100">
          <Icon name="Megaphone" size={14} />
          <span className="whitespace-nowrap">
            Limited Offer - Expires in {timeLeft}
          </span>
        </div>
      </div>

      {/* 3. Title & Ratings - Responsive stacking */}
      <div className="space-y-3">
        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
          {deal?.title || "No title"}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-medium">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <Icon
                name="Star"
                size={18}
                className="text-orange-400 fill-current"
              />
              <span className="text-gray-800 font-bold">
                {deal?.averageRating ?? "0"}/5.0
              </span>
              <span className="text-gray-400 font-normal">
                ({deal?.ratingsCount ?? 0})
              </span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-gray-500 text-xs sm:text-sm">
              {deal?.views ?? 0} trusted score
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Icon name="MessageSquare" size={18} />
              <span className="text-xs font-bold">
                {deal?.comments?.length ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Icon name="ThumbsUp" size={18} />
              <span className="text-xs font-bold">
                {deal?.likes?.length ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Content Grid - Stacks on mobile, 2-cols on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Description */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold">Deal Description</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {deal?.description || "No description available."}
          </p>
          <div className="space-y-2">
            <p className="font-bold text-[11px] uppercase tracking-wider text-gray-400">
              Key Features:
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5">
              {(deal?.specifications
                ? Object.entries(deal.specifications).map(
                    ([key, val]) => `• ${key}: ${val}`,
                  )
                : ["• No features available"]
              ).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Specifications Box */}
        <div className="lg:col-span-7">
          <div className="bg-[#f8f9fa] rounded-[2rem] p-5 sm:p-8 border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
              Product Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
              {deal?.specifications
                ? Object.entries(deal.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center border-b border-gray-200 pb-2"
                    >
                      <span className="font-medium text-gray-500 text-sm capitalize">
                        {key}:
                      </span>
                      <span className="font-bold text-slate-900 text-sm text-right">
                        {val}
                      </span>
                    </div>
                  ))
                : null}
            </div>

            {/* Spec Tags - Reduced mt on mobile */}
            <div className="flex flex-wrap gap-2 mt-6 sm:mt-10">
              {deal?.tags && deal.tags.length > 0 ? (
                deal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-blue-50 text-blue-500 rounded-full text-[10px] sm:text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="px-4 py-1.5 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">
                  No tags
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer Info - Stacks on mobile */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-100 overflow-hidden shrink-0">
            <img
              src={
                brandDetails?.businessLogo ||
                brandDetails?.passportPhoto ||
                "/avatar.png"
              }
              alt={brandDetails.name || brandName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-[11px] sm:text-xs">
            <span className="font-bold text-gray-900">{formattedDate}</span>
            <span className="text-gray-400">
              {" "}
              by {brandDetails.name || brandName}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 bg-blue-50 px-4 py-2.5 rounded-xl text-blue-600 font-bold text-[11px] sm:text-sm">
          <Icon name="Truck" size={18} />
          <span>
            {deal?.freeShipping
              ? "Free Shipping: 2-3 business days"
              : `Shipping: ${deal?.shippingCost}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DealInfo;
