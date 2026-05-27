import { Router } from 'express';
import * as userController from './controllers/user.controller';
import * as voucherController from './controllers/voucher.controller';
import * as propertyController from './controllers/property.controller';
import * as bookingController from './controllers/booking.controller';
import * as reviewController from './controllers/review.controller';
import * as contentController from './controllers/content.controller';
import * as permissionController from './controllers/permission.controller';
import * as financeController from './controllers/finance.controller';
import * as exportController from './controllers/export.controller';
import type { NextFunction, Request, Response } from 'express';
import { authenticate, authorize } from '../login/middlewares/auth.middleware';
import { permissionGuard, requireRootAdmin } from './middlewares/admin-permission.middleware';
import { sendResponse } from '../shared/utils/response.util';

const router = Router();
const ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];
const EXPORT_RESOURCE_MODULES: Record<string, Parameters<typeof permissionGuard>[0]> = {
  users: 'users',
  properties: 'lodging',
  hotels: 'lodging',
  bookings: 'booking',
  reviews: 'reviews',
  vouchers: 'voucher',
  finance: 'finance',
  content: 'content',
};

const exportPermissionGuard = (req: Request, res: Response, next: NextFunction) => {
  const moduleId = EXPORT_RESOURCE_MODULES[String(req.params.resource || '').toLowerCase()];
  if (!moduleId) {
    return sendResponse(res, 400, 'Unsupported export resource.', undefined, { code: 'EXPORT_RESOURCE_UNSUPPORTED' });
  }
  return permissionGuard(moduleId, 'export')(req as any, res, next);
};

router.use(authenticate, authorize(ADMIN_ROLES));

// Stats for dashboard
router.get('/stats', permissionGuard('dashboard', 'view'), financeController.getStats);
router.get('/notifications', permissionGuard('notifications', 'view'), financeController.getNotifications);
router.get('/export/:resource', exportPermissionGuard, exportController.exportResource);

// User management
router.get('/users', permissionGuard('users', 'view'), userController.getAllUsers);
router.post('/users', permissionGuard('users', 'create'), userController.createUser);
router.put('/users/:id', permissionGuard('users', 'update'), userController.updateUser);
router.put('/users/:id/status', permissionGuard('users', ['update', 'approve']), userController.updateUserStatus);
router.put('/users/:id/block', permissionGuard('users', ['update', 'approve']), userController.blockUser);
router.put('/users/:id/unblock', permissionGuard('users', ['update', 'approve']), userController.unblockUser);
router.delete('/users/:id', permissionGuard('users', 'delete'), userController.deleteUser);

// Permission management
router.get('/permissions', permissionGuard('roles', 'view'), permissionController.getRolePermissions);
router.get('/permissions/:role', permissionGuard('roles', 'view'), permissionController.getRolePermission);
router.put('/permissions/:role', requireRootAdmin, permissionGuard('roles', 'update'), permissionController.updateRolePermissions);
router.get('/roles/permissions', permissionGuard('roles', 'view'), permissionController.getRolePermissions);
router.get('/roles/:role/permissions', permissionGuard('roles', 'view'), permissionController.getRolePermission);
router.put('/roles/:role/permissions', requireRootAdmin, permissionGuard('roles', 'update'), permissionController.updateRolePermissions);

// Voucher management
router.get('/vouchers', permissionGuard('voucher', 'view'), voucherController.getAllVouchers);
router.post('/vouchers', permissionGuard('voucher', 'create'), voucherController.createVoucher);
router.put('/vouchers/:id', permissionGuard('voucher', 'update'), voucherController.updateVoucher);
router.delete('/vouchers/:id', permissionGuard('voucher', 'delete'), voucherController.deleteVoucher);

// Property management
router.get('/properties', permissionGuard('lodging', 'view'), propertyController.getProperties);
router.put('/properties/:id', permissionGuard('lodging', 'update'), propertyController.updateProperty);
router.put('/properties/:id/status', permissionGuard('lodging', ['update', 'approve']), propertyController.updatePropertyStatus);
router.delete('/properties/:id', permissionGuard('lodging', 'delete'), propertyController.deleteProperty);

// Booking management
router.get('/bookings', permissionGuard('booking', 'view'), bookingController.getAllBookings);
router.put('/bookings/:id/status', permissionGuard('booking', ['update', 'approve']), bookingController.updateBookingStatus);
router.delete('/bookings/:id', permissionGuard('booking', 'delete'), bookingController.deleteBooking);

// Review management
router.get('/reviews', permissionGuard('reviews', 'view'), reviewController.getAllReviews);
router.put('/reviews/:id', permissionGuard('reviews', ['update', 'approve']), reviewController.updateReview);
router.delete('/reviews/:id', permissionGuard('reviews', 'delete'), reviewController.deleteReview);

// Content management
router.get('/content', permissionGuard('content', 'view'), contentController.getAllContent);
router.post('/content', permissionGuard('content', 'create'), contentController.createContent);
router.put('/content/:id', permissionGuard('content', 'update'), contentController.updateContent);
router.delete('/content/:id', permissionGuard('content', 'delete'), contentController.deleteContent);

// Finance management
router.get('/finance', permissionGuard('finance', 'view'), financeController.getFinanceRecords);

export default router;
