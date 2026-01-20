/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, Filter, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

const DealsFilterToolbar = ({
  onFiltersChange,
  onToggleSidebar,
}: {
  onFiltersChange: (filters: any) => void;
  onToggleSidebar: () => void;
}) => {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sortBy: "newest",
    priceRange: { min: "", max: "" },
    discountRange: { min: "", max: "" }, // <--- add this
    showSavedOnly: false,
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing & Fashion" },
    { value: "home", label: "Home & Garden" },
    { value: "sports", label: "Sports & Outdoors" },
    { value: "books", label: "Books & Media" },
    { value: "beauty", label: "Beauty & Personal Care" },
    { value: "automotive", label: "Automotive" },
    { value: "food", label: "Food & Beverages" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "discount-high", label: "Highest Discount" },
    { value: "discount-low", label: "Lowest Discount" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popularity", label: "Most Popular" },
  ];

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handlePriceRangeChange = (type: "min" | "max", value: any) => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDiscountRangeChange = (type: "min" | "max", value: any) => {
    const newDiscountRange = { ...filters.discountRange, [type]: value };
    const newFilters = { ...filters, discountRange: newDiscountRange };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "all",
      sortBy: "newest",
      priceRange: { min: "", max: "" },
      showSavedOnly: false,
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      (filters.category && filters.category !== "all") ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.showSavedOnly
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h3 className="text-lg font-semibold text-card-foreground">Filters</h3>
        <Button variant="outline" size="sm" onClick={onToggleSidebar}>
          <Filter className="mr-2" size={16} />
          Advanced Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <Input
            type="search"
            placeholder="Search deals, stores, brands..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Select */}
        <div>
          <Select
            value={filters.category}
            onValueChange={(value: string) =>
              handleFilterChange("category", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Select */}
        <div>
          <Select
            value={filters.sortBy}
            onValueChange={(value: string) =>
              handleFilterChange("sortBy", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Min $"
            value={filters.priceRange.min}
            onChange={(e) => handlePriceRangeChange("min", e.target.value)}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max $"
            value={filters.priceRange.max}
            onChange={(e) => handlePriceRangeChange("max", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant={filters.showSavedOnly ? "default" : "outline"}
            size="sm"
            onClick={() =>
              handleFilterChange("showSavedOnly", !filters.showSavedOnly)
            }
            className="whitespace-nowrap"
          >
            <Bookmark className="mr-2" size={16} />
            Saved Only
          </Button>

          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <X className="mr-2" size={16} />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">Quick filters:</span>

        <button
          onClick={() => handleFilterChange("category", "electronics")}
          className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Electronics
        </button>

        <button
          onClick={() => handleFilterChange("category", "clothing")}
          className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Fashion
        </button>

        <button
          onClick={() => {
            handlePriceRangeChange("max", "50");
          }}
          className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Under $50
        </button>

        <button
          onClick={() => handleFilterChange("sortBy", "discount-high")}
          className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          Best Discounts
        </button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Showing deals based on your filters
        </span>

        <div className="hidden lg:flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onToggleSidebar}>
            <SlidersHorizontal className="mr-2" size={16} />
            Advanced Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DealsFilterToolbar;
