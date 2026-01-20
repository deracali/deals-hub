import AppImage from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Link from "next/link";

interface Category {
  id: string;
  image: string;
  title: string;
  color: string;
  dealsCount: number;
  maxDiscount: number;
  description: string;
}

interface CuratedCategoriesProps {
  categories?: Category[];
}

const CuratedCategories: React.FC<CuratedCategoriesProps> = ({
  categories = [],
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories?.map((category) => (
        <div
          key={category?.id}
          className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="relative h-48 overflow-hidden">
            <AppImage
              src={category?.image}
              alt={category?.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div
              className={`absolute inset-0 ${category?.color} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}
            ></div>

            {/* Stats Overlay */}
            <div className="absolute top-4 left-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-medium">
                {category?.dealsCount} deals
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <div className="bg-yellow-400 text-yellow-900 rounded-lg px-3 py-1 text-sm font-bold">
                Up to {category?.maxDiscount}% OFF
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {category?.title}
            </h3>

            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              {category?.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Tag" size={14} />
                  <span>{category?.dealsCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="TrendingDown" size={14} />
                  <span>{category?.maxDiscount}%</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                asChild
              >
                <Link href="/deals-dashboard">
                  <Icon name="ArrowRight" size={16} />
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
};

export default CuratedCategories;
