import { z } from 'zod';

export const createHotelSchema = z.object({
  name: z.string().min(2, 'Tên khách sạn phải có ít nhất 2 ký tự').max(255),
  description: z.string().max(5000).optional(),
  propertyType: z.enum(['hotel', 'homestay', 'resort', 'motel', 'apartment']).default('hotel'),
  starRating: z.number().int().min(1).max(5).optional(),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng giờ HH:mm').default('14:00'),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng giờ HH:mm').default('12:00'),
  minBookingHours: z.number().int().min(1).optional(),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']).default('moderate'),
  cancellationHours: z.number().int().min(0).default(24),
  depositPercent: z.number().min(0).max(100).default(0),
  // Address
  address: z.object({
    addressLine: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').max(500),
    ward: z.string().max(100).optional(),
    district: z.string().min(1, 'Quận/huyện là bắt buộc').max(100),
    city: z.string().min(1, 'Thành phố là bắt buộc').max(100),
    province: z.string().min(1, 'Tỉnh/thành là bắt buộc').max(100),
    country: z.string().max(100).default('Vietnam'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  // Amenities
  amenityIds: z.array(z.string().uuid()).optional(),
});

export const updateHotelSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(5000).optional(),
  propertyType: z.enum(['hotel', 'homestay', 'resort', 'motel', 'apartment']).optional(),
  starRating: z.number().int().min(1).max(5).nullable().optional(),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  minBookingHours: z.number().int().min(1).nullable().optional(),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']).optional(),
  cancellationHours: z.number().int().min(0).optional(),
  depositPercent: z.number().min(0).max(100).optional(),
  address: z.object({
    addressLine: z.string().min(5).max(500).optional(),
    ward: z.string().max(100).optional(),
    district: z.string().min(1).max(100).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().max(100).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
  amenityIds: z.array(z.string().uuid()).optional(),
});

export const hotelQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'suspended']).optional(),
  sort: z.enum(['created_at', 'name', 'avg_rating']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  keyword: z.string().optional(),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type HotelQueryInput = z.infer<typeof hotelQuerySchema>;
