import type {
  Hotel,
  HotelPropertyType,
  HotelsParams,
} from "@/src/customer/types/hotels";
import { textMatches } from "@/src/customer/utils/textSearch";

export type SortOption = NonNullable<HotelsParams["sort"]>;

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "relevant", label: "Phù hợp nhất" },
  { id: "rating", label: "Điểm đánh giá từ cao đến thấp" },
  { id: "price-asc", label: "Giá từ thấp đến cao" },
  { id: "price-desc", label: "Giá từ cao đến thấp" },
];

export const HOTEL_PROPERTY_TYPE_FILTERS: {
  id: HotelPropertyType;
  label: string;
}[] = [
  { id: "hotel", label: "Khách sạn" },
  { id: "homestay", label: "Homestay" },
  { id: "resort", label: "Resort" },
  { id: "motel", label: "Nhà nghỉ" },
  { id: "apartment", label: "Căn hộ" },
];

export const HOTEL_AMENITY_FILTERS = [
  "Wi-Fi miễn phí",
  "Ghế tình yêu",
  "Lễ tân 24/24",
  "Thang máy",
  "Dịch vụ dọn phòng",
  "Tiện nghi là/ủi",
  "Dịch vụ lưu trữ/bảo quản hành lý",
  "Bồn tắm",
  "Smart TV",
  "Điều hoà",
  "Khu vực có thể hút thuốc",
  "Đưa đón sân bay",
  "Bãi đỗ xe ô tô",
  "Quán cafe",
  "Nhà hàng",
  "Đồ dùng làm bếp",
  "Máy sấy tóc",
  "Két sắt",
  "Bể bơi",
  "Tủ lạnh",
];

export const HOTEL_RATING_FILTERS = [
  { value: 4.5, label: "≥ 4.5" },
  { value: 4.0, label: "≥ 4.0" },
  { value: 3.5, label: "≥ 3.5" },
];

export const HOTEL_CLEANLINESS_FILTERS = [
  { value: 4.9, label: "≥ 4.9" },
  { value: 4.5, label: "≥ 4.5" },
  { value: 4.0, label: "≥ 4.0" },
  { value: 3.5, label: "≥ 3.5" },
];

export interface HotelListFilterState {
  minCleanlinessRating?: number;
  maxPrice?: number;
  minPrice?: number;
  minRating?: number;
  selectedAmenities?: string[];
  selectedBookingTypes?: string[];
  selectedHotelTypes: HotelPropertyType[];
  sort: SortOption;
}

const matchesHotelTypes = (
  hotel: Hotel,
  selectedHotelTypes: HotelPropertyType[],
) => {
  if (selectedHotelTypes.length === 0) return true;

  const { propertyType } = hotel;
  return propertyType ? selectedHotelTypes.includes(propertyType) : false;
};

const matchesRoomAmenities = (
  hotel: Hotel,
  selectedAmenities: string[] = [],
) => {
  if (selectedAmenities.length === 0) return true;
  const amenities = [
    ...(hotel.amenities ?? []),
    ...(hotel.roomAmenities ?? []),
  ];

  return selectedAmenities.every((amenity) =>
    amenities.some((value) => textMatches(value, amenity)),
  );
};

const matchesBookingTypes = (
  hotel: Hotel,
  selectedBookingTypes: string[] = [],
) => {
  if (selectedBookingTypes.length === 0) return true;

  return selectedBookingTypes.some((type) =>
    hotel.tags.some((value) => textMatches(value, type)),
  );
};

const getCleanlinessRating = (hotel: Hotel) =>
  hotel.cleanlinessRating ?? hotel.cleanlinessScore ?? hotel.rating;

export function applyHotelListFilters(
  hotels: Hotel[],
  filters: HotelListFilterState,
) {
  const filtered = hotels.filter((hotel) => {
    const aboveMin =
      filters.minPrice === undefined || hotel.priceValue >= filters.minPrice;
    const belowMax =
      filters.maxPrice === undefined || hotel.priceValue <= filters.maxPrice;
    const aboveMinRating =
      filters.minRating === undefined || hotel.rating >= filters.minRating;
    const aboveMinCleanliness =
      filters.minCleanlinessRating === undefined ||
      getCleanlinessRating(hotel) >= filters.minCleanlinessRating;
    return (
      aboveMin &&
      belowMax &&
      aboveMinRating &&
      aboveMinCleanliness &&
      matchesBookingTypes(hotel, filters.selectedBookingTypes) &&
      matchesHotelTypes(hotel, filters.selectedHotelTypes) &&
      matchesRoomAmenities(hotel, filters.selectedAmenities)
    );
  });

  if (filters.sort === "rating") {
    return [...filtered].sort((a, b) => b.rating - a.rating);
  }

  if (filters.sort === "price-asc") {
    return [...filtered].sort((a, b) => a.priceValue - b.priceValue);
  }

  if (filters.sort === "price-desc") {
    return [...filtered].sort((a, b) => b.priceValue - a.priceValue);
  }

  return filtered;
}
