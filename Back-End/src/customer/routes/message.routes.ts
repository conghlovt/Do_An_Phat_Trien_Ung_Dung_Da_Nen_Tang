import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { authenticateCustomer, requireCustomer } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateCustomer, requireCustomer);

router.get('/messages', messageController.getMessages);
router.patch('/messages/:id/read', messageController.markMessageAsRead);

router.get('/notifications', messageController.getNotifications);
router.patch('/notifications/read-all', messageController.markAllNotificationsAsRead);
router.delete('/notifications', messageController.deleteAllNotifications);
router.delete('/notifications/:id', messageController.deleteNotification);

export default router;
