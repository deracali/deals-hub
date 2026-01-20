import { Deal, DealsResponse } from "@/types/deals";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface Filters {
  search?: string;
  category?: string;
  sortBy?: string;
  priceRange?: { min?: string; max?: string };
  showSavedOnly?: boolean;
  page?: string | number;
  limit?: string | number;
}

const appendIf = (
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) => {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    params.append(key, String(value));
  }
};

export const fetchDeals = async (
  filters: Filters = {},
): Promise<DealsResponse> => {
  const params = new URLSearchParams();

  appendIf(params, "search", filters.search);
  appendIf(params, "category", filters.category);
  appendIf(params, "sortBy", filters.sortBy ?? "newest");

  // price range filters
  appendIf(params, "minPrice", filters.priceRange?.min);
  appendIf(params, "maxPrice", filters.priceRange?.max);

  appendIf(params, "showSavedOnly", filters.showSavedOnly ? "true" : undefined);
  appendIf(params, "page", filters.page ?? 1);
  appendIf(params, "limit", filters.limit ?? 20);

  // ✅ Always fetch only approved (active) deals
  params.append("status", "active");

  const url = `${baseURL}/deals/get${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to fetch deals: ${res.status} ${text}`);
  }

  const data = await res.json().catch(() => ({}));

  // Handle array or object response
  const incomingDeals: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data.deals)
      ? data.deals
      : [];

  // Normalize
  const normalized: Deal[] = incomingDeals.map((d: any) => {
    const images = Array.isArray(d.images)
      ? d.images
      : d.image
        ? [d.image]
        : [];
    return {
      ...d,
      images,
      image: images[0],
    } as Deal;
  });

  const total = typeof data.total === "number" ? data.total : normalized.length;

  return { deals: normalized, total };
};

export const fetchDealById = async (dealId: string): Promise<Deal> => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(
    `${baseURL}/deals/get-by-id/${dealId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch deal");
  const raw = await res.json();
  const d = raw?.deal ?? raw;
  const images = Array.isArray(d.images) ? d.images : d.image ? [d.image] : [];
  return { ...d, images, image: images[0] } as Deal;
};
