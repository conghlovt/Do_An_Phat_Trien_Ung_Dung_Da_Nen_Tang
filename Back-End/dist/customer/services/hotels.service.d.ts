import type { HotelQueryParams, LocationProvince } from '../models/hotel.model';
export declare const findHotels: (params: HotelQueryParams) => Promise<{
    hotels: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reviews: number;
        name: string;
        city: string;
        price: string;
        discount: string | null;
        isActive: boolean;
        rating: number;
        district: string;
        slug: string;
        area: string;
        location: string;
        priceValue: number;
        unit: string;
        oldPrice: string | null;
        image: string;
        badge: string | null;
        tags: string[];
        sortOrder: number;
    }[];
    total: number;
}>;
export declare const findHotelById: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    reviews: number;
    name: string;
    city: string;
    price: string;
    discount: string | null;
    isActive: boolean;
    rating: number;
    district: string;
    slug: string;
    area: string;
    location: string;
    priceValue: number;
    unit: string;
    oldPrice: string | null;
    image: string;
    badge: string | null;
    tags: string[];
    sortOrder: number;
}>;
export declare const findHotelLocations: () => Promise<LocationProvince[]>;
export declare const getOfficeInfo: () => {
    title: string;
    address: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
    hours: {
        weekday: string;
        weekend: string;
    };
};
//# sourceMappingURL=hotels.service.d.ts.map