"use client";

import AppImage from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Link from "next/link";

import { useEffect, useState } from "react";

export interface Product {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  upvotes: number;
  isSaved: boolean;
  vendor: string;
}

export interface TrendingProductsProps {
  products: Product[];
}

const TrendingProducts = ({ products = [] }: TrendingProductsProps) => {
  const [savedProducts, setSavedProducts] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const initialSaved: Record<string, boolean> = {};
    products.forEach((p) => {
      initialSaved[p.id] = p.isSaved || false;
    });
    setSavedProducts(initialSaved);
  }, [products]);

  const toggleSave = (productId: string) => {
    setSavedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="relative">
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <div className="relative">
              <AppImage
                src={product.image || "/NOIMAGE.png"}
                alt={product.title}
                unoptimized
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-3 left-3">
                <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                  -
                  {calculateDiscount(
                    product.originalPrice,
                    product.currentPrice,
                  )}
                  %
                </div>
              </div>

              <button
                onClick={() => toggleSave(product.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Icon
                  name="Heart"
                  size={16}
                  className={`${savedProducts[product.id] ? "text-red-500 fill-current" : "text-gray-600"}`}
                />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {product.vendor}
                </span>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Icon name="TrendingUp" size={14} />
                  <span className="text-sm font-medium">{product.upvotes}</span>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2">
                {typeof product.title === "string"
                  ? product.title.length > 20
                    ? product.title.slice(0, 20) + "..."
                    : product.title
                  : JSON.stringify(product.title).slice(0, 20) + "..."}
              </h3>

              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold text-primary">
                  ${product.currentPrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/deals/1?id=${product?.id}`}>View Deal</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleSave(product.id)}
                >
                  <Icon
                    name="Heart"
                    size={14}
                    className={
                      savedProducts[product.id]
                        ? "text-red-500 fill-current"
                        : ""
                    }
                  />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Mobile Carousel */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-72 bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="relative">
                <AppImage
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />

                {/* Discount Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                    -
                    {calculateDiscount(
                      product.originalPrice,
                      product.currentPrice,
                    )}
                    %
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => toggleSave(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <Icon
                    name="Heart"
                    size={16}
                    className={`${savedProducts[product.id] ? "text-red-500 fill-current" : "text-gray-600"}`}
                  />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {product.vendor}
                  </span>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Icon name="TrendingUp" size={14} />
                    <span className="text-sm font-medium">
                      {product.upvotes}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {product.title}
                </h3>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-primary">
                    ${product.currentPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/deals/1`}>View Deal</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSave(product.id)}
                  >
                    <Icon
                      name="Heart"
                      size={14}
                      className={
                        savedProducts[product.id]
                          ? "text-red-500 fill-current"
                          : ""
                      }
                    />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Engagement Stats */}
      <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Community Engagement
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            These products are trending based on community votes and saves
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {products.reduce((sum, product) => sum + product.upvotes, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Votes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  products.reduce((sum, product) => {
                    const discount =
                      ((product.originalPrice - product.currentPrice) /
                        product.originalPrice) *
                      100;
                    return sum + discount;
                  }, 0) / products.length,
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">Avg. Savings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {products.filter((product) => savedProducts[product.id]).length}
              </div>
              <div className="text-sm text-muted-foreground">Saved by You</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingProducts;
