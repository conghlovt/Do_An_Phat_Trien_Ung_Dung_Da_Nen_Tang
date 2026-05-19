import type { Request, Response } from 'express';
import type { AuthRequest } from '../../login/middlewares/auth.middleware';
export declare class HotelController {
    /** POST /api/v1/partner/hotels — Create hotel */
    create(req: AuthRequest, res: Response): Promise<void>;
    /** PUT /api/v1/partner/hotels/:id — Update hotel */
    update(req: AuthRequest, res: Response): Promise<void>;
    /** GET /api/v1/partner/hotels — List my hotels */
    listMyHotels(req: AuthRequest, res: Response): Promise<void>;
    /** GET /api/v1/partner/hotels/:id — Get hotel detail (owner) */
    getMyHotel(req: AuthRequest, res: Response): Promise<void>;
    /** POST /api/v1/partner/hotels/:id/submit — Submit for review */
    submitForReview(req: AuthRequest, res: Response): Promise<void>;
    /** DELETE /api/v1/partner/hotels/:id — Delete hotel */
    delete(req: AuthRequest, res: Response): Promise<void>;
    /** GET /api/v1/hotels — Public hotel list */
    listPublic(req: Request, res: Response): Promise<void>;
    /** GET /api/v1/hotels/:slug — Public hotel detail */
    getPublic(req: Request, res: Response): Promise<void>;
    /** POST /api/v1/partner/hotels/:id/images — Upload hotel images */
    uploadImages(req: AuthRequest, res: Response): Promise<void>;
    /** DELETE /api/v1/partner/hotels/:id/images/:imageId — Delete hotel image */
    deleteImage(req: AuthRequest, res: Response): Promise<void>;
    /** POST /api/v1/partner/hotels/:id/videos — Upload hotel video */
    uploadVideo(req: AuthRequest, res: Response): Promise<void>;
    /** DELETE /api/v1/partner/hotels/:id/videos/:videoId — Delete hotel video */
    deleteVideo(req: AuthRequest, res: Response): Promise<void>;
}
export declare const hotelController: HotelController;
//# sourceMappingURL=hotel.controller.d.ts.map