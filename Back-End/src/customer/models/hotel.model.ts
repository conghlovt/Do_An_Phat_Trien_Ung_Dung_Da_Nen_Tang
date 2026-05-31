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
  propertyType?: 'hotel' | 'homestay' | 'resort' | 'motel' | 'apartment';
  createdAt: Date;
  updatedAt: Date;
  amenities?: string[];
  roomAmenities?: string[];
}

export interface HotelQueryParams {
  keyword?: string;
  tag?: string;
  sort?: 'relevant' | 'rating' | 'price-asc' | 'price-desc';
  minPrice?: string;
  maxPrice?: string;
  district?: string;
  limit?: string;
  roomAmenities?: string;
}

export interface LocationWard {
  name: string;
  count: number;
}

export interface LocationDistrict {
  name: string;
  count: number;
  wards: LocationWard[];
}

export interface LocationProvince {
  name: string;
  count: number;
  districts: LocationDistrict[];
}
