import prisma from '../../login/lib/prisma';
import { AppError } from '../../shared/utils/app-error.util';
import type {
  CustomerNotificationDto,
  CustomerNotificationType,
} from '../models/notification.model';

const CUSTOMER_SEED_EMAIL = 'customer@gmail.com';

const resolveCustomerId = async (userId?: string): Promise<string> => {
  if (userId) return userId;

  const seededCustomer = await prisma.user.findUnique({
    where: { email: CUSTOMER_SEED_EMAIL },
    select: { id: true },
  });

  if (!seededCustomer) {
    throw new AppError(404, 'RESOURCE_NOT_FOUND', {
      userMessage: 'Không tìm thấy dữ liệu customer trong seed.',
    });
  }

  return seededCustomer.id;
};

type CustomerNotificationRecord = Awaited<ReturnType<typeof prisma.customerNotification.findMany>>[number];

const mapNotification = (notification: CustomerNotificationRecord): CustomerNotificationDto => ({
  id: notification.id,
  type: notification.type as CustomerNotificationType,
  title: notification.title,
  description: notification.description,
  time: notification.time,
  isRead: notification.isRead,
});

export const findNotifications = async (
  userId?: string,
): Promise<CustomerNotificationDto[]> => {
  const customerId = await resolveCustomerId(userId);

  const notifications = await prisma.customerNotification.findMany({
    where: { userId: customerId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return notifications.map(mapNotification);
};

export const markAllNotificationsAsRead = async (
  userId?: string,
): Promise<CustomerNotificationDto[]> => {
  const customerId = await resolveCustomerId(userId);

  await prisma.customerNotification.updateMany({
    where: { userId: customerId, isRead: false },
    data: { isRead: true },
  });

  return findNotifications(customerId);
};

export const deleteAllNotifications = async (userId?: string): Promise<CustomerNotificationDto[]> => {
  const customerId = await resolveCustomerId(userId);

  await prisma.customerNotification.deleteMany({
    where: { userId: customerId },
  });

  return [];
};

export const deleteNotification = async (
  id: string,
  userId?: string,
): Promise<CustomerNotificationDto[]> => {
  const customerId = await resolveCustomerId(userId);

  const result = await prisma.customerNotification.deleteMany({
    where: { id, userId: customerId },
  });

  if (result.count === 0) {
    throw new AppError(404, 'RESOURCE_NOT_FOUND', {
      userMessage: 'Không tìm thấy thông báo.',
    });
  }

  return findNotifications(customerId);
};
