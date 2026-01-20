export interface Product {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  upvotes: number;
  isSaved: boolean;
  vendor: string;
  category: string;
}

export interface TrendingProductsProps {
  products: Product[];
}
