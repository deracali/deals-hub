interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  message: string;
  savings: number;
  dealsSaved: number;
  timeAgo: string;
}

interface Contributor {
  id: number;
  name: string;
  avatar: string;
  dealsPosted: number;
  totalUpvotes: number;
  badge: string;
  badgeColor: string;
}
interface Activity {
  id: number;
  user: string;
  action: string;
  deal: string;
  time: string;
  icon: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b2c0b26f?w=100&h=100&fit=crop&crop=face",
    message:
      "Saved over $500 this month! The community really knows where to find the best deals.",
    savings: 523.45,
    dealsSaved: 12,
    timeAgo: "2 hours ago",
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    message:
      "As a frequent deal hunter, this platform has become my go-to resource. Great community!",
    savings: 1247.32,
    dealsSaved: 28,
    timeAgo: "5 hours ago",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    message:
      "Love how active the community is. There\'s always someone sharing amazing finds!",
    savings: 892.17,
    dealsSaved: 19,
    timeAgo: "1 day ago",
  },
];

export const topContributors: Contributor[] = [
  {
    id: 1,
    name: "DealMaster99",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    dealsPosted: 156,
    totalUpvotes: 2340,
    badge: "Gold",
    badgeColor: "text-yellow-600",
  },
  {
    id: 2,
    name: "SaverQueen",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    dealsPosted: 98,
    totalUpvotes: 1890,
    badge: "Silver",
    badgeColor: "text-gray-600",
  },
  {
    id: 3,
    name: "BargainHunter",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    dealsPosted: 73,
    totalUpvotes: 1456,
    badge: "Silver",
    badgeColor: "text-gray-600",
  },
];

export const liveActivity: Activity[] = [
  {
    id: 1,
    user: "TechGuru23",
    action: "posted a new deal",
    deal: "MacBook Pro M3 - 20% off",
    time: "2 min ago",
    icon: "Plus",
  },
  {
    id: 2,
    user: "ShoppingPro",
    action: "upvoted",
    deal: "Nike Air Max - $89.99",
    time: "5 min ago",
    icon: "ArrowUp",
  },
  {
    id: 3,
    user: "DealSeeker",
    action: "commented on",
    deal: "iPhone 15 Pro deal",
    time: "8 min ago",
    icon: "MessageCircle",
  },
  {
    id: 4,
    user: "BargainBoss",
    action: "saved",
    deal: "Sony Headphones deal",
    time: "12 min ago",
    icon: "Heart",
  },
];
