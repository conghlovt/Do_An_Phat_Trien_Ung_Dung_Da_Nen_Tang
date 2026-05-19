import { z } from 'zod';
export declare const createHotelSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    propertyType: z.ZodDefault<z.ZodEnum<{
        hotel: "hotel";
        homestay: "homestay";
        resort: "resort";
        motel: "motel";
        apartment: "apartment";
    }>>;
    starRating: z.ZodOptional<z.ZodNumber>;
    checkInTime: z.ZodDefault<z.ZodString>;
    checkOutTime: z.ZodDefault<z.ZodString>;
    minBookingHours: z.ZodOptional<z.ZodNumber>;
    cancellationPolicy: z.ZodDefault<z.ZodEnum<{
        flexible: "flexible";
        moderate: "moderate";
        strict: "strict";
        non_refundable: "non_refundable";
    }>>;
    cancellationHours: z.ZodDefault<z.ZodNumber>;
    depositPercent: z.ZodDefault<z.ZodNumber>;
    address: z.ZodObject<{
        addressLine: z.ZodString;
        ward: z.ZodOptional<z.ZodString>;
        district: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    amenityIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateHotelSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    propertyType: z.ZodOptional<z.ZodEnum<{
        hotel: "hotel";
        homestay: "homestay";
        resort: "resort";
        motel: "motel";
        apartment: "apartment";
    }>>;
    starRating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    checkInTime: z.ZodOptional<z.ZodString>;
    checkOutTime: z.ZodOptional<z.ZodString>;
    minBookingHours: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cancellationPolicy: z.ZodOptional<z.ZodEnum<{
        flexible: "flexible";
        moderate: "moderate";
        strict: "strict";
        non_refundable: "non_refundable";
    }>>;
    cancellationHours: z.ZodOptional<z.ZodNumber>;
    depositPercent: z.ZodOptional<z.ZodNumber>;
    address: z.ZodOptional<z.ZodObject<{
        addressLine: z.ZodOptional<z.ZodString>;
        ward: z.ZodOptional<z.ZodString>;
        district: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        province: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    amenityIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const hotelQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    status: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        pending: "pending";
        approved: "approved";
        rejected: "rejected";
        suspended: "suspended";
    }>>;
    sort: z.ZodDefault<z.ZodEnum<{
        name: "name";
        created_at: "created_at";
        avg_rating: "avg_rating";
    }>>;
    order: z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    keyword: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type HotelQueryInput = z.infer<typeof hotelQuerySchema>;
//# sourceMappingURL=hotel.validator.d.ts.map