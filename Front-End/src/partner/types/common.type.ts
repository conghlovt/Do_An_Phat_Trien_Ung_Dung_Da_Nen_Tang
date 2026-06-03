export interface UserBase {
    id: string;
    username: string;
    email?: string;
    phone?: string | null;
    avatar?: string;
}

export interface AddressBase {
    city: string;
    district: string;
    fullAddress?: string;
}

export interface Amenity {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    category: string;
}

export interface BaseMedia {
    id: string;
    isCover: boolean;
    sortOrder: number;
}