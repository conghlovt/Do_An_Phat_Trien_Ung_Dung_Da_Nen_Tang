import prisma from '../../lib/prisma';

export const financeService = {
  getFinanceRecords: async () => {
    return await prisma.finance.findMany({ orderBy: { createdAt: 'desc' } });
  },

  getStats: async () => {
    const [totalUsers, totalProperties, totalBookings, totalRevenue, pendingReviews] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      totalProperties,
      totalBookings,
      pendingReviews,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      trends: {
        revenue: 12.5,
        bookings: 8.2,
        users: -2.4,
        partners: 15.0,
      },
    };
  },

  getNotifications: async () => {
    const [pendingProperties, pendingBookings, pendingReviews, recentUsers] = await Promise.all([
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, username: true, role: true, createdAt: true },
      }),
    ]);

    return [
      ...(pendingProperties
        ? [{ id: 'pending-properties', type: 'lodging', title: 'Co so luu tru cho duyet', message: `${pendingProperties} co so dang cho duyet`, tab: 'lodging' }]
        : []),
      ...(pendingBookings
        ? [{ id: 'pending-bookings', type: 'booking', title: 'Booking cho xu ly', message: `${pendingBookings} booking dang cho xu ly`, tab: 'booking' }]
        : []),
      ...(pendingReviews
        ? [{ id: 'pending-reviews', type: 'reviews', title: 'Danh gia moi', message: `${pendingReviews} danh gia dang cho duyet`, tab: 'reviews' }]
        : []),
      ...recentUsers.map((item) => ({
        id: `user-${item.id}`,
        type: 'users',
        title: 'Nguoi dung moi',
        message: `${item.username} (${item.role}) vua tham gia`,
        tab: item.role === 'customer' ? 'customers' : item.role === 'partner' ? 'partners' : 'admins',
        createdAt: item.createdAt,
      })),
    ];
  },
};
