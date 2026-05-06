import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  console.log('--- Bắt đầu Seeding ---');

  // 1. Seed Users
  const users = [
    { email: 'admin@gmail.com', password: hashedPassword, username: 'Quản trị viên', role: 'SUPER_ADMIN', status: 'ACTIVE' },
    { email: 'partner@gmail.com', password: hashedPassword, username: 'Nguyễn Đối Tác', role: 'partner', status: 'ACTIVE' },
    { email: 'customer@gmail.com', password: hashedPassword, username: 'Trần Khách Hàng', role: 'customer', status: 'ACTIVE' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { 
        role: user.role as any, 
        status: user.status as any 
      } as any,
      create: user as any,
    });
  }
  const partner = await prisma.user.findUnique({ where: { email: 'partner@gmail.com' } });
  const customer = await prisma.user.findUnique({ where: { email: 'customer@gmail.com' } });

  console.log('✔ Đã seed người dùng');

  // 2. Seed Properties & Rooms
  if (partner) {
    const property = await prisma.property.create({
      data: {
        name: 'Khách sạn ABC Luxury',
        description: 'Khách sạn cao cấp tại trung tâm thành phố với đầy đủ tiện nghi.',
        address: '123 Đường Lê Lợi',
        city: 'Đà Nẵng',
        type: 'Hotel',
        status: 'ACTIVE',
        ownerId: partner.id,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945'],
        amenities: ['Wifi', 'Hồ bơi', 'Bữa sáng', 'Gym'],
        rooms: {
          create: [
            { name: 'Phòng Deluxe Giường Đôi', type: 'Double', price: 1200000, capacity: 2, totalRooms: 10, available: 8 },
            { name: 'Phòng Suite Hướng Biển', type: 'Suite', price: 2500000, capacity: 2, totalRooms: 5, available: 5 },
          ] as any,
        },
      } as any,
      include: { rooms: true },
    });

    console.log('✔ Đã seed cơ sở lưu trú và phòng');

    // 3. Seed Bookings
    if (customer && property.rooms[0]) {
      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          propertyId: property.id,
          roomId: property.rooms[0].id,
          checkIn: new Date('2024-06-01T14:00:00Z'),
          checkOut: new Date('2024-06-03T12:00:00Z'),
          guests: 2,
          totalPrice: 2400000,
          status: 'COMPLETED',
        } as any,
      });

      console.log('✔ Đã seed đơn đặt phòng');

      // 4. Seed Reviews
      await prisma.review.create({
        data: {
          userId: customer.id,
          bookingId: booking.id,
          rating: 5,
          comment: 'Phòng rất sạch sẽ, nhân viên phục vụ nhiệt tình. Sẽ quay lại!',
          status: 'APPROVED',
          reply: 'Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!',
        } as any,
      });
      console.log('✔ Đã seed đánh giá');
    }
  }

  // 5. Seed Vouchers
  await prisma.voucher.upsert({
    where: { code: 'CHAOBANMOI' },
    update: {},
    create: {
      code: 'CHAOBANMOI',
      discount: 20,
      type: 'PERCENTAGE',
      expiry: new Date('2025-12-31'),
      usageLimit: 100,
      status: 'ACTIVE',
    } as any,
  });
  console.log('✔ Đã seed mã giảm giá');

  // 6. Seed Content
  await prisma.contentPost.create({
    data: {
      title: 'Top 10 địa điểm du lịch Đà Nẵng không thể bỏ qua',
      category: 'Cẩm nang',
      excerpt: 'Đà Nẵng không chỉ nổi tiếng với những bãi biển đẹp mà còn có nhiều danh lam thắng cảnh...',
      body: 'Nội dung chi tiết về các địa điểm du lịch như Bà Nà Hills, Cầu Vàng, Bán đảo Sơn Trà...',
      status: 'PUBLISHED',
      thumbnail: 'https://images.unsplash.com/photo-1559592481-74488ea01cf2',
    } as any,
  });
  console.log('✔ Đã seed bài viết nội dung');

  console.log('--- Hoàn tất Seeding ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
