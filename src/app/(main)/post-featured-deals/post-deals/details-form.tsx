/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DealDetailsForm = ({
  formData,
  setFormData,
  errors,
}: {
  formData: any;
  setFormData: any;
  errors: any;
}) => {
  const categories = [
    { value: "electronics", label: "Electronics & Tech" },
    { value: "clothing", label: "Clothing & Fashion" },
    { value: "home", label: "Home & Garden" },
    { value: "sports", label: "Sports & Outdoors" },
    { value: "books", label: "Books & Media" },
    { value: "beauty", label: "Beauty & Personal Care" },
    { value: "automotive", label: "Automotive" },
    { value: "food", label: "Food & Beverages" },
    { value: "toys", label: "Toys & Games" },
    { value: "health", label: "Health & Wellness" },
    { value: "travel", label: "Travel & Experiences" },
    { value: "services", label: "Services & Subscriptions" },
  ];

  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;
    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag],
    }));
    setTagInput("");
  };

  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };

    // Automatically calculate discountPercentage if prices change
    if (
      (field === "originalPrice" || field === "discountedPrice") &&
      updatedData.originalPrice &&
      updatedData.discountedPrice
    ) {
      updatedData.discountPercentage = Math.round(
        ((Number(updatedData.originalPrice) -
          Number(updatedData.discountedPrice)) /
          Number(updatedData.originalPrice)) *
          100,
      );
    }

    setFormData(updatedData);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="FileText" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-card-foreground">
          Deal Details
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Deal Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter a catchy title for your deal"
              value={formData?.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              maxLength={100}
            />
            {errors?.title && (
              <p className="text-sm text-error mt-1">{errors.title}</p>
            )}
          </div>

          {/* Deal Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deal Description</Label>
            <textarea
              id="description"
              placeholder="Describe the deal in detail..."
              value={formData?.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            {errors?.description && (
              <p className="text-sm text-error mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData?.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.category && (
              <p className="text-sm text-error mt-1">{errors.category}</p>
            )}
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              type="text"
              placeholder="Enter brand name"
              value={formData?.brand}
              onChange={(e) => handleInputChange("brand", e.target.value)}
            />
            {errors?.brand && (
              <p className="text-sm text-error mt-1">{errors.brand}</p>
            )}
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              type="text"
              placeholder="Enter platform name"
              value={formData?.platform}
              onChange={(e) => handleInputChange("platform", e.target.value)}
            />
            {errors?.platform && (
              <p className="text-sm text-error mt-1">{errors.platform}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Original Price */}
          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price</Label>
            <Input
              id="originalPrice"
              type="number"
              placeholder="0.00"
              value={formData?.originalPrice}
              onChange={(e) =>
                handleInputChange("originalPrice", e.target.value)
              }
              step="0.01"
              min="0"
            />
          </div>

          {/* Discounted Price */}
          <div className="space-y-2">
            <Label htmlFor="discountedPrice">Discounted Price</Label>
            <Input
              id="discountedPrice"
              type="number"
              placeholder="0.00"
              value={formData?.discountedPrice}
              onChange={(e) =>
                handleInputChange("discountedPrice", e.target.value)
              }
              step="0.01"
              min="0"
            />
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select
              value={formData?.availability}
              onValueChange={(value) =>
                handleInputChange("availability", value)
              }
            >
              <SelectTrigger id="availability">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>

            {/* Render tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(formData?.tags) &&
                formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-muted text-muted-foreground px-3 py-1 rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags.filter(
                          (_, i) => i !== index,
                        );
                        setFormData({ ...formData, tags: newTags });
                      }}
                      className="text-xs hover:text-error focus:outline-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            {/* Input + Add button */}
            <div className="flex items-center gap-2">
              <Input
                id="tags"
                type="text"
                placeholder="Add a tag"
                className="flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                Add
              </Button>
            </div>

            {errors?.tags && (
              <p className="text-sm text-error mt-1">{errors.tags}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Expiration Date</Label>
            <Input
              id="expirationDate"
              type="date"
              value={formData?.expirationDate}
              onChange={(e) =>
                handleInputChange("expirationDate", e.target.value)
              }
            />
          </div>

          {/* Free Shipping */}
          <div className="flex items-center space-x-2">
            <input
              id="freeShipping"
              type="checkbox"
              checked={formData?.freeShipping || false}
              onChange={(e) =>
                handleInputChange("freeShipping", e.target.checked)
              }
              className="w-4 h-4"
            />
            <Label htmlFor="freeShipping">Free Shipping</Label>
          </div>
        </div>
      </div>
      {/* Product Specifications */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="ListChecks" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Product Specifications
          </h3>
        </div>

        {/* Dynamically render specification key-value pairs */}
        {Object.entries(formData?.specifications || {}).map(
          ([key, value]: [string, any], index: number) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Specification name (e.g. Color)"
                value={key}
                onChange={(e) => {
                  const newSpecs = new Map(
                    Object.entries(formData.specifications || {}),
                  );
                  const val = newSpecs.get(key);
                  newSpecs.delete(key);
                  newSpecs.set(e.target.value, val);
                  setFormData({
                    ...formData,
                    specifications: Object.fromEntries(newSpecs),
                  });
                }}
              />
              <Input
                placeholder="Value (e.g. Black)"
                value={value}
                onChange={(e) => {
                  const newSpecs = { ...(formData.specifications || {}) };
                  newSpecs[key] = e.target.value;
                  setFormData({ ...formData, specifications: newSpecs });
                }}
              />
            </div>
          ),
        )}

        <button
          type="button"
          onClick={() => {
            const newSpecs = { ...(formData.specifications || {}) };
            newSpecs[`spec_${Object.keys(newSpecs).length + 1}`] = "";
            setFormData({ ...formData, specifications: newSpecs });
          }}
          className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md"
        >
          + Add Specification
        </button>
      </div>
    </div>
  );
};

export default DealDetailsForm;
