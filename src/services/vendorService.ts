// services/vendorService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getUserId = (user?: any): string | null => {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed._id) return parsed._id;
    }
  } catch (e) {
    // ignore parse error
  }

  // fallback to user from context
  if (user && user._id) return user._id;

  return null;
};

// 🔹 Fetch all deals by user
export const fetchDeals = async (
  user: any,
  setVendorDeals: (deals: any[]) => void,
  setError: (msg: string | null) => void,
  setLoading: (val: boolean) => void,
) => {
  setLoading(true);
  setError(null);

  const userId = getUserId(user);
  if (!userId) {
    setVendorDeals([]);
    setLoading(false);
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/deals/by-user/${userId}`);
    const data = await res.json();

    if (res.ok) {
      if (Array.isArray(data)) setVendorDeals(data);
      else if (Array.isArray(data.deals)) setVendorDeals(data.deals);
      else if (Array.isArray(data.data)) setVendorDeals(data.data);
      else setVendorDeals([]);
    } else {
      setError(data?.message || "Failed to fetch deals");
      setVendorDeals([]);
    }
  } catch (err: any) {
    setError(err?.message || String(err));
  } finally {
    setLoading(false);
  }
};

// 🔹 Add new deal
export const addDeal = async (
  user: any,
  formState: any,
  setVendorDeals: (deals: any[]) => void,
  setError: (msg: string | null) => void,
  setShowAddDeal?: (val: boolean) => void,
  resetForm?: () => void,
) => {
  setError(null);
  const userId = getUserId(user);
  if (!userId) {
    setError("Unable to find user. Make sure you are logged in.");
    return;
  }

  const payload = {
    user: userId,
    title: formState.title,
    description: formState.description,
    oldPrice: Number(formState.oldPrice || 0),
    newPrice: Number(formState.newPrice || 0),
    category: formState.category,
    url: formState.url,
    expiresAt: formState.expiryDate || undefined,
    image: formState.image || undefined,
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/deals/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      const created = data?.deal || data?.data || data;
      setVendorDeals((prev) => [created, ...prev]);
      if (setShowAddDeal) setShowAddDeal(false);
      if (resetForm) resetForm();
    } else {
      setError(data?.message || "Failed to create deal");
    }
  } catch (err: any) {
    setError(err?.message || String(err));
  }
};

// 🔹 Delete deal
export const deleteDeal = async (
  dealId: string,
  setVendorDeals: (deals: any[]) => void,
) => {
  if (!dealId) return;
  if (!confirm("Are you sure you want to delete this deal?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/deals/${dealId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setVendorDeals((prev) => prev.filter((d) => d._id !== dealId));
    } else {
      const data = await res.json();
      alert(data?.message || "Failed to delete deal");
    }
  } catch (err: any) {
    alert(err?.message || String(err));
  }
};

// 🔹 Edit deal (placeholder for now)
export const editDeal = (deal: any) => {
  console.log("edit", deal);
  alert(
    "Edit flow not implemented yet — you can add a modal or navigate to /vendor/deals/edit/:id",
  );
};
