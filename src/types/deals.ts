export interface Deal {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discountedPrice?: number;
  listPrice?: number;
  currentPrice?: number;
  image?: string;
  images?: string[];
  [key: string]: any; // for other optional fields
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
}
