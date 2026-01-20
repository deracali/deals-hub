import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { categories } from "@/constants/products";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ApiDeal = {
  _id?: string;
  title?: string;
  name?: string;
  productName?: string;
  brand?: string;
  category?: string;
  tags?: string[];
  // ...other fields
};

type Suggestion = {
  term: string;
  type: "product" | "category" | "deal" | "other";
  category?: string;
};

const SearchSection = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [trendingSearches, setTrendingSearches] = useState<
    { term: string; count: number }[]
  >(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("trendingSearches");
      return stored ? JSON.parse(stored).slice(0, 10) : [];
    }
    return [];
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const staticSuggestions: Suggestion[] = [
    { term: "iPhone 15 Pro Max", type: "product", category: "electronics" },
    { term: "iPhone 15 cases", type: "product", category: "electronics" },
    { term: "iPhone deals", type: "category", category: "electronics" },
    { term: "Samsung Galaxy", type: "product", category: "electronics" },
    { term: "MacBook Pro", type: "product", category: "electronics" },
    { term: "AirPods", type: "product", category: "electronics" },
    { term: "Gaming headset", type: "product", category: "electronics" },
    { term: "Wireless charger", type: "product", category: "electronics" },
  ];

  useEffect(() => {
    const controller = new AbortController();
    const fetchUrl = `${baseURL}/deals/get`;

    (async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(fetchUrl, {
          method: "GET",
          signal: controller.signal,
          // mode: 'cors' // optional; server also must allow CORS
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("[SearchSection] raw deals response:", data);

        // Accept either: []  OR  { deals: [] }
        const dealsArray: ApiDeal[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any).deals)
            ? (data as any).deals
            : [];

        if (dealsArray.length > 0) {
          const mapped = dealsArray
            .map((d) => {
              // prefer title -> brand -> first tag -> name
              const term =
                (d.title && String(d.title).trim()) ||
                (d.brand && String(d.brand).trim()) ||
                (d.name && String(d.name).trim()) ||
                (d.productName && String(d.productName).trim()) ||
                (d.tags && d.tags[0] && String(d.tags[0]).trim()) ||
                "";
              if (!term) return null;
              return {
                term,
                type: "deal",
                category: d.category || (d.tags && d.tags[0]) || "other",
              } as Suggestion;
            })
            .filter(Boolean)
            // dedupe by lowercased term
            .reduce<Suggestion[]>((acc, cur) => {
              if (
                !acc.find(
                  (a) => a.term.toLowerCase() === cur.term.toLowerCase(),
                )
              ) {
                acc.push(cur);
              }
              return acc;
            }, [])
            .slice(0, 200);

          setSuggestions([...mapped, ...staticSuggestions].slice(0, 200));
        } else {
          setSuggestions(staticSuggestions);
        }
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.error("Failed to fetch deals for suggestions:", err);
          setSuggestions(staticSuggestions);
        }
      } finally {
        setLoadingSuggestions(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const filteredSuggestions =
    searchQuery?.length > 0
      ? suggestions
          ?.filter((s) =>
            s.term.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          ?.slice(0, 6)
      : [];

  const updateTrendingSearches = (term: string) => {
    setTrendingSearches((prev) => {
      const existing = prev.find(
        (item) => item.term.toLowerCase() === term.toLowerCase(),
      );
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.term.toLowerCase() === term.toLowerCase()
            ? { ...item, count: item.count + 1 }
            : item,
        );
      } else {
        updated = [{ term, count: 1 }, ...prev];
      }
      updated = updated.sort((a, b) => b.count - a.count).slice(0, 10);
      localStorage.setItem("trendingSearches", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = (query = searchQuery) => {
    if (query?.trim()) {
      onSearch?.(query.trim());
      updateTrendingSearches(query.trim());
      router.push(`/deals?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestion >= 0) {
        handleSearch(filteredSuggestions[selectedSuggestion].term);
        setSearchQuery(filteredSuggestions[selectedSuggestion].term);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const handleSuggestionClick = (s: Suggestion) => {
    setSearchQuery(s.term);
    handleSearch(s.term);
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="py-12 bg-gradient-to-b from-muted/20 to-transparent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Find Your Perfect Deal
            </h2>
            <p className="text-muted-foreground">
              Search through thousands of community-verified deals and discounts
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8" ref={searchRef}>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products, brands, or categories..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                className="w-full pl-12 pr-24 py-4 text-lg bg-card border-2 border-border focus:border-primary rounded-2xl shadow-lg transition-all duration-300"
              />
              <Icon
                name="Search"
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Button
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 bg-[#0d9cff] hover:bg-[#0b8ee6] text-white"
              >
                <Icon name="Search" size={16} className="mr-2" />
              </Button>
            </div>

            {/* Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-dropdown z-50 max-h-60 overflow-y-auto">
                {loadingSuggestions && (
                  <div className="p-3 text-sm text-muted-foreground">
                    Loading...
                  </div>
                )}
                {filteredSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${selectedSuggestion === idx ? "bg-muted" : ""}`}
                  >
                    <Icon
                      name={s.type === "category" ? "Folder" : "Search"}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <div className="flex-1">
                      <span className="text-popover-foreground">{s.term}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {s.category ? `in ${s.category}` : ""}
                      </span>
                    </div>
                    <Icon
                      name="ArrowUpRight"
                      size={14}
                      className="text-muted-foreground"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trending & Categories (unchanged) */}
          {trendingSearches.length > 0 && (
            <div className="text-center mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Trending Searches
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {trendingSearches.slice(0, 10).map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(trend.term)}
                    className="flex items-center space-x-2 px-4 py-2 bg-card hover:bg-muted border border-border rounded-full text-sm transition-colors group"
                  >
                    <Icon
                      name="TrendingUp"
                      size={14}
                      className="text-muted-foreground group-hover:text-primary"
                    />
                    <span className="text-foreground">{trend.term}</span>
                    <span className="text-xs text-muted-foreground">
                      ({trend.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
