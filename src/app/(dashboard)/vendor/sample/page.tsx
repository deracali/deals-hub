"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadFile = {
  uri: string;
  type: string;
  name: string;
} | null;

const VendorRegistrationModal: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const paystackRef = useRef<any>(null);
  const [vendorPlans, setVendorPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    cacNumber: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessWebsite: "",
    businessDescription: "",
    cacDocument: null as UploadFile,
    businessLogo: null as UploadFile,
    businessBanner: null as UploadFile,
    identityImg: null as UploadFile,
    passportPhoto: null as UploadFile,
    categories: [] as string[],
    selectedPlan: "basic",
    paymentMethod: "paystack",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load Paystack library dynamically on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    import("@paystack/inline-js")
      .then((mod) => {
        if (!mounted) return;
        paystackRef.current = mod.default; // PaystackPop class
        setPaystackReady(true);
      })
      .catch((err) => {
        console.error("Failed to load Paystack inline-js:", err);
        setPaystackReady(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Limited Liability Company (LLC)",
    "Public Limited Company (PLC)",
    "Non-Governmental Organization (NGO)",
    "Other",
  ];

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor-plans/get`,
        ); // 👈 your backend route
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setVendorPlans(data); // ensure backend returns an array of {id, name, price, duration, features}
      } catch (err) {
        console.error("Error loading vendor plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const selectedPlan = vendorPlans.find((p) => p._id === formData.selectedPlan);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.businessName.trim())
        newErrors.businessName = "Business name is required";
      if (!formData.businessType)
        newErrors.businessType = "Business type is required";
      if (!formData.businessEmail.trim())
        newErrors.businessEmail = "Business email is required";
      if (!formData.businessPhone.trim())
        newErrors.businessPhone = "Business phone is required";
      if (!formData.businessAddress.trim())
        newErrors.businessAddress = "Business address is required";
      if (!formData.businessCity.trim())
        newErrors.businessCity = "City is required";
      if (!formData.businessState)
        newErrors.businessState = "State is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((p) => p + 1);
  };

  const handlePrevious = () => setCurrentStep((p) => p - 1);

  // Helper to ensure Paystack Pop is loaded (in case not loaded in useEffect yet)
  const ensurePaystack = async () => {
    if (paystackRef.current) return paystackRef.current;
    if (typeof window === "undefined")
      throw new Error("Paystack requires browser environment");
    const mod = await import("@paystack/inline-js");
    paystackRef.current = mod.default;
    setPaystackReady(true);
    return paystackRef.current;
  };

  // Main submit: opens Paystack and registers vendor on successful payment
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // prepare form data for vendor creation (but don't send yet)
      const vendorForm = new FormData();
      vendorForm.append("name", formData.businessName);
      vendorForm.append("description", formData.businessDescription);
      vendorForm.append(
        "location",
        `${formData.businessCity}, ${formData.businessState}`,
      );
      vendorForm.append("country", "Nigeria");
      vendorForm.append("type", "local");
      vendorForm.append("cacNumber", formData.cacNumber || "");
      vendorForm.append("businessWebsite", formData.businessWebsite || "");
      vendorForm.append("businessPhone", formData.businessPhone || "");
      vendorForm.append("businessEmail", formData.businessEmail || "");
      vendorForm.append("businessAddress", formData.businessAddress || "");
      formData.categories.forEach((c) => vendorForm.append("categories[]", c));
      if (formData.cacDocument)
        vendorForm.append("cacDocument", formData.cacDocument);
      if (formData.businessLogo)
        vendorForm.append("businessLogo", formData.businessLogo);
      if (formData.businessBanner)
        vendorForm.append("businessBanner", formData.businessBanner);
      if (formData.identityImg)
        vendorForm.append("identityImg", formData.identityImg);
      if (formData.passportPhoto)
        vendorForm.append("passportPhoto", formData.passportPhoto);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) throw new Error("User not found in localStorage");
      const user = JSON.parse(storedUser);
      const userId = user?.id;
      if (!userId) throw new Error("Invalid user data");
      vendorForm.append("postedBy", userId);

      // amount (kobo)
      const amountKobo = (selectedPlan?.price ?? 5000) * 100;

      // dynamic import of Paystack if necessary
      const PaystackClass = await ensurePaystack();

      // instantiate and open transaction
      const popup = new PaystackClass();

      popup.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: formData.businessEmail || user.email,
        amount: amountKobo,
        currency: "NGN",
        // optional metadata
        metadata: {
          custom_fields: [
            {
              display_name: "Business Name",
              variable_name: "business_name",
              value: formData.businessName,
            },
          ],
        },

        onSuccess: async (transaction: any) => {
          // transaction contains reference and more. Important: VERIFY on backend is recommended.
          console.log("Paystack onSuccess:", transaction);

          try {
            // Optional: verify transaction on backend using transaction.reference
            // await fetch(`/api/paystack/verify/${transaction.reference}`)

            // Send vendor creation request now that payment succeeded
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/create`,
              {
                method: "POST",
                body: vendorForm,
              },
            );

            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(
                err.message || "Failed to register vendor after payment",
              );
            }

            const created = await res.json();
            console.log("Vendor created:", created);

            // update user type/brand
            const upd = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update-user-type/${userId}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand: formData.businessName }),
              },
            );
            if (upd.ok) {
              const updatedUser = await upd.json().catch(() => null);
              if (updatedUser?.user)
                localStorage.setItem("user", JSON.stringify(updatedUser.user));
            }

            alert("🎉 Payment successful and vendor created!");
            // reset form
            setFormData({
              businessName: "",
              businessType: "",
              cacNumber: "",
              businessEmail: "",
              businessPhone: "",
              businessAddress: "",
              businessCity: "",
              businessState: "",
              businessWebsite: "",
              businessDescription: "",
              cacDocument: null,
              businessLogo: null,
              businessBanner: null,
              identityImg: null,
              passportPhoto: null,
              categories: [],
              selectedPlan: "basic",
              paymentMethod: "paystack",
            });
            setCurrentStep(1);
          } catch (err: any) {
            console.error("Error creating vendor after payment:", err);
            alert(
              "Payment succeeded but vendor creation failed. Contact support.",
            );
          } finally {
            setIsSubmitting(false);
          }
        },

        onCancel: () => {
          console.log("Paystack payment cancelled by user");
          alert("Payment cancelled");
          setIsSubmitting(false);
        },
      });
    } catch (err: any) {
      console.error("Error starting payment flow:", err);
      setErrors({ submit: err.message || "Failed to start payment" });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg max-w-4xl w-full mx-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Become a Vendor
            </h2>
            <p className="text-gray-600">
              Join Nigeria&lsquo;s leading deals platform
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: "Business Info" },
              { step: 2, title: "Documents" },
              { step: 3, title: "Payment Plan" },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= item.step
                      ? "bg-primary text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {item.step}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    currentStep >= item.step
                      ? "text-primary font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {item.title}
                </span>
                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      currentStep > item.step ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {errors.submit}
            </div>
          )}

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <div className="relative">
                    <Building
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.businessName
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Your Business Name"
                    />
                  </div>
                  {errors.businessName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.businessType ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Categories (Select up to 3)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      "Fashion",
                      "Traditional Wear",
                      "Art",
                      "Food",
                      "Electronics",
                      "Beauty",
                    ].map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center space-x-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (formData.categories.length < 3) {
                                setFormData((prev) => ({
                                  ...prev,
                                  categories: [...prev.categories, cat],
                                }));
                              } else {
                                alert("You can only select up to 3 categories");
                              }
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                categories: prev.categories.filter(
                                  (c) => c !== cat,
                                ),
                              }));
                            }
                          }}
                          className="accent-green-500"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CAC Registration Number
                  </label>
                  <input
                    type="text"
                    name="cacNumber"
                    value={formData.cacNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="RC1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Website
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="url"
                      name="businessWebsite"
                      value={formData.businessWebsite}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Email *
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.businessEmail
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="business@example.com"
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.businessPhone
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <textarea
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.businessAddress
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your business address"
                  />
                </div>
                {errors.businessAddress && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.businessAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="businessCity"
                    value={formData.businessCity}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.businessCity ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Lagos"
                  />
                  {errors.businessCity && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessCity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="businessState"
                    value={formData.businessState}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.businessState
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.businessState && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.businessState}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about your business..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business Documents & Branding
              </h3>

              {/* CAC Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAC Certificate (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  {formData.cacDocument ? (
                    <p className="text-sm text-green-600 font-medium">
                      {typeof formData.cacDocument === "string"
                        ? formData.cacDocument
                        : formData.cacDocument.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Upload your CAC certificate
                    </p>
                  )}
                  <input
                    type="file"
                    name="cacDocument"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cacDocument: e.target.files ? e.target.files[0] : null,
                      }))
                    }
                    className="mt-2 text-sm"
                  />
                </div>
              </div>

              {/* Business Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  {formData.businessLogo ? (
                    <img
                      src={URL.createObjectURL(formData.businessLogo as File)}
                      alt="Business Logo Preview"
                      className="mx-auto h-20 object-contain mb-2"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Upload your business logo (PNG, JPG)
                    </p>
                  )}
                  <input
                    type="file"
                    name="businessLogo"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessLogo: e.target.files ? e.target.files[0] : null,
                      }))
                    }
                    className="mt-2 text-sm"
                  />
                </div>
              </div>

              {/* ✅ Business Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Banner (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  {formData.businessBanner ? (
                    <img
                      src={URL.createObjectURL(formData.businessBanner as File)}
                      alt="Business Banner Preview"
                      className="mx-auto h-32 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Upload a banner for your business page (PNG, JPG)
                    </p>
                  )}
                  <input
                    type="file"
                    name="businessBanner"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        businessBanner: e.target.files
                          ? e.target.files[0]
                          : null,
                      }))
                    }
                    className="mt-2 text-sm"
                  />
                </div>
              </div>

              {/* Identity Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Image (NIN Slip or National ID)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  {formData.identityImg ? (
                    <img
                      src={URL.createObjectURL(formData.identityImg as File)}
                      alt="Identity Preview"
                      className="mx-auto h-24 object-contain mb-2"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Upload identity image (PNG, JPG)
                    </p>
                  )}
                  <input
                    type="file"
                    name="identityImg"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        identityImg: e.target.files ? e.target.files[0] : null,
                      }))
                    }
                    className="mt-2 text-sm"
                  />
                </div>
              </div>

              {/* Passport Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  {formData.passportPhoto ? (
                    <img
                      src={URL.createObjectURL(formData.passportPhoto as File)}
                      alt="Passport Preview"
                      className="mx-auto h-24 object-cover rounded-md mb-2"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">
                      Upload passport photo (PNG, JPG)
                    </p>
                  )}
                  <input
                    type="file"
                    name="passportPhoto"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passportPhoto: e.target.files
                          ? e.target.files[0]
                          : null,
                      }))
                    }
                    className="mt-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment Plan */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose Your Plan
              </h3>

              {loadingPlans ? (
                <p>Loading plans...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {vendorPlans.map((plan) => (
                    <div
                      key={plan._id}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        formData.selectedPlan === plan._id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedPlan: plan._id,
                        }))
                      }
                    >
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {plan.name}
                        </h4>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">
                            ₦{plan.price.toLocaleString()}
                          </span>
                          <span className="text-gray-600">
                            /{plan.duration}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {plan.features?.map(
                          (feature: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <span className="text-green-500 mr-2">✓</span>
                              {feature}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-medium">{selectedPlan?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      1 {selectedPlan?.duration}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>₦{selectedPlan?.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">Step {currentStep} of 3</div>

          <div className="flex space-x-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}

            {currentStep < 3 ? (
              <Button onClick={handleNext} className="px-6 py-2">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !paystackReady}
                className="bg-green-600 text-white"
              >
                {isSubmitting
                  ? "Processing..."
                  : `Pay & Register ₦${(selectedPlan?.price ?? 0).toLocaleString()}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationModal;
