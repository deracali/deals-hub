/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, DollarSign } from "lucide-react";

const MIN_DESCRIPTION_LENGTH = 210; // minimum characters for description

const DealDetailsForm = ({
  formData,
  setFormData,
  errors,
  setErrors,
  userProfile,
}: {
  formData: any;
  setFormData: any;
  errors: Record<string, string>;
  setErrors: (next: Record<string, string>) => void;
  userProfile?: { type?: "regular" | "vendor" };
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
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "USD",
    flag: "https://flagcdn.com/w40/us.png",
  });
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies,flags",
        );

        const data = await res.json();

        const formatted = data
          .filter((c: any) => c.currencies)
          .map((c: any) => {
            const currencyCode = Object.keys(c.currencies)[0];

            return {
              name: c.name.common,
              currency: currencyCode,
              flag: c.flags.png, // ✅ IMAGE URL
            };
          })
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };

    fetchCountries();
  }, []);

  const inputStyling =
    "bg-[#f8f9fa] rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-gray-200";
  const labelStyling = "text-sm font-medium text-gray-500 mb-1.5 block";

  // helper to update form and optionally clear a single error
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // immediate field-level validation
    validateField(field, value);
  };

  // per-field validation: sets or clears single field in errors
  const validateField = (field: string, value: any) => {
    setErrors((prev) => {
      const next = { ...prev };
      const valueStr = typeof value === "string" ? value.trim() : value;

      switch (field) {
        case "originalPrice":
          if (value === "" || value === undefined || value === null) {
            delete next.originalPrice;
          } else if (isNaN(Number(value)) || Number(value) < 0) {
            next.originalPrice = "Enter a valid price.";
          } else {
            delete next.originalPrice;
          }
          break;

        case "discountedPrice":
          if (
            value !== "" &&
            value !== undefined &&
            (isNaN(Number(value)) || Number(value) < 0)
          ) {
            next.discountedPrice = "Enter a valid discounted price.";
          } else {
            delete next.discountedPrice;
          }
          break;

        case "title":
          if (!valueStr) next.title = "Deal title is required.";
          else if (valueStr.length < 10)
            next.title = "Title must be at least 10 characters.";
          else delete next.title;
          break;

        case "category":
          if (!valueStr) next.category = "Deal category is required.";
          else delete next.category;
          break;

        case "description":
          if (!valueStr) next.description = "Deal description is required.";
          else if (valueStr.length < MIN_DESCRIPTION_LENGTH)
            next.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`;
          else delete next.description;
          break;

        case "url":
          if (!valueStr) {
            delete next.url;
          } else {
            try {
              new URL(valueStr);
              delete next.url;
            } catch {
              next.url = "Please enter a valid URL.";
            }
          }
          break;
      }

      return next;
    });
  };

  // validate all required fields (used by parent if needed)
  const validateAll = () => {
    const requiredChecks = ["title", "category", "description", "url"];
    requiredChecks.forEach((f) => validateField(f, formData[f]));
    return Object.keys(errors).length === 0;
  };

  // Add tag helper
  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;
    setFormData((prev: any) => ({
      ...prev,
      tags: [...(prev.tags || []), newTag],
    }));
    setTagInput("");
  };

  const handleAddColor = () => {
    const value = colorInput.trim();
    if (!value) return;

    setFormData((prev: any) => ({
      ...prev,
      colors: [...(prev.colors || []), value],
    }));
    setColorInput("");
  };

  const handleAddSize = () => {
    const value = sizeInput.trim();
    if (!value) return;

    setFormData((prev: any) => ({
      ...prev,
      sizes: [...(prev.sizes || []), value],
    }));
    setSizeInput("");
  };

  // run initial validation on mount if formData has values (useful for drafts)
  useEffect(() => {
    // validate minimal set to show errors when page loads with draft
    ["title", "category", "description", "url"].forEach((f) => {
      validateField(f, formData[f]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
      <div className="flex items-center space-x-2 mb-2">
        <h3 className="text-xl font-bold text-gray-400">Deal Details</h3>
      </div>

      <div className="space-y-6">
        {/* Original Price */}
        <div className="space-y-1">
          <Label htmlFor="originalPrice" className={labelStyling}>
            Original Price <span className="text-red-500">*</span>
          </Label>
          <div className="relative flex items-center">
            <Input
              id="originalPrice"
              type="number"
              placeholder="Enter amount here"
              className={`${inputStyling} pl-10 pr-24 font-semibold ${
                errors?.originalPrice
                  ? "border border-red-500"
                  : "border border-transparent"
              }`}
              value={formData?.originalPrice ?? ""}
              onChange={(e) => updateField("originalPrice", e.target.value)}
              onBlur={(e) => validateField("originalPrice", e.target.value)}
              step="0.01"
              min="0"
            />

            <div className="absolute right-3">
              {/* Selected currency (input-style) */}
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-100 bg-white shadow-sm text-xs font-semibold"
              >
                <img
                  src={selectedCurrency.flag}
                  alt={selectedCurrency.code}
                  className="h-4 w-6 rounded-sm object-cover"
                />
                <span>{selectedCurrency.code}</span>
                <ChevronDown size={14} />
              </button>

              {/* Dropdown */}
              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-64 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-lg z-50">
                  {countries.map((country, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency({
                          code: country.currency,
                          flag: country.flag,
                        });
                        updateField("currency", country.currency);
                        setCurrencyOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      <img
                        src={country.flag}
                        alt={country.name}
                        className="h-4 w-6 rounded-sm object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {country.currency}
                        </span>
                        <span className="text-xs text-gray-400">
                          {country.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {errors?.originalPrice && (
            <p className="text-sm text-red-500 mt-1">{errors.originalPrice}</p>
          )}
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label htmlFor="title" className={labelStyling}>
              Deal Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Input text field"
              className={`${inputStyling} ${errors?.title ? "border border-red-500" : "border border-transparent"}`}
              value={formData?.title ?? ""}
              onChange={(e) => updateField("title", e.target.value)}
              onBlur={(e) => validateField("title", e.target.value)}
              maxLength={100}
            />
            {errors?.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="category" className={labelStyling}>
              Deal Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="category"
              value={formData?.category ?? ""}
              onChange={(e) => updateField("category", e.target.value)}
              onBlur={() => validateField("category", formData?.category)}
              className={`${inputStyling} w-full ${errors?.category ? "border border-red-500" : "border border-transparent"}`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors?.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description" className={labelStyling}>
            Deal description <span className="text-red-500">*</span>
          </Label>
          <textarea
            id="description"
            placeholder="Enter your full description, including specs, dimension, weight etc"
            value={formData?.description ?? ""}
            onChange={(e) => {
              updateField("description", e.target.value);
            }}
            onBlur={(e) => validateField("description", e.target.value)}
            rows={6}
            className={`w-full px-4 py-3 bg-[#f8f9fa] rounded-xl resize-none placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 ${
              errors?.description
                ? "border border-red-500"
                : "border border-transparent"
            }`}
          />
          {/* live char count */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 mt-1">
              {errors?.description ? (
                <span className="text-red-500">{errors.description}</span>
              ) : (
                <span className="text-gray-400">
                  Provide full details: specs, dimensions, shipping, etc.
                </span>
              )}
            </div>
            <div
              className={`text-sm mt-1 ${formData?.description?.trim()?.length >= MIN_DESCRIPTION_LENGTH ? "text-green-600" : "text-gray-400"}`}
            >
              {formData?.description?.length ?? 0}/{MIN_DESCRIPTION_LENGTH}
            </div>
          </div>
        </div>

        {/* Brand & Platform */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userProfile?.type !== "vendor" && (
            <div className="space-y-1">
              <Label htmlFor="brand" className={labelStyling}>
                Brand
              </Label>
              <Input
                id="brand"
                type="text"
                placeholder="Enter brand name"
                className={inputStyling + " border border-transparent"}
                value={formData?.brand ?? ""}
                onChange={(e) => updateField("brand", e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="platform" className={labelStyling}>
              Platform
            </Label>
            <Input
              id="platform"
              type="text"
              placeholder="Enter platform name"
              className={inputStyling + " border border-transparent"}
              value={formData?.platform ?? ""}
              onChange={(e) => updateField("platform", e.target.value)}
            />
          </div>
        </div>

        {/* Discount & Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label htmlFor="discountedPrice" className={labelStyling}>
              Discounted Price
            </Label>
            <Input
              id="discountedPrice"
              type="number"
              placeholder="0.00"
              className={`${inputStyling} border border-transparent ${errors?.discountedPrice ? "border-red-500" : ""}`}
              value={formData?.discountedPrice ?? ""}
              onChange={(e) => updateField("discountedPrice", e.target.value)}
              onBlur={(e) => validateField("discountedPrice", e.target.value)}
              step="0.01"
              min="0"
            />
            {errors?.discountedPrice && (
              <p className="text-sm text-red-500 mt-1">
                {errors.discountedPrice}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="availability" className={labelStyling}>
              Availability
            </Label>
            <select
              id="availability"
              value={formData?.availability ?? "In Stock"}
              onChange={(e) => updateField("availability", e.target.value)}
              className={`${inputStyling} w-full`}
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Colors & Sizes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          {/* Colors */}
          <div className="space-y-2">
            <Label className={labelStyling}>Available Colors</Label>

            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(formData?.colors) &&
                formData.colors.map((color: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.colors.filter(
                          (_: any, i: number) => i !== index,
                        );
                        setFormData({ ...formData, colors: next });
                      }}
                      className="text-xs hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add color (e.g. Black)"
                className={`${inputStyling} flex-1 border border-transparent`}
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColor();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddColor}
                className="h-12 bg-[#0383F2] px-6 rounded-xl"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Label className={labelStyling}>Available Sizes</Label>

            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(formData?.sizes) &&
                formData.sizes.map((size: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm"
                  >
                    <span>{size}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.sizes.filter(
                          (_: any, i: number) => i !== index,
                        );
                        setFormData({ ...formData, sizes: next });
                      }}
                      className="text-xs hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add size (e.g. M, 42)"
                className={`${inputStyling} flex-1 border border-transparent`}
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSize();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddSize}
                className="h-12 bg-[#0383F2] px-6 rounded-xl"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2 pt-4">
          <Label htmlFor="tags" className={labelStyling}>
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.isArray(formData?.tags) &&
              formData.tags.map((tag: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = formData.tags.filter(
                        (_: any, i: number) => i !== index,
                      );
                      setFormData({ ...formData, tags: newTags });
                    }}
                    className="text-xs hover:text-red-500 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="tags"
              type="text"
              placeholder="Add a tag"
              className={`${inputStyling} flex-1 border border-transparent`}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="h-12 px-6 rounded-xl bg-[#0383F2] hover:bg-black text-white"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Expiration & Free Shipping */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="space-y-1">
            <Label htmlFor="expirationDate" className={labelStyling}>
              Expiration Date
            </Label>
            <Input
              id="expirationDate"
              type="date"
              className={inputStyling + " border border-transparent"}
              value={formData?.expirationDate ?? ""}
              onChange={(e) => updateField("expirationDate", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3 h-12 pt-6">
            <input
              id="freeShipping"
              type="checkbox"
              checked={formData?.freeShipping || false}
              onChange={(e) => updateField("freeShipping", e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label
              htmlFor="freeShipping"
              className="text-sm font-semibold text-gray-600 cursor-pointer"
            >
              Free Shipping
            </Label>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="space-y-4 mt-12 pt-8 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="ListChecks" size={20} className="text-gray-400" />
            <h3 className="text-lg font-bold text-gray-400">
              Product Specifications
            </h3>
          </div>

          {Object.entries(formData?.specifications || {}).map(
            ([key, value]: [string, any], index: number) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Specification name (e.g. Color)"
                  className={inputStyling + " border border-transparent"}
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
                  className={inputStyling + " border border-transparent"}
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
            className="mt-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-400 text-sm font-bold rounded-xl transition-colors"
          >
            + Add Specification
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealDetailsForm;
