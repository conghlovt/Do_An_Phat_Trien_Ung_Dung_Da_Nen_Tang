import { type Request, type Response } from 'express';
import { reviewService } from '../../services/admin/review.service';
import { sendError, sendResponse } from '../../utils/response.util';

export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const reviews = await reviewService.getAllReviews({ q });
    return sendResponse(res, 200, 'Lấy danh sách đánh giá thành công.', reviews);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const review = await reviewService.updateReview(id, req.body);
    return sendResponse(res, 200, 'Cập nhật đánh giá thành công.', review);
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await reviewService.deleteReview(id);
    return sendResponse(res, 200, 'Xóa đánh giá thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};
