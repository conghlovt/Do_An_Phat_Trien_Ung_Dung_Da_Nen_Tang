import { Router } from 'express';
import * as userController from '../controllers/admin/user.controller';
import * as voucherController from '../controllers/admin/voucher.controller';
import * as propertyController from '../controllers/admin/property.controller';
import * as bookingController from '../controllers/admin/booking.controller';
import * as reviewController from '../controllers/admin/review.controller';
import * as contentController from '../controllers/admin/content.controller';
import * as permissionController from '../controllers/admin/permission.controller';
import * as financeController from '../controllers/admin/finance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionGuard, requireRootAdmin } from '../middlewares/admin-permission.middleware';

const router = Router();
const ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

router.use(authenticate, authorize(ADMIN_ROLES));

// Stats for dashboard
router.get('/stats', financeController.getStats);
router.get('/notifications', financeController.getNotifications);

// User management
router.get('/users', userController.getAllUsers);
router.post('/users', permissionGuard('users', 'edit'), userController.createUser);
router.put('/users/:id', permissionGuard('users', 'edit'), userController.updateUser);
router.put('/users/:id/status', permissionGuard('users', ['edit', 'approve']), userController.updateUserStatus);
router.delete('/users/:id', permissionGuard('users', 'delete'), userController.deleteUser);

// Permission management
router.get('/permissions', permissionController.getRolePermissions);
router.put('/permissions/:role', requireRootAdmin, permissionController.updateRolePermissions);

// Voucher management
router.get('/vouchers', voucherController.getAllVouchers);
router.post('/vouchers', permissionGuard('voucher', 'edit'), voucherController.createVoucher);
router.put('/vouchers/:id', permissionGuard('voucher', 'edit'), voucherController.updateVoucher);
router.delete('/vouchers/:id', permissionGuard('voucher', 'delete'), voucherController.deleteVoucher);

// Property management
router.get('/properties', propertyController.getProperties);
router.put('/properties/:id', permissionGuard('lodging', 'edit'), propertyController.updateProperty);
router.put('/properties/:id/status', permissionGuard('lodging', ['edit', 'approve']), propertyController.updatePropertyStatus);
router.delete('/properties/:id', permissionGuard('lodging', 'delete'), propertyController.deleteProperty);

// Booking management
router.get('/bookings', bookingController.getAllBookings);
router.put('/bookings/:id/status', permissionGuard('booking', ['edit', 'approve']), bookingController.updateBookingStatus);
router.delete('/bookings/:id', permissionGuard('booking', 'delete'), bookingController.deleteBooking);

// Review management
router.get('/reviews', reviewController.getAllReviews);
router.put('/reviews/:id', permissionGuard('reviews', ['edit', 'approve']), reviewController.updateReview);
router.delete('/reviews/:id', permissionGuard('reviews', 'delete'), reviewController.deleteReview);

// Content management
router.get('/content', contentController.getAllContent);
router.post('/content', permissionGuard('content', 'edit'), contentController.createContent);
router.put('/content/:id', permissionGuard('content', 'edit'), contentController.updateContent);
router.delete('/content/:id', permissionGuard('content', 'delete'), contentController.deleteContent);

// Finance management
router.get('/finance', financeController.getFinanceRecords);

export default router;
