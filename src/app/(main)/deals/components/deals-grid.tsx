import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import DealCard from "./deals-card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DealsGrid = ({
  deals,
  filters,
  loading = false,
}: {
  deals: any[];
  filters: any;
  loading?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const dealsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
    // optional: scroll to top when filters change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [
    filters.search,
    filters.category,
    filters.priceRange,
    filters.sortBy,
    filters.showSavedOnly,
  ]);

  // Filter and sort deals based on filters
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    // Search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((deal) => {
        const title = deal?.title?.toLowerCase() ?? "";
        const description = deal?.description?.toLowerCase() ?? "";
        const brand = deal?.brand?.toLowerCase() ?? "";
        const platform = deal?.platform?.toLowerCase() ?? "";
        return (
          title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          brand.includes(searchTerm) ||
          platform.includes(searchTerm)
        );
      });
    }

    // Discount filter (calculate dynamically)
    if (filters?.discountRange?.min || filters?.discountRange?.max) {
      filtered = filtered.filter((deal) => {
        if (!deal.originalPrice || !deal.discountedPrice) return false;
        const discount = Math.round(
          ((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) *
            100,
        );

        if (
          filters.discountRange.min &&
          discount < Number(filters.discountRange.min)
        )
          return false;
        if (
          filters.discountRange.max &&
          discount > Number(filters.discountRange.max)
        )
          return false;

        return true;
      });
    }

    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((deal) => deal.category === filters.category);
    }

    if (filters?.priceRange?.min) {
      filtered = filtered.filter(
        (deal) => deal.discountedPrice >= Number(filters.priceRange.min),
      );
    }
    if (filters?.priceRange?.max) {
      filtered = filtered.filter(
        (deal) => deal.discountedPrice <= Number(filters.priceRange.max),
      );
    }

    if (filters?.showSavedOnly) {
      filtered = filtered.filter((deal) => deal.isSaved);
    }

    // Sort using the schema fields
    switch (filters?.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.discountedPrice - a.discountedPrice);
        break;
      case "discount-high":
        filtered.sort(
          (a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0),
        );
        break;
      case "discount-low":
        filtered.sort(
          (a, b) => (a.discountPercentage || 0) - (b.discountPercentage || 0),
        );
        break;
      case "popularity":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return filtered;
  }, [deals, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDeals?.length / dealsPerPage);
  const startIndex = (currentPage - 1) * dealsPerPage;
  const endIndex = startIndex + dealsPerPage;
  const currentDeals = filteredDeals?.slice(startIndex, endIndex);

  const handleSaveDeal = (dealId: number, isSaved: boolean) => {
    console.log(`Deal ${dealId} ${isSaved ? "saved" : "unsaved"}`);
  };

  const handleVoteDeal = (dealId: number, voteType: "up" | "down" | null) => {
    console.log(`Deal ${dealId} voted: ${voteType}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 })?.map((_, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="h-48 bg-muted skeleton-loading" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted skeleton-loading rounded" />
              <div className="h-4 bg-muted skeleton-loading rounded w-3/4" />
              <div className="h-6 bg-muted skeleton-loading rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-8 bg-muted skeleton-loading rounded w-20" />
                <div className="h-8 bg-muted skeleton-loading rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredDeals?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          No deals found
        </h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or search terms to find more deals.
        </p>
        <Button variant="outline" onClick={() => window.location?.reload()}>
          Reset Filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Results Summary */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredDeals?.length)}{" "}
          of {filteredDeals?.length} deals
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Page</span>
          <span className="text-sm font-medium text-card-foreground">
            {currentPage} of {totalPages}
          </span>
        </div>
      </div>
      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentDeals?.map((deal) => (
          <DealCard
            key={deal?._id}
            deal={deal}
            onSave={handleSaveDeal}
            onVote={handleVoteDeal}
          />
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft />
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10 h-10"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DealsGrid;
