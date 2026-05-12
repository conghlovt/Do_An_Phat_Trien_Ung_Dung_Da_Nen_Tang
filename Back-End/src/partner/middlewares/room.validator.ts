import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  name: z.string().min(2, 'Tên loại phòng phải có ít nhất 2 ký tự').max(150),
  description: z.string().max(3000).optional(),
  maxGuests: z.number().int().min(1).max(20).default(2),
  bedType: z.string().max(50).optional(),
  roomSizeSqm: z.number().min(1).max(1000).optional(),
  totalUnits: z.number().int().min(1).max(999).default(1),
  amenityIds: z.array(z.string().uuid()).optional(),
});

export const updateRoomTypeSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(3000).optional(),
  maxGuests: z.number().int().min(1).max(20).optional(),
  bedType: z.string().max(50).optional(),
  roomSizeSqm: z.number().min(1).max(1000).optional(),
  totalUnits: z.number().int().min(1).max(999).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  amenityIds: z.array(z.string().uuid()).optional(),
});

export const createRoomUnitSchema = z.object({
  roomNumber: z.string().min(1, 'Số phòng là bắt buộc').max(20),
  floor: z.number().int().min(-5).max(200).optional(),
  notes: z.string().max(500).optional(),
});

export const updateRoomUnitSchema = z.object({
  roomNumber: z.string().min(1).max(20).optional(),
  floor: z.number().int().min(-5).max(200).optional(),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateRoomUnitInput = z.infer<typeof createRoomUnitSchema>;
export type UpdateRoomUnitInput = z.infer<typeof updateRoomUnitSchema>;
