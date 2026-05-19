// ============================================================
// Hotel Controller — Thin layer, no try/catch
// Errors are caught by asyncHandler → errorHandler middleware
// ============================================================
import { hotelService } from '../services/hotel.service';
import { sendSuccess, buildPaginationMeta } from '../../shared/utils/response.util';
import { BadRequestError } from '../../shared/errors/AppError';
export class HotelController {
    /** POST /api/v1/partner/hotels — Create hotel */
    async create(req, res) {
        const hotel = await hotelService.create(req.user.id, req.body);
        sendSuccess(res, 201, 'HOTEL_CREATED', 'Tạo khách sạn thành công', { hotel });
    }
    /** PUT /api/v1/partner/hotels/:id — Update hotel */
    async update(req, res) {
        const hotel = await hotelService.update(req.params.id, req.user.id, req.body);
        sendSuccess(res, 200, 'HOTEL_UPDATED', 'Cập nhật khách sạn thành công', { hotel });
    }
    /** GET /api/v1/partner/hotels — List my hotels */
    async listMyHotels(req, res) {
        const { items, totalItems } = await hotelService.listByOwner(req.user.id, req.query);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const meta = { pagination: buildPaginationMeta(page, limit, totalItems) };
        sendSuccess(res, 200, 'HOTEL_LIST_FETCHED', 'Lấy danh sách khách sạn thành công', { items }, meta);
    }
    /** GET /api/v1/partner/hotels/:id — Get hotel detail (owner) */
    async getMyHotel(req, res) {
        const hotel = await hotelService.getById(req.params.id, req.user.id);
        sendSuccess(res, 200, 'HOTEL_DETAIL_FETCHED', 'Lấy chi tiết khách sạn thành công', { hotel });
    }
    /** POST /api/v1/partner/hotels/:id/submit — Submit for review */
    async submitForReview(req, res) {
        const hotel = await hotelService.submitForReview(req.params.id, req.user.id);
        sendSuccess(res, 200, 'HOTEL_SUBMITTED_FOR_REVIEW', 'Đã gửi yêu cầu duyệt khách sạn', { hotel });
    }
    /** DELETE /api/v1/partner/hotels/:id — Delete hotel */
    async delete(req, res) {
        await hotelService.delete(req.params.id, req.user.id);
        sendSuccess(res, 200, 'HOTEL_DELETED', 'Xóa khách sạn thành công');
    }
    /** GET /api/v1/hotels — Public hotel list */
    async listPublic(req, res) {
        const { items, totalItems, page, limit } = await hotelService.listPublic(req.query);
        const meta = { pagination: buildPaginationMeta(page, limit, totalItems) };
        sendSuccess(res, 200, 'HOTEL_LIST_FETCHED', 'Lấy danh sách khách sạn thành công', { items }, meta);
    }
    /** GET /api/v1/hotels/:slug — Public hotel detail */
    async getPublic(req, res) {
        const hotel = await hotelService.getBySlug(req.params.slug);
        sendSuccess(res, 200, 'HOTEL_DETAIL_FETCHED', 'Lấy chi tiết khách sạn thành công', { hotel });
    }
    // ============================================================
    // IMAGE & VIDEO UPLOAD
    // ============================================================
    /** POST /api/v1/partner/hotels/:id/images — Upload hotel images */
    async uploadImages(req, res) {
        const files = req.files;
        if (!files || files.length === 0)
            throw new BadRequestError('Không có file nào được gửi', 'FILE_REQUIRED');
        const images = await hotelService.addImages(req.params.id, req.user.id, files);
        sendSuccess(res, 201, 'HOTEL_IMAGES_UPLOADED', `Upload ${images.length} ảnh thành công`, { images });
    }
    /** DELETE /api/v1/partner/hotels/:id/images/:imageId — Delete hotel image */
    async deleteImage(req, res) {
        await hotelService.removeImage(req.params.id, req.params.imageId, req.user.id);
        sendSuccess(res, 200, 'HOTEL_IMAGE_DELETED', 'Xóa ảnh thành công');
    }
    /** POST /api/v1/partner/hotels/:id/videos — Upload hotel video */
    async uploadVideo(req, res) {
        if (!req.file)
            throw new BadRequestError('Không có video nào được gửi', 'FILE_REQUIRED');
        const video = await hotelService.addVideo(req.params.id, req.user.id, req.file, req.body.title);
        sendSuccess(res, 201, 'HOTEL_VIDEO_UPLOADED', 'Upload video thành công', { video });
    }
    /** DELETE /api/v1/partner/hotels/:id/videos/:videoId — Delete hotel video */
    async deleteVideo(req, res) {
        await hotelService.removeVideo(req.params.id, req.params.videoId, req.user.id);
        sendSuccess(res, 200, 'HOTEL_VIDEO_DELETED', 'Xóa video thành công');
    }
}
export const hotelController = new HotelController();
//# sourceMappingURL=hotel.controller.js.map