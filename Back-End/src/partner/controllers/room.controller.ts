// ============================================================
// Room Controller — No try/catch, clean async handlers
// ============================================================

import type { Response } from 'express';
import { roomService } from '../services/room.service';
import { sendSuccess } from '../../shared/utils/response.util';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
import { BadRequestError } from '../../shared/errors/AppError';

export class RoomController {

  // ======================== ROOM TYPES ========================

  async createRoomType(req: AuthRequest, res: Response) {
    const roomType = await roomService.createRoomType(req.params.hotelId as string, req.user!.id, req.body);
    sendSuccess(res, 201, 'ROOM_TYPE_CREATED', 'Tạo loại phòng thành công', { roomType });
  }

  async updateRoomType(req: AuthRequest, res: Response) {
    const roomType = await roomService.updateRoomType(
      req.params.hotelId as string, req.params.roomTypeId as string, req.user!.id, req.body
    );
    sendSuccess(res, 200, 'ROOM_TYPE_UPDATED', 'Cập nhật loại phòng thành công', { roomType });
  }

  async listRoomTypes(req: AuthRequest, res: Response) {
    const roomTypes = await roomService.listRoomTypes(req.params.hotelId as string);
    sendSuccess(res, 200, 'ROOM_TYPE_LIST_FETCHED', 'Lấy danh sách loại phòng thành công', { items: roomTypes });
  }

  async getRoomType(req: AuthRequest, res: Response) {
    const roomType = await roomService.getRoomType(req.params.hotelId as string, req.params.roomTypeId as string);
    sendSuccess(res, 200, 'ROOM_TYPE_DETAIL_FETCHED', 'Lấy chi tiết loại phòng thành công', { roomType });
  }

  async deleteRoomType(req: AuthRequest, res: Response) {
    await roomService.deleteRoomType(req.params.hotelId as string, req.params.roomTypeId as string, req.user!.id);
    sendSuccess(res, 200, 'ROOM_TYPE_DELETED', 'Xóa loại phòng thành công');
  }

  // ======================== ROOM UNITS ========================

  async createRoomUnit(req: AuthRequest, res: Response) {
    const roomUnit = await roomService.createRoomUnit(
      req.params.hotelId as string, req.params.roomTypeId as string, req.user!.id, req.body
    );
    sendSuccess(res, 201, 'ROOM_UNIT_CREATED', 'Thêm phòng thành công', { roomUnit });
  }

  async updateRoomUnit(req: AuthRequest, res: Response) {
    const roomUnit = await roomService.updateRoomUnit(
      req.params.hotelId as string, req.params.roomTypeId as string,
      req.params.unitId as string, req.user!.id, req.body
    );
    sendSuccess(res, 200, 'ROOM_UNIT_UPDATED', 'Cập nhật phòng thành công', { roomUnit });
  }

  async listRoomUnits(req: AuthRequest, res: Response) {
    const roomUnits = await roomService.listRoomUnits(req.params.hotelId as string, req.params.roomTypeId as string);
    sendSuccess(res, 200, 'ROOM_UNIT_LIST_FETCHED', 'Lấy danh sách phòng thành công', { items: roomUnits });
  }

  async deleteRoomUnit(req: AuthRequest, res: Response) {
    await roomService.deleteRoomUnit(
      req.params.hotelId as string, req.params.roomTypeId as string,
      req.params.unitId as string, req.user!.id
    );
    sendSuccess(res, 200, 'ROOM_UNIT_DELETED', 'Xóa phòng thành công');
  }

  // ======================== ROOM MEDIA ========================

  async uploadMedia(req: AuthRequest, res: Response) {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
    const media = await roomService.addMedia(
      req.params.hotelId as string, req.params.roomTypeId as string, req.user!.id, files
    );
    sendSuccess(res, 201, 'ROOM_MEDIA_UPLOADED', `Upload ${media.length} media thành công`, { media });
  }

  async deleteMedia(req: AuthRequest, res: Response) {
    await roomService.removeMedia(
      req.params.hotelId as string, req.params.roomTypeId as string,
      req.params.mediaId as string, req.user!.id
    );
    sendSuccess(res, 200, 'ROOM_MEDIA_DELETED', 'Xóa media thành công');
  }
}

export const roomController = new RoomController();
