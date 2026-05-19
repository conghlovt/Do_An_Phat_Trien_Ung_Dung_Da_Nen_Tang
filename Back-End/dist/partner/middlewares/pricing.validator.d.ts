import { z } from 'zod';
export declare const createPricingSchema: z.ZodObject<{
    bookingType: z.ZodEnum<{
        hourly: "hourly";
        overnight: "overnight";
        daily: "daily";
    }>;
    basePrice: z.ZodNumber;
    minHours: z.ZodOptional<z.ZodNumber>;
    maxHours: z.ZodOptional<z.ZodNumber>;
    extraHourPrice: z.ZodOptional<z.ZodNumber>;
    overnightCheckinFrom: z.ZodOptional<z.ZodString>;
    overnightCheckoutBefore: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePricingSchema: z.ZodObject<{
    basePrice: z.ZodOptional<z.ZodNumber>;
    minHours: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxHours: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    extraHourPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    overnightCheckinFrom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    overnightCheckoutBefore: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createSpecialPriceSchema: z.ZodObject<{
    date: z.ZodString;
    price: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreatePricingInput = z.infer<typeof createPricingSchema>;
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;
export type CreateSpecialPriceInput = z.infer<typeof createSpecialPriceSchema>;
//# sourceMappingURL=pricing.validator.d.ts.map