export interface Product {
  id: string;
  name: string;
  brand: string;
  url: string;
  imageUrl: string;
  price: number;
  ingredients?: string[];
}

export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  cached: boolean;
}

export interface SearchError {
  message: string;
  code: string;
} 