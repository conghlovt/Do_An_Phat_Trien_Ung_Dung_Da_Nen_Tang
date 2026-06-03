import { type Request, type Response } from 'express';
import { adminExportService, type ExportResource } from '../services/export.service';
import { sendError } from '../../shared/utils/response.util';
import {
  getSearchQuery,
  getStringQuery,
  normalizeSortOrder,
  parseDateRangeFromQuery,
} from '../utils/admin-query.util';

export const exportResource = async (req: Request, res: Response) => {
  try {
    const rawResource = String(req.params.resource || '').trim().toLowerCase();
    const resource = (rawResource === 'hotels' ? 'properties' : rawResource) as ExportResource;
    const result = await adminExportService.exportResource({
      resource,
      requesterRole: (req as any).user?.role,
      search: getSearchQuery(req),
      status: getStringQuery(req, 'status'),
      scope: getStringQuery(req, 'scope'),
      hotelId: getStringQuery(req, 'hotelId'),
      role: getStringQuery(req, 'role'),
      city: getStringQuery(req, 'city'),
      propertyType: getStringQuery(req, 'propertyType'),
      rating: getStringQuery(req, 'rating'),
      paymentId: getStringQuery(req, 'paymentId'),
      month: getStringQuery(req, 'month'),
      category: getStringQuery(req, 'category'),
      sortBy: getStringQuery(req, 'sortBy'),
      sortOrder: normalizeSortOrder(req.query.sortOrder),
      dateRange: parseDateRangeFromQuery(req.query),
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(Buffer.from(result.buffer as any));
  } catch (error) {
    return sendError(res, error);
  }
};
