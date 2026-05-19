import prisma from '../../login/lib/prisma';
import { generateUniqueSlug } from '../../shared/utils/slug.util';
import { uploadService } from './upload.service';
import { BUCKETS } from '../../shared/config/minio';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
const roomTypeInclude = {
    pricingPolicies: { where: { isActive: true } },
    roomTypeAmenities: { include: { amenity: true } },
    media: { orderBy: { sortOrder: 'asc' } },
    _count: { select: { roomUnits: true } },
};
export class RoomService {
    async verifyOwnership(hotelId, ownerId) {
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { id: true, ownerId: true },
        });
        if (!hotel)
            throw new NotFoundError('Không tìm thấy khách sạn', 'HOTEL_NOT_FOUND');
        if (hotel.ownerId !== ownerId)
            throw new ForbiddenError('Không có quyền thực hiện');
        return hotel;
    }
    // ======================== ROOM TYPES ========================
    async createRoomType(hotelId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        const slug = generateUniqueSlug(data.name);
        const roomType = await prisma.$transaction(async (tx) => {
            const created = await tx.roomType.create({
                data: {
                    hotelId,
                    name: data.name,
                    slug,
                    description: data.description,
                    maxGuests: data.maxGuests,
                    bedType: data.bedType,
                    roomSizeSqm: data.roomSizeSqm,
                    totalUnits: data.totalUnits,
                    ...(data.amenityIds && data.amenityIds.length > 0 ? {
                        roomTypeAmenities: {
                            createMany: { data: data.amenityIds.map((amenityId) => ({ amenityId })) },
                        },
                    } : {}),
                }, // Ép kiểu ngăn chặn lỗi ánh xạ mảng và enum nghiêm ngặt từ validator
                include: roomTypeInclude,
            });
            const totalRooms = await tx.roomType.aggregate({
                where: { hotelId, status: 'active' },
                _sum: { totalUnits: true },
            });
            await tx.hotel.update({
                where: { id: hotelId },
                data: { totalRooms: totalRooms._sum.totalUnits || 0 },
            });
            return created;
        });
        return roomType;
    }
    async updateRoomType(hotelId, roomTypeId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        const existing = await prisma.roomType.findFirst({ where: { id: roomTypeId, hotelId } });
        if (!existing)
            throw new NotFoundError('Không tìm thấy loại phòng', 'ROOM_TYPE_NOT_FOUND');
        const roomType = await prisma.$transaction(async (tx) => {
            const updateData = {};
            if (data.name) {
                updateData.name = data.name;
                updateData.slug = generateUniqueSlug(data.name);
            }
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.maxGuests !== undefined)
                updateData.maxGuests = data.maxGuests;
            if (data.bedType !== undefined)
                updateData.bedType = data.bedType;
            if (data.roomSizeSqm !== undefined)
                updateData.roomSizeSqm = data.roomSizeSqm;
            if (data.totalUnits !== undefined)
                updateData.totalUnits = data.totalUnits;
            if (data.status)
                updateData.status = data.status;
            await tx.roomType.update({
                where: { id: roomTypeId },
                data: updateData
            });
            if (data.amenityIds) {
                await tx.roomTypeAmenity.deleteMany({ where: { roomTypeId } });
                if (data.amenityIds.length > 0) {
                    await tx.roomTypeAmenity.createMany({
                        data: data.amenityIds.map((amenityId) => ({ roomTypeId, amenityId })),
                    });
                }
            }
            const totalRooms = await tx.roomType.aggregate({
                where: { hotelId, status: 'active' },
                _sum: { totalUnits: true },
            });
            await tx.hotel.update({
                where: { id: hotelId },
                data: { totalRooms: totalRooms._sum.totalUnits || 0 },
            });
            return tx.roomType.findUnique({ where: { id: roomTypeId }, include: roomTypeInclude });
        });
        return roomType;
    }
    async listRoomTypes(hotelId) {
        return prisma.roomType.findMany({ where: { hotelId }, include: roomTypeInclude, orderBy: { sortOrder: 'asc' } });
    }
    async getRoomType(hotelId, roomTypeId) {
        const roomType = await prisma.roomType.findFirst({
            where: { id: roomTypeId, hotelId },
            include: { ...roomTypeInclude, roomUnits: { orderBy: { roomNumber: 'asc' } } },
        });
        if (!roomType)
            throw new NotFoundError('Không tìm thấy loại phòng', 'ROOM_TYPE_NOT_FOUND');
        return roomType;
    }
    async deleteRoomType(hotelId, roomTypeId, ownerId) {
        await this.verifyOwnership(hotelId, ownerId);
        const existing = await prisma.roomType.findFirst({ where: { id: roomTypeId, hotelId } });
        if (!existing)
            throw new NotFoundError('Không tìm thấy loại phòng', 'ROOM_TYPE_NOT_FOUND');
        await prisma.$transaction(async (tx) => {
            await tx.roomType.delete({ where: { id: roomTypeId } });
            const totalRooms = await tx.roomType.aggregate({
                where: { hotelId, status: 'active' },
                _sum: { totalUnits: true },
            });
            await tx.hotel.update({ where: { id: hotelId }, data: { totalRooms: totalRooms._sum.totalUnits || 0 } });
        });
        return true;
    }
    // ======================== ROOM UNITS ========================
    async createRoomUnit(hotelId, roomTypeId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        const roomType = await prisma.roomType.findFirst({ where: { id: roomTypeId, hotelId } });
        if (!roomType)
            throw new NotFoundError('Không tìm thấy loại phòng', 'ROOM_TYPE_NOT_FOUND');
        return prisma.roomUnit.create({
            data: { roomTypeId, roomNumber: data.roomNumber, floor: data.floor, notes: data.notes }
        });
    }
    async updateRoomUnit(hotelId, roomTypeId, unitId, ownerId, data) {
        await this.verifyOwnership(hotelId, ownerId);
        const unit = await prisma.roomUnit.findFirst({ where: { id: unitId, roomTypeId, roomType: { hotelId } } });
        if (!unit)
            throw new NotFoundError('Không tìm thấy phòng', 'ROOM_UNIT_NOT_FOUND');
        return prisma.roomUnit.update({
            where: { id: unitId },
            data: {
                ...(data.roomNumber && { roomNumber: data.roomNumber }),
                ...(data.floor !== undefined && { floor: data.floor }),
                ...(data.status && { status: data.status }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
        });
    }
    async listRoomUnits(hotelId, roomTypeId) {
        return prisma.roomUnit.findMany({ where: { roomTypeId, roomType: { hotelId } }, orderBy: { roomNumber: 'asc' } });
    }
    async deleteRoomUnit(hotelId, roomTypeId, unitId, ownerId) {
        await this.verifyOwnership(hotelId, ownerId);
        const unit = await prisma.roomUnit.findFirst({ where: { id: unitId, roomTypeId, roomType: { hotelId } } });
        if (!unit)
            throw new NotFoundError('Không tìm thấy phòng', 'ROOM_UNIT_NOT_FOUND');
        await prisma.roomUnit.delete({ where: { id: unitId } });
        return true;
    }
    // ======================== ROOM MEDIA (MinIO) ========================
    async addMedia(hotelId, roomTypeId, ownerId, files) {
        await this.verifyOwnership(hotelId, ownerId);
        const roomType = await prisma.roomType.findFirst({ where: { id: roomTypeId, hotelId } });
        if (!roomType)
            throw new NotFoundError('Không tìm thấy loại phòng', 'ROOM_TYPE_NOT_FOUND');
        const uploadedFiles = await uploadService.uploadMultiple(files, BUCKETS.ROOM_MEDIA, 'room_type', roomTypeId, ownerId);
        const maxSort = await prisma.roomMedia.aggregate({ where: { roomTypeId }, _max: { sortOrder: true } });
        let sortOrder = (maxSort._max.sortOrder || 0) + 1;
        const mediaItems = [];
        for (const file of uploadedFiles) {
            const mediaType = file.mimeType.startsWith('video/') ? 'video' : 'image';
            const media = await prisma.roomMedia.create({
                data: {
                    roomTypeId,
                    fileId: file.id,
                    imageUrl: file.url,
                    mediaType: mediaType,
                    isCover: sortOrder === 1,
                    sortOrder: sortOrder++,
                    uploadedBy: ownerId,
                },
            });
            mediaItems.push({ ...media, file });
        }
        return mediaItems;
    }
    async removeMedia(hotelId, roomTypeId, mediaId, ownerId) {
        await this.verifyOwnership(hotelId, ownerId);
        const media = await prisma.roomMedia.findFirst({ where: { id: mediaId, roomTypeId, roomType: { hotelId } } });
        if (!media)
            throw new NotFoundError('Không tìm thấy media', 'MEDIA_NOT_FOUND');
        if (media.fileId)
            await uploadService.deleteFile(media.fileId, ownerId).catch(() => { });
        await prisma.roomMedia.delete({ where: { id: mediaId } });
        return true;
    }
}
export const roomService = new RoomService();
//# sourceMappingURL=room.service.js.map