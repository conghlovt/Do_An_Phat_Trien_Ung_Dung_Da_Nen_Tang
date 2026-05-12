// ============================================================
// Hotel Controller — Thin layer, no try/catch
// Errors are caught by asyncHandler → errorHandler middleware
// ============================================================

import type { Request, Response } from 'express';
import { hotelService } from '../services/hotel.service';
import { sendSuccess, buildPaginationMeta } from '../../shared/utils/response.util';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
import { BadRequestError } from '../../shared/errors/AppError';

export class HotelController {

  /** POST /api/v1/partner/hotels — Create hotel */
  async create(req: AuthRequest, res: Response) {
    const hotel = await hotelService.create(req.user!.id, req.body);
    sendSuccess(res, 201, 'HOTEL_CREATED', 'Tạo khách sạn thành công', { hotel });
  }

  /** PUT /api/v1/partner/hotels/:id — Update hotel */
  async update(req: AuthRequest, res: Response) {
    const hotel = await hotelService.update(req.params.id as string, req.user!.id, req.body);
    sendSuccess(res, 200, 'HOTEL_UPDATED', 'Cập nhật khách sạn thành công', { hotel });
  }

  /** GET /api/v1/partner/hotels — List my hotels */
  async listMyHotels(req: AuthRequest, res: Response) {
    const { items, totalItems } = await hotelService.listByOwner(req.user!.id, req.query as any);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const meta = { pagination: buildPaginationMeta(page, limit, totalItems) };
    sendSuccess(res, 200, 'HOTEL_LIST_FETCHED', 'Lấy danh sách khách sạn thành công', { items }, meta);
  }

  /** GET /api/v1/partner/hotels/:id — Get hotel detail (owner) */
  async getMyHotel(req: AuthRequest, res: Response) {
    const hotel = await hotelService.getById(req.params.id as string, req.user!.id);
    sendSuccess(res, 200, 'HOTEL_DETAIL_FETCHED', 'Lấy chi tiết khách sạn thành công', { hotel });
  }

  /** POST /api/v1/partner/hotels/:id/submit — Submit for review */
  async submitForReview(req: AuthRequest, res: Response) {
    const hotel = await hotelService.submitForReview(req.params.id as string, req.user!.id);
    sendSuccess(res, 200, 'HOTEL_SUBMITTED_FOR_REVIEW', 'Đã gửi yêu cầu duyệt khách sạn', { hotel });
  }

  /** DELETE /api/v1/partner/hotels/:id — Delete hotel */
  async delete(req: AuthRequest, res: Response) {
    await hotelService.delete(req.params.id as string, req.user!.id);
    sendSuccess(res, 200, 'HOTEL_DELETED', 'Xóa khách sạn thành công');
  }

  /** GET /api/v1/hotels — Public hotel list */
  async listPublic(req: Request, res: Response) {
    const { items, totalItems, page, limit } = await hotelService.listPublic(req.query);
    const meta = { pagination: buildPaginationMeta(page, limit, totalItems) };
    sendSuccess(res, 200, 'HOTEL_LIST_FETCHED', 'Lấy danh sách khách sạn thành công', { items }, meta);
  }

  /** GET /api/v1/hotels/:slug — Public hotel detail */
  async getPublic(req: Request, res: Response) {
    const hotel = await hotelService.getBySlug(req.params.slug as string);
    sendSuccess(res, 200, 'HOTEL_DETAIL_FETCHED', 'Lấy chi tiết khách sạn thành công', { hotel });
  }

  // ============================================================
  // IMAGE & VIDEO UPLOAD
  // ============================================================

  /** POST /api/v1/partner/hotels/:id/images — Upload hotel images */
  async uploadImages(req: AuthRequest, res: Response) {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
    const images = await hotelService.addImages(req.params.id as string, req.user!.id, files);
    sendSuccess(res, 201, 'HOTEL_IMAGES_UPLOADED', `Upload ${images.length} ảnh thành công`, { images });
  }

  /** DELETE /api/v1/partner/hotels/:id/images/:imageId — Delete hotel image */
  async deleteImage(req: AuthRequest, res: Response) {
    await hotelService.removeImage(req.params.id as string, req.params.imageId as string, req.user!.id);
    sendSuccess(res, 200, 'HOTEL_IMAGE_DELETED', 'Xóa ảnh thành công');
  }

  /** POST /api/v1/partner/hotels/:id/videos — Upload hotel video */
  async uploadVideo(req: AuthRequest, res: Response) {
    if (!req.file) throw new BadRequestError('Không có video nào được gửi', 'FILE_REQUIRED');
    const video = await hotelService.addVideo(
      req.params.id as string, req.user!.id, req.file, req.body.title
    );
    sendSuccess(res, 201, 'HOTEL_VIDEO_UPLOADED', 'Upload video thành công', { video });
  }

  /** DELETE /api/v1/partner/hotels/:id/videos/:videoId — Delete hotel video */
  async deleteVideo(req: AuthRequest, res: Response) {
    await hotelService.removeVideo(req.params.id as string, req.params.videoId as string, req.user!.id);
    sendSuccess(res, 200, 'HOTEL_VIDEO_DELETED', 'Xóa video thành công');
  }
}

export const hotelController = new HotelController();
