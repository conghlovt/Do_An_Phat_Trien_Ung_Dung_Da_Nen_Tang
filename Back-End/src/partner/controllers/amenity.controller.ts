import type { Request, Response, NextFunction } from 'express';
import { amenityService } from '../services/amenity.service';
import { sendSuccess } from '../../shared/utils/response.util';

export class AmenityController {
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const amenities = await amenityService.listAll();
      sendSuccess(res, 200, 'AMENITIES_LIST', 'Danh sách tiện ích', amenities);
    } catch (error) {
      next(error);
    }
  }
}

export const amenityController = new AmenityController();
