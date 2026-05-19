import { z } from 'zod';
export declare const createRoomTypeSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    maxGuests: z.ZodDefault<z.ZodNumber>;
    bedType: z.ZodOptional<z.ZodString>;
    roomSizeSqm: z.ZodOptional<z.ZodNumber>;
    totalUnits: z.ZodDefault<z.ZodNumber>;
    amenityIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updateRoomTypeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    maxGuests: z.ZodOptional<z.ZodNumber>;
    bedType: z.ZodOptional<z.ZodString>;
    roomSizeSqm: z.ZodOptional<z.ZodNumber>;
    totalUnits: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>>;
    amenityIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const createRoomUnitSchema: z.ZodObject<{
    roomNumber: z.ZodString;
    floor: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateRoomUnitSchema: z.ZodObject<{
    roomNumber: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        available: "available";
        occupied: "occupied";
        maintenance: "maintenance";
        cleaning: "cleaning";
    }>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateRoomUnitInput = z.infer<typeof createRoomUnitSchema>;
export type UpdateRoomUnitInput = z.infer<typeof updateRoomUnitSchema>;
//# sourceMappingURL=room.validator.d.ts.map