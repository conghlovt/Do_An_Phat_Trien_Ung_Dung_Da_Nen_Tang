import { z } from 'zod';
export declare const customerRegisterSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    username: z.ZodString;
}, z.core.$strip>;
export declare const customerLoginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export declare const logoutSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodEmail;
}, z.core.$strip>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodEmail;
    code: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const hotelListQuerySchema: z.ZodObject<{
    tag: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<{
        rating: "rating";
        relevant: "relevant";
        "price-asc": "price-asc";
        "price-desc": "price-desc";
    }>>;
    minPrice: z.ZodPipe<z.ZodOptional<z.ZodCoercedNumber<unknown>>, z.ZodTransform<string | undefined, number | undefined>>;
    maxPrice: z.ZodPipe<z.ZodOptional<z.ZodCoercedNumber<unknown>>, z.ZodTransform<string | undefined, number | undefined>>;
    district: z.ZodOptional<z.ZodString>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodCoercedNumber<unknown>>, z.ZodTransform<string | undefined, number | undefined>>;
}, z.core.$strip>;
export declare const hotelIdParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const hotelAvailabilityQuerySchema: z.ZodObject<{
    bookingType: z.ZodDefault<z.ZodEnum<{
        "Theo gi\u1EDD": "Theo giờ";
        "Qua \u0111\u00EAm": "Qua đêm";
        "Theo ng\u00E0y": "Theo ngày";
    }>>;
    date: z.ZodString;
}, z.core.$strip>;
export declare const hotelCardCityParamsSchema: z.ZodObject<{
    city: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=customer.validator.d.ts.map