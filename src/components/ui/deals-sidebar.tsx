"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Filters {
  search: string;
  category: string;
  priceRange: { min: string; max: string };
  discountRange: string;
  store: string;
  sortBy: string;
  dealType: string[];
  verified: boolean;
  freeShipping: boolean;
}

interface DealFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange?: (filters: Filters) => void;
}

const DealFilterSidebar = ({
  isOpen,
  onClose,
  onFiltersChange,
}: DealFilterSidebarProps) => {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    priceRange: { min: "", max: "" },
    discountRange: "",
    store: "",
    sortBy: "newest",
    dealType: [],
    verified: false,
    freeShipping: false,
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

  const discountRanges = [
    { value: "all", label: "Any Discount" },
    { value: "10-25", label: "10% - 25% Off" },
    { value: "25-50", label: "25% - 50% Off" },
    { value: "50-75", label: "50% - 75% Off" },
    { value: "75+", label: "75%+ Off" },
  ];

  const stores = [
    { value: "all", label: "All Stores" },
    { value: "amazon", label: "Amazon" },
    { value: "walmart", label: "Walmart" },
    { value: "target", label: "Target" },
    { value: "bestbuy", label: "Best Buy" },
    { value: "costco", label: "Costco" },
    { value: "other", label: "Other Stores" },
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

  const dealTypes = [
    { id: "coupon", label: "Coupon Code" },
    { id: "sale", label: "Sale Price" },
    { id: "cashback", label: "Cashback" },
    { id: "freebie", label: "Freebie" },
    { id: "bogo", label: "Buy One Get One" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (name: keyof Filters, value: any) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handlePriceRangeChange = (type: "min" | "max", value: string) => {
    const newPriceRange = { ...filters.priceRange, [type]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDealTypeChange = (dealType: string, checked: boolean) => {
    const newDealTypes = checked
      ? [...filters.dealType, dealType]
      : filters.dealType.filter((type) => type !== dealType);

    const newFilters = { ...filters, dealType: newDealTypes };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: Filters = {
      search: "",
      category: "",
      priceRange: { min: "", max: "" },
      discountRange: "",
      store: "",
      sortBy: "newest",
      dealType: [],
      verified: false,
      freeShipping: false,
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.category ||
      filters.priceRange.min ||
      filters.priceRange.max ||
      filters.discountRange ||
      filters.store ||
      filters.dealType.length > 0 ||
      filters.verified ||
      filters.freeShipping
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">
            Filters
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Deals</Label>
            <Input
              id="search"
              type="search"
              placeholder="Search by title, store, or brand..."
              value={filters.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleInputChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sort option" />
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

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) =>
                handleInputChange("category", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
              />
            </div>
          </div>

          {/* Discount Range */}
          <div className="space-y-2">
            <Label>Discount Range</Label>
            <Select
              value={filters.discountRange || "all"}
              onValueChange={(value) =>
                handleInputChange("discountRange", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discount" />
              </SelectTrigger>
              <SelectContent>
                {discountRanges.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store */}
          <div className="space-y-2">
            <Label>Store</Label>
            <Select
              value={filters.store || "all"}
              onValueChange={(value) =>
                handleInputChange("store", value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deal Type */}
          <div className="space-y-3">
            <Label>Deal Type</Label>
            <div className="space-y-2">
              {dealTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={filters.dealType.includes(type.id)}
                    onCheckedChange={(checked) =>
                      handleDealTypeChange(type.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={type.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-3">
            <Label>Additional Filters</Label>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(checked) =>
                      handleInputChange("verified", checked as boolean)
                    }
                  />
                  <label
                    htmlFor="verified"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Verified Deals Only
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Show only deals verified by our community
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freeShipping"
                    checked={filters.freeShipping}
                    onCheckedChange={(checked) =>
                      handleInputChange("freeShipping", checked as boolean)
                    }
                  />
                  <label
                    htmlFor="freeShipping"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Free Shipping
                  </label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Show deals with free shipping
                </p>
              </div>
            </div>
          </div>

          {/* Apply Filters Button (Mobile) */}
          <div className="lg:hidden pt-4 border-t border-border">
            <Button className="w-full" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealFilterSidebar;
