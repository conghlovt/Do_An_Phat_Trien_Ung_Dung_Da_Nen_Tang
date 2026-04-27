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
  deleteVoucher,
  updateBookingStatus,
  deleteProperty
} from '../controllers/admin.controller';

const router = Router();

// Stats for dashboard
router.get('/stats', getStats);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Voucher management
router.get('/vouchers', getAllVouchers);
router.post('/vouchers', createVoucher);
router.delete('/vouchers/:id', deleteVoucher);

// Property management
router.get('/properties', getProperties);
router.put('/properties/:id/status', updatePropertyStatus);
router.delete('/properties/:id', deleteProperty);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Finance management
router.get('/finance', getFinanceRecords);

export default router;
