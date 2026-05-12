import { type Request, type Response } from 'express';
import { contentService } from '../services/content.service';
import { sendError, sendResponse } from '../../shared/utils/response.util';
import { USER_MESSAGES } from '../../shared/utils/app-error.util';

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    const posts = await contentService.getAllContent({ q });
    return sendResponse(res, 200, 'Lấy danh sách bài viết thành công.', posts);
  } catch (error) {
    return sendError(res, error);
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { title, category, body } = req.body;
    if (!title || !category || !body) {
      return sendResponse(res, 400, USER_MESSAGES.CONTENT_REQUIRED_FIELDS);
    }
    const requesterId = (req as any).user?.id;
    const post = await contentService.createContent(req.body, requesterId);
    return sendResponse(res, 201, 'Tạo bài viết thành công.', post);
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const post = await contentService.updateContent(id, req.body);
    return sendResponse(res, 200, 'Cập nhật bài viết thành công.', post);
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await contentService.deleteContent(id);
    return sendResponse(res, 200, 'Xóa bài viết thành công.');
  } catch (error) {
    return sendError(res, error);
  }
};
