import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Heart,
  Megaphone,
  Rocket,
  ThumbsUp,
  MessageCircle,
  Code,
} from "lucide-react";

interface DealsSectionProps {
  vendorId: string;
  brand: string;
}

/* ===========================
   MAP API → UI
=========================== */
const mapApiDealToCard = (deal: any) => ({
  id: deal._id,
  image: deal.images?.[0] || "/placeholder.png",
  discount: `-${Math.round(deal.discountPercentage)}%`,
  badge: {
    type: deal.featured ? "sponsored" : "boosted",
    label: deal.featured ? "Sponsored post" : "Boosted",
    icon: deal.featured ? Megaphone : Rocket,
    color: deal.featured ? "bg-blue-500" : "bg-orange-500",
  },
  isLiked: deal.isSaved,
  store: {
    name: deal.brand,
    icon: Code,
  },
  likes: deal.likes?.length.toString() || "0",
  title: deal.title,
  price: deal.discountedPrice,
  originalPrice: deal.originalPrice,
  user: {
    name: deal.brand,
    avatar: "/avatar.png",
  },
  time: new Date(deal.createdAt).toLocaleDateString(),
  comments: deal.comments?.length.toString() || "0",
});

/* ===========================
   DEAL CARD
=========================== */
const DealCard = ({ deal }: { deal: any }) => {
  const BadgeIcon = deal.badge.icon;
  const [brandLogo, setBrandLogo] = useState<string>("/avatar.png");
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    if (!deal?.store?.name) return;

    const fetchBrandLogo = async () => {
      try {
        const res = await fetch(
          `${baseURL}/vendors/name/${encodeURIComponent(
            deal.store.name,
          )}`,
        );
        const data = await res.json();
        setBrandLogo(data?.vendor?.businessLogo || "/avatar.png");
      } catch (err) {
        setBrandLogo("/avatar.png");
      }
    };

    fetchBrandLogo();
  }, [deal.store.name]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image */}
      <div className="relative h-64 w-full bg-gray-50">
        <Image
          src={deal.image}
          alt={deal.title}
          fill
          className="object-cover"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            {deal.discount}
          </span>
          <div
            className={`flex items-center space-x-1 ${deal.badge.color} text-white text-xs font-medium px-2 py-1 rounded-md`}
          >
            <BadgeIcon size={12} />
            <span>{deal.badge.label}</span>
          </div>
        </div>

        {/* Like */}
        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm">
          <Heart
            size={20}
            className={
              deal.isLiked ? "fill-red-500 text-red-500" : "text-gray-400"
            }
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Store */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Image
              src={brandLogo}
              alt={deal.store.name}
              width={20}
              height={20}
              className="rounded-full object-cover"
            />
            <span>{deal.store.name}</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1 text-green-500 font-medium">
              <ThumbsUp size={16} />
              <span>{deal.likes}</span>
            </div>
          </div>
        </div>

        {/* Title & Price */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-medium text-gray-900 pr-4 line-clamp-2">
            {deal.title}
          </h3>

          <div className="text-right">
            <div className="text-xl font-bold text-gray-900">${deal.price}</div>
            <div className="text-xs text-gray-400 line-through">
              ${deal.originalPrice}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <Image
              src={brandLogo}
              alt={deal.store.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span>
              <span className="font-medium text-gray-700">{deal.time}</span> by{" "}
              {deal.store.name}
            </span>
          </div>

          <div className="flex items-center space-x-1 font-medium text-gray-700">
            <MessageCircle size={16} />
            <span>{deal.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===========================
   DEALS SECTION
=========================== */
const DealsSection: React.FC<DealsSectionProps> = ({ vendorId, brand }) => {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brand) return;

    const fetchDeals = async () => {
      try {
        const res = await fetch(
          `${baseURL}/deals/brand/${encodeURIComponent(brand)}`,
        );
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (err) {
        console.error("Failed to fetch deals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [brand]);

  const now = new Date();

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const expiresAt = new Date(deal.expiresAt);
      return activeTab === "active" ? expiresAt > now : expiresAt <= now;
    });
  }, [deals, activeTab, now]);

  const mappedDeals = useMemo(
    () => filteredDeals.map(mapApiDealToCard),
    [filteredDeals],
  );

  return (
    <div className="bg-white font-sans mb-8 mt-8 sm:mb-20 sm:mt-20">
       <div className="container mx-auto px-4">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-gray-200">
          <div className="flex space-x-8 relative">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-4 text-sm font-medium ${
                activeTab === "active" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Active deals (
              {deals.filter((d) => new Date(d.expiresAt) > now).length})
            </button>

            <button
              onClick={() => setActiveTab("past")}
              className={`pb-4 text-sm font-medium ${
                activeTab === "past" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              Past deals (
              {deals.filter((d) => new Date(d.expiresAt) <= now).length})
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center text-gray-400">Loading deals...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {mappedDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsSection;
