interface Category {
  name: string;
  icon: string;
  color: string;
}
export const categories: Category[] = [
  { name: "Electronics", icon: "Smartphone", color: "bg-blue-500" },
  { name: "Fashion", icon: "Shirt", color: "bg-purple-500" },
  { name: "Home & Garden", icon: "Home", color: "bg-green-500" },
  { name: "Sports", icon: "Dumbbell", color: "bg-orange-500" },
];

type Vendor = {
  name: string;
  rating: number;
  trustScore: number;
  verified: boolean;
};

type Shipping = {
  isFree: boolean;
  cost: number;
  estimatedDays: string;
};

type Specifications = {
  brand: string;
  model: string;
  connectivity: string;
  batteryLife: string;
  waterResistance: string;
  noiseCancellation: string;
  compatibility: string;
};

type UserVote = "upvote" | "downvote" | null;

type Deal = {
  id: string | number;
  title: string;
  images: string[];
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  currency: string;
  dealUrl: string;
  description: string;
  vendor: Vendor;
  shipping: Shipping;
  specifications: Specifications;
  tags: string[];
  postedDate: string; // could refine with Date if parsed
  expiryDate: string; // ISO string format
  views: number;
  commentsCount: number;
  verified: boolean;
  isSaved: boolean;
  upvotes: number;
  downvotes: number;
  userVote: UserVote;
};

export const mockDeal: Deal = {
  id: "1",
  title:
    "Apple AirPods Pro (2nd Generation) with MagSafe Charging Case - Active Noise Cancellation",
  images: [
    "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
  ],
  originalPrice: 249.0,
  discountedPrice: 179.99,
  discountPercentage: 28,
  currency: "USD",
  dealUrl: "https://amazon.com/airpods-pro-2nd-gen",
  description: `Experience next-level sound with the Apple AirPods Pro (2nd generation). Featuring the Apple-designed H2 chip, these earbuds deliver richer bass and clearer highs. The Active Noise Cancellation is up to 2x more effective than the previous generation.\n\nKey Features:\n• Up to 2x more Active Noise Cancellation\n• Adaptive Transparency mode\n• Personalized Spatial Audio with dynamic head tracking\n• Up to 6 hours of listening time with ANC enabled\n• MagSafe Charging Case provides up to 30 hours total listening time\n• Sweat and water resistant (IPX4)\n• Touch control for music, calls, and Siri`,
  vendor: {
    name: "Amazon",
    rating: 4.8,
    trustScore: 95,
    verified: true,
  },
  shipping: {
    isFree: true,
    cost: 0,
    estimatedDays: "2-3",
  },
  specifications: {
    brand: "Apple",
    model: "AirPods Pro (2nd Generation)",
    connectivity: "Bluetooth 5.3",
    batteryLife: "6 hours (30 hours with case)",
    waterResistance: "IPX4",
    noiseCancellation: "Active Noise Cancellation",
    compatibility: "iPhone, iPad, Mac, Apple Watch",
  },
  tags: [
    "Electronics",
    "Audio",
    "Wireless",
    "Apple",
    "Noise Cancelling",
    "Premium",
  ],
  postedDate: "2 days ago",
  expiryDate: "2025-01-15T23:59:59Z",
  views: 15420,
  commentsCount: 47,
  verified: true,
  isSaved: false,
  upvotes: 234,
  downvotes: 12,
  userVote: null,
};
