import { z } from 'zod';

export const createPricingSchema = z.object({
  bookingType: z.enum(['hourly', 'overnight', 'daily'], {
    message: 'Loại đặt phòng là bắt buộc',
  }),
  basePrice: z.number().positive('Giá phải lớn hơn 0'),
  minHours: z.number().int().min(1).optional(),
  maxHours: z.number().int().min(1).optional(),
  extraHourPrice: z.number().positive().optional(),
  overnightCheckinFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  overnightCheckoutBefore: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export const updatePricingSchema = z.object({
  basePrice: z.number().positive('Giá phải lớn hơn 0').optional(),
  minHours: z.number().int().min(1).nullable().optional(),
  maxHours: z.number().int().min(1).nullable().optional(),
  extraHourPrice: z.number().positive().nullable().optional(),
  overnightCheckinFrom: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  overnightCheckoutBefore: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createSpecialPriceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày YYYY-MM-DD'),
  price: z.number().positive('Giá phải lớn hơn 0'),
  reason: z.string().max(255).optional(),
});

export type CreatePricingInput = z.infer<typeof createPricingSchema>;
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;
export type CreateSpecialPriceInput = z.infer<typeof createSpecialPriceSchema>;
