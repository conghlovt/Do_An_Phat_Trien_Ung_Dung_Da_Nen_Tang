// ============================================================
// Room Controller — No try/catch, clean async handlers
// ============================================================
import { roomService } from '../services/room.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { BadRequestError } from '../../shared/errors/AppError';
export class RoomController {
    // ======================== ROOM TYPES ========================
    async createRoomType(req, res) {
        const roomType = await roomService.createRoomType(req.params.hotelId, req.user.id, req.body);
        sendSuccess(res, 201, 'ROOM_TYPE_CREATED', 'Tạo loại phòng thành công', { roomType });
    }
    async updateRoomType(req, res) {
        const roomType = await roomService.updateRoomType(req.params.hotelId, req.params.roomTypeId, req.user.id, req.body);
        sendSuccess(res, 200, 'ROOM_TYPE_UPDATED', 'Cập nhật loại phòng thành công', { roomType });
    }
    async listRoomTypes(req, res) {
        const roomTypes = await roomService.listRoomTypes(req.params.hotelId);
        sendSuccess(res, 200, 'ROOM_TYPE_LIST_FETCHED', 'Lấy danh sách loại phòng thành công', { items: roomTypes });
    }
    async getRoomType(req, res) {
        const roomType = await roomService.getRoomType(req.params.hotelId, req.params.roomTypeId);
        sendSuccess(res, 200, 'ROOM_TYPE_DETAIL_FETCHED', 'Lấy chi tiết loại phòng thành công', { roomType });
    }
    async deleteRoomType(req, res) {
        await roomService.deleteRoomType(req.params.hotelId, req.params.roomTypeId, req.user.id);
        sendSuccess(res, 200, 'ROOM_TYPE_DELETED', 'Xóa loại phòng thành công');
    }
    // ======================== ROOM UNITS ========================
    async createRoomUnit(req, res) {
        const roomUnit = await roomService.createRoomUnit(req.params.hotelId, req.params.roomTypeId, req.user.id, req.body);
        sendSuccess(res, 201, 'ROOM_UNIT_CREATED', 'Thêm phòng thành công', { roomUnit });
    }
    async updateRoomUnit(req, res) {
        const roomUnit = await roomService.updateRoomUnit(req.params.hotelId, req.params.roomTypeId, req.params.unitId, req.user.id, req.body);
        sendSuccess(res, 200, 'ROOM_UNIT_UPDATED', 'Cập nhật phòng thành công', { roomUnit });
    }
    async listRoomUnits(req, res) {
        const roomUnits = await roomService.listRoomUnits(req.params.hotelId, req.params.roomTypeId);
        sendSuccess(res, 200, 'ROOM_UNIT_LIST_FETCHED', 'Lấy danh sách phòng thành công', { items: roomUnits });
    }
    async deleteRoomUnit(req, res) {
        await roomService.deleteRoomUnit(req.params.hotelId, req.params.roomTypeId, req.params.unitId, req.user.id);
        sendSuccess(res, 200, 'ROOM_UNIT_DELETED', 'Xóa phòng thành công');
    }
    // ======================== ROOM MEDIA ========================
    async uploadMedia(req, res) {
        const files = req.files;
        if (!files || files.length === 0)
            throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
        const media = await roomService.addMedia(req.params.hotelId, req.params.roomTypeId, req.user.id, files);
        sendSuccess(res, 201, 'ROOM_MEDIA_UPLOADED', `Upload ${media.length} media thành công`, { media });
    }
    async deleteMedia(req, res) {
        await roomService.removeMedia(req.params.hotelId, req.params.roomTypeId, req.params.mediaId, req.user.id);
        sendSuccess(res, 200, 'ROOM_MEDIA_DELETED', 'Xóa media thành công');
    }
}
export const roomController = new RoomController();
//# sourceMappingURL=room.controller.js.map