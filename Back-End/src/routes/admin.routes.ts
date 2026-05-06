import { Router } from 'express';
import { 
  getStats, 
  getAllUsers, 
  getProperties, 
  updatePropertyStatus, 
  getAllBookings, 
  getFinanceRecords,
  createUser,
  updateUser,
  deleteUser,
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  updateBookingStatus,
  deleteBooking,
  updateProperty,
  deleteProperty,
  getAllReviews,
  updateReview,
  deleteReview,
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
  getRolePermissions,
  updateRolePermissions,
  getNotifications
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionGuard, requireRootAdmin } from '../middlewares/admin-permission.middleware';

const router = Router();
const ADMIN_ROLES = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

router.use(authenticate, authorize(ADMIN_ROLES));

// Stats for dashboard
router.get('/stats', getStats);
router.get('/notifications', getNotifications);

// User management
router.get('/users', getAllUsers);
router.post('/users', permissionGuard('users', 'edit'), createUser);
router.put('/users/:id', permissionGuard('users', 'edit'), updateUser);
router.delete('/users/:id', permissionGuard('users', 'delete'), deleteUser);

// Permission management
router.get('/permissions', getRolePermissions);
router.put('/permissions/:role', requireRootAdmin, updateRolePermissions);

// Voucher management
router.get('/vouchers', getAllVouchers);
router.post('/vouchers', permissionGuard('voucher', 'edit'), createVoucher);
router.put('/vouchers/:id', permissionGuard('voucher', 'edit'), updateVoucher);
router.delete('/vouchers/:id', permissionGuard('voucher', 'delete'), deleteVoucher);

// Property management
router.get('/properties', getProperties);
router.put('/properties/:id', permissionGuard('lodging', 'edit'), updateProperty);
router.put('/properties/:id/status', permissionGuard('lodging', ['edit', 'approve']), updatePropertyStatus);
router.delete('/properties/:id', permissionGuard('lodging', 'delete'), deleteProperty);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', permissionGuard('booking', ['edit', 'approve']), updateBookingStatus);
router.delete('/bookings/:id', permissionGuard('booking', 'delete'), deleteBooking);

// Review management
router.get('/reviews', getAllReviews);
router.put('/reviews/:id', permissionGuard('reviews', ['edit', 'approve']), updateReview);
router.delete('/reviews/:id', permissionGuard('reviews', 'delete'), deleteReview);

// Content management
router.get('/content', getAllContent);
router.post('/content', permissionGuard('content', 'edit'), createContent);
router.put('/content/:id', permissionGuard('content', 'edit'), updateContent);
router.delete('/content/:id', permissionGuard('content', 'delete'), deleteContent);

// Finance management
router.get('/finance', getFinanceRecords);

export default router;
