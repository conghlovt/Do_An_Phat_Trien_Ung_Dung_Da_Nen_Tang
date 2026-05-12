// Type definitions cho Hotel model (ánh xạ từ Prisma schema)
export interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  district: string;
  discount: string;
  price: string;
  priceValue: number;
  unit: string;
  oldPrice: string;
  image: string;
  badge: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelQueryParams {
  tag?: string;
  sort?: 'rating' | 'price-asc' | 'price-desc';
  minPrice?: string;
  maxPrice?: string;
  district?: string;
  limit?: string;
}
