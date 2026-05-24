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

      if (customer) {
    const customerMessages = [
      {
        code: 'booking-confirmed-sg',
        hotelName: 'Sài Gòn Hotel',
        preview: 'Đơn đặt phòng của bạn đã được xác nhận. Vui lòng kiểm tra thời gian nhận phòng.',
        time: '5 phút trước',
        isRead: false,
        sortOrder: 0,
      },
      {
        code: 'upgrade-offer-hanoi',
        hotelName: 'Hanoi Boutique Hotel',
        preview: 'Khách sạn đã gửi ưu đãi nâng hạng phòng cho lượt đặt tiếp theo.',
        time: '22 phút trước',
        isRead: false,
        sortOrder: 1,
      },
      {
        code: 'thank-you-green',
        hotelName: 'Green River Hotel',
        preview: 'Cảm ơn bạn đã sử dụng StayHub. Chúc bạn có trải nghiệm tốt.',
        time: 'Hôm qua',
        isRead: true,
        sortOrder: 2,
      },
    ];

    for (const message of customerMessages) {
      await prisma.customerMessage.upsert({
        where: { code: message.code },
        update: {
          userId: customer.id,
          hotelName: message.hotelName,
          preview: message.preview,
          time: message.time,
          isRead: message.isRead,
          sortOrder: message.sortOrder,
        },
        create: {
          ...message,
          userId: customer.id,
        },
      });
    }

    const customerNotifications = [
      {
        code: 'booking-confirmed',
        type: 'booking',
        title: 'Xác nhận đặt phòng',
        description: 'Đặt phòng của bạn tại Sài Gòn Hotel đã được xác nhận',
        isRead: false,
        time: '2 phút trước',
        sortOrder: 0,
      },
      {
        code: 'special-offer',
        type: 'offers',
        title: 'Ưu đãi đặc biệt',
        description: 'Giảm 20% cho lần đặt phòng tiếp theo',
        isRead: false,
        time: '15 phút trước',
        sortOrder: 1,
      },
      {
        code: 'checkin-reminder',
        type: 'booking',
        title: 'Nhắc nhở check-in',
        description: 'Bạn sắp phải check-in tại khách sạn',
        isRead: true,
        time: 'Hôm qua',
        sortOrder: 2,
      },
    ];

    for (const notification of customerNotifications) {
      await prisma.customerNotification.upsert({
        where: { code: notification.code },
        update: {
          userId: customer.id,
          type: notification.type as any,
          title: notification.title,
          description: notification.description,
          time: notification.time,
          isRead: notification.isRead,
          sortOrder: notification.sortOrder,
        },
        create: {
          ...notification,
          userId: customer.id,
          type: notification.type as any,
        },
      });
    }

    console.log('✔ Đã seed tin nhắn và thông báo customer');
  }

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

  // 7. Seed Amenities
  const amenityData = [
    // General
    { name: 'Wi-Fi miễn phí', slug: 'wifi', icon: '📶', category: 'general' },
    { name: 'Bãi đỗ xe ô tô', slug: 'parking', icon: '🅿️', category: 'general' },
    { name: 'Thang máy', slug: 'elevator', icon: '🛗', category: 'general' },
    { name: 'Lễ tân 24/24', slug: 'reception-24h', icon: '🏪', category: 'general' },
    { name: 'Nhận phòng sớm', slug: 'early-checkin', icon: '⏰', category: 'general' },
    { name: 'Trả phòng muộn', slug: 'late-checkout', icon: '🕐', category: 'general' },
    { name: 'Cho phép thú cưng', slug: 'pet-friendly', icon: '🐾', category: 'general' },
    { name: 'Không hút thuốc', slug: 'no-smoking', icon: '🚭', category: 'general' },

    // Room
    { name: 'Điều hoà', slug: 'air-conditioning', icon: '❄️', category: 'room' },
    { name: 'Tivi', slug: 'tv', icon: '📺', category: 'room' },
    { name: 'Tủ lạnh', slug: 'mini-fridge', icon: '🧊', category: 'room' },
    { name: 'Két sắt', slug: 'safe-box', icon: '🔐', category: 'room' },
    { name: 'Bàn làm việc', slug: 'desk', icon: '🖥️', category: 'room' },
    { name: 'Ấm đun nước', slug: 'kettle', icon: '☕', category: 'room' },
    { name: 'Máy sấy tóc', slug: 'hair-dryer', icon: '💇', category: 'room' },
    { name: 'Dép đi trong phòng', slug: 'slippers', icon: '🩴', category: 'room' },

    // Bathroom
    { name: 'Vòi sen', slug: 'shower', icon: '🚿', category: 'bathroom' },
    { name: 'Bồn tắm', slug: 'bathtub', icon: '🛁', category: 'bathroom' },
    { name: 'Đồ vệ sinh cá nhân', slug: 'toiletries', icon: '🧴', category: 'bathroom' },
    { name: 'Khăn tắm', slug: 'towels', icon: '🧹', category: 'bathroom' },
    { name: 'Áo choàng tắm', slug: 'bathrobe', icon: '👘', category: 'bathroom' },

    // Entertainment
    { name: 'Hồ bơi', slug: 'pool', icon: '🏊', category: 'entertainment' },
    { name: 'Phòng gym', slug: 'gym', icon: '🏋️', category: 'entertainment' },
    { name: 'Spa & Massage', slug: 'spa', icon: '💆', category: 'entertainment' },
    { name: 'Karaoke', slug: 'karaoke', icon: '🎤', category: 'entertainment' },
    { name: 'Khu vui chơi trẻ em', slug: 'kids-play', icon: '🧒', category: 'entertainment' },
    { name: 'Sân vườn', slug: 'garden', icon: '🌳', category: 'entertainment' },

    // Safety
    { name: 'Camera an ninh', slug: 'cctv', icon: '📹', category: 'safety' },
    { name: 'Bảo vệ 24/7', slug: 'security-guard', icon: '👮', category: 'safety' },
    { name: 'Bình chữa cháy', slug: 'fire-extinguisher', icon: '🧯', category: 'safety' },
    { name: 'Lối thoát hiểm', slug: 'emergency-exit', icon: '🚪', category: 'safety' },
    { name: 'Khóa thẻ từ', slug: 'keycard', icon: '🔑', category: 'safety' },

    // Service
    { name: 'Bữa sáng', slug: 'breakfast', icon: '🍳', category: 'service' },
    { name: 'Nhà hàng', slug: 'restaurant', icon: '🍽️', category: 'service' },
    { name: 'Quầy bar', slug: 'bar', icon: '🍸', category: 'service' },
    { name: 'Dịch vụ phòng', slug: 'room-service', icon: '🛎️', category: 'service' },
    { name: 'Giặt ủi', slug: 'laundry', icon: '👔', category: 'service' },
    { name: 'Đưa đón sân bay', slug: 'airport-shuttle', icon: '🚐', category: 'service' },
    { name: 'Cho thuê xe', slug: 'car-rental', icon: '🚗', category: 'service' },
  ];
  
  for (const amenity of amenityData) {
    await prisma.amenity.upsert({
      where: { slug: amenity.slug },
      update: { name: amenity.name, icon: amenity.icon, category: amenity.category as any },
      create: { ...amenity, category: amenity.category as any, isActive: true },
    });
  }
  console.log(`✔ Đã seed ${amenityData.length} tiện ích`);


  await seedHotelCards();

  await seedVouchers();

  console.log('--- Hoàn tất ---');
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

const hotelData = [
  // Flash Sale – Theo giờ
  { name: 'Nguyễn Anh Hotel - 27 Nguyễn Chí Thanh', rating: 4.9, reviews: 6253,  location: 'Đống Đa',     district: 'Đống Đa',     discount: 'Mã giảm 10%',        price: '200.000đ',   priceValue: 200000,  unit: '/ 2 giờ', oldPrice: '250.000đ', image: 'https://images.unsplash.com/photo-1662841540530-2f04bb3291e8?q=80&w=600', badge: '',       tags: ['Theo giờ', 'Flash Sale'] },
  { name: 'Kim Hotel - Dịch Vọng',                   rating: 4.9, reviews: 11186, location: 'Cầu Giấy',    district: 'Cầu Giấy',    discount: 'Mã giảm 10%',        price: '225.000đ',   priceValue: 225000,  unit: '/ 2 giờ', oldPrice: '300.000đ', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600', badge: 'Nổi bật', tags: ['Theo giờ', 'Flash Sale', 'Nổi bật'] },
  { name: 'An Phú Hotel',                            rating: 4.7, reviews: 233,   location: 'Cầu Giấy',    district: 'Cầu Giấy',    discount: 'Mã giảm 28K',        price: '120.000đ',   priceValue: 120000,  unit: '/ 2 giờ', oldPrice: '160.000đ', image: 'https://images.unsplash.com/photo-1662841540530-2f04bb3291e8?q=80&w=600', badge: 'Nổi bật', tags: ['Theo giờ', 'Flash Sale', 'Nổi bật'] },
  { name: 'Green Star Hotel',                        rating: 4.6, reviews: 3120,  location: 'Tây Hồ',      district: 'Tây Hồ',      discount: 'Mã giảm 20%',        price: '180.000đ',   priceValue: 180000,  unit: '/ 2 giờ', oldPrice: '225.000đ', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600', badge: '',       tags: ['Theo giờ', 'Flash Sale'] },
  // Flash Sale – Qua đêm
  { name: 'Lotus Boutique Hotel',                    rating: 4.8, reviews: 842,   location: 'Hoàn Kiếm',   district: 'Hoàn Kiếm',   discount: 'Mã giảm 15%',        price: '450.000đ',   priceValue: 450000,  unit: '/ đêm',   oldPrice: '530.000đ', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600', badge: 'Nổi bật', tags: ['Qua đêm', 'Flash Sale', 'Nổi bật'] },
  { name: 'Suji Hotel',                              rating: 4.9, reviews: 132,   location: 'Nam Từ Liêm', district: 'Nam Từ Liêm', discount: 'Mã giảm 17%',        price: '350.000đ',   priceValue: 350000,  unit: '/ đêm',   oldPrice: '420.000đ', image: 'https://images.unsplash.com/photo-1723465308831-29da05e011f3?q=80&w=600', badge: 'Nổi bật', tags: ['Qua đêm', 'Flash Sale'] },
  { name: 'Moon River Hotel',                        rating: 4.7, reviews: 561,   location: 'Long Biên',   district: 'Long Biên',   discount: 'Mã giảm 12%',        price: '390.000đ',   priceValue: 390000,  unit: '/ đêm',   oldPrice: '440.000đ', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600', badge: '',       tags: ['Qua đêm', 'Flash Sale'] },
  // Ưu đãi đặc biệt
  { name: 'Silk Path Grand Hanoi',                   rating: 4.9, reviews: 2870,  location: 'Hoàn Kiếm',   district: 'Hoàn Kiếm',   discount: 'Ưu đãi 25%',         price: '680.000đ',   priceValue: 680000,  unit: '/ đêm',   oldPrice: '900.000đ',    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600', badge: 'Ưu đãi', tags: ['Ưu đãi', 'Qua đêm'] },
  { name: 'Capella Hanoi Hotel',                     rating: 4.8, reviews: 1540,  location: 'Hoàn Kiếm',   district: 'Hoàn Kiếm',   discount: 'Ưu đãi 30%',         price: '1.200.000đ', priceValue: 1200000, unit: '/ đêm',   oldPrice: '1.700.000đ',  image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600', badge: 'Ưu đãi', tags: ['Ưu đãi', 'Qua đêm', 'Nổi bật'] },
  { name: 'Lotte Hotel Hanoi',                       rating: 4.9, reviews: 4200,  location: 'Ba Đình',      district: 'Ba Đình',      discount: 'Ưu đãi 20%',         price: '1.500.000đ', priceValue: 1500000, unit: '/ đêm',   oldPrice: '1.900.000đ',  image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600', badge: '',       tags: ['Ưu đãi', 'Qua đêm'] },
  { name: 'Sofitel Legend Metropole',                rating: 5.0, reviews: 8763,  location: 'Hoàn Kiếm',   district: 'Hoàn Kiếm',   discount: 'Ưu đãi đặc biệt',    price: '2.800.000đ', priceValue: 2800000, unit: '/ đêm',   oldPrice: '3.500.000đ',  image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600', badge: 'VIP',    tags: ['Ưu đãi', 'Qua đêm', 'Nổi bật'] },
  // StayHub gợi ý
  { name: 'Vy House Hotel',                          rating: 4.9, reviews: 1153,  location: 'Thanh Xuân',  district: 'Thanh Xuân',  discount: 'Mã giảm 28K',        price: '250.000đ',   priceValue: 250000,  unit: '/ 2 giờ', oldPrice: '',         image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600', badge: '',       tags: ['Gợi ý', 'Theo giờ'] },
  { name: 'Lavie Hotel',                             rating: 4.9, reviews: 1307,  location: 'Thanh Xuân',  district: 'Thanh Xuân',  discount: 'Mã giảm 10%',        price: '199.000đ',   priceValue: 199000,  unit: '/ 2 giờ', oldPrice: '250.000đ', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600', badge: 'Gợi ý',  tags: ['Gợi ý', 'Theo giờ'] },
  { name: 'Hermosa Boutique Hotel',                  rating: 4.8, reviews: 672,   location: 'Đống Đa',     district: 'Đống Đa',     discount: 'Mã giảm 15%',        price: '320.000đ',   priceValue: 320000,  unit: '/ đêm',   oldPrice: '380.000đ', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600', badge: '',       tags: ['Gợi ý', 'Qua đêm'] },
  { name: 'Sunflower Hotel',                         rating: 4.7, reviews: 430,   location: 'Hà Đông',     district: 'Hà Đông',     discount: 'Mã giảm 20K',        price: '180.000đ',   priceValue: 180000,  unit: '/ 2 giờ', oldPrice: '',         image: 'https://images.unsplash.com/photo-1662841540530-2f04bb3291e8?q=80&w=600', badge: '',       tags: ['Gợi ý', 'Theo giờ'] },
  // Top được bình chọn
  { name: 'Min Hotel Thanh Xuân',                    rating: 4.9, reviews: 4773,  location: 'Thanh Xuân',  district: 'Thanh Xuân',  discount: 'Mã giảm 10%',        price: '270.000đ',   priceValue: 270000,  unit: '/ 2 giờ', oldPrice: '',         image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600', badge: 'Top #1', tags: ['Nổi bật', 'Theo giờ'] },
  { name: 'Crystal Palace Hotel',                    rating: 4.9, reviews: 3891,  location: 'Cầu Giấy',    district: 'Cầu Giấy',    discount: 'Mã giảm 15%',        price: '550.000đ',   priceValue: 550000,  unit: '/ đêm',   oldPrice: '650.000đ', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600', badge: 'Top #2', tags: ['Nổi bật', 'Qua đêm'] },
  { name: 'Hanoi Centre Hotel',                      rating: 4.8, reviews: 2645,  location: 'Hoàn Kiếm',   district: 'Hoàn Kiếm',   discount: 'Mã giảm 12%',        price: '420.000đ',   priceValue: 420000,  unit: '/ đêm',   oldPrice: '480.000đ', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600', badge: 'Top #3', tags: ['Nổi bật', 'Qua đêm'] },
  { name: 'Golden Key Hotel',                        rating: 4.8, reviews: 1988,  location: 'Đống Đa',     district: 'Đống Đa',     discount: 'Mã giảm 28K',        price: '240.000đ',   priceValue: 240000,  unit: '/ 2 giờ', oldPrice: '',         image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600', badge: 'Top #4', tags: ['Nổi bật', 'Theo giờ'] },
  // Khách sạn mới
  { name: 'Aurora Hanoi Hotel',                      rating: 4.8, reviews: 42,    location: 'Nam Từ Liêm', district: 'Nam Từ Liêm', discount: 'Khai trương -20%',    price: '280.000đ',   priceValue: 280000,  unit: '/ 2 giờ', oldPrice: '350.000đ', image: 'https://images.unsplash.com/photo-1723465308831-29da05e011f3?q=80&w=600', badge: 'Mới',    tags: ['Mới', 'Theo giờ'] },
  { name: 'The Canopy Residences',                   rating: 4.7, reviews: 18,    location: 'Tây Hồ',      district: 'Tây Hồ',      discount: 'Khai trương -25%',    price: '620.000đ',   priceValue: 620000,  unit: '/ đêm',   oldPrice: '820.000đ', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600', badge: 'Mới',    tags: ['Mới', 'Qua đêm'] },
  { name: 'Urban Nest Boutique',                     rating: 4.9, reviews: 7,     location: 'Hoàng Mai',   district: 'Hoàng Mai',   discount: 'Khai trương -15%',    price: '200.000đ',   priceValue: 200000,  unit: '/ 2 giờ', oldPrice: '240.000đ', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600', badge: 'Mới',    tags: ['Mới', 'Theo giờ'] },
  { name: 'Altitude Sky Hotel',                      rating: 4.8, reviews: 29,    location: 'Cầu Giấy',    district: 'Cầu Giấy',    discount: 'Khai trương -30%',    price: '750.000đ',   priceValue: 750000,  unit: '/ đêm',   oldPrice: '1.050.000đ', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600', badge: 'Mới', tags: ['Mới', 'Qua đêm', 'Nổi bật'] },
];

const imagePool = [
  'https://images.unsplash.com/photo-1662841540530-2f04bb3291e8?q=80&w=600',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=600',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=600',
  'https://images.unsplash.com/photo-1723465308831-29da05e011f3?q=80&w=600',
];

const locations = [
  { city: 'Hà Nội', area: 'Hoàn Kiếm' },
  { city: 'Hà Nội', area: 'Cầu Giấy' },
  { city: 'Hà Nội', area: 'Ba Đình' },
  { city: 'Hà Nội', area: 'Tây Hồ' },

  { city: 'TP. Hồ Chí Minh', area: 'Quận 1' },
  { city: 'TP. Hồ Chí Minh', area: 'Quận 3' },
  { city: 'TP. Hồ Chí Minh', area: 'Bình Thạnh' },
  { city: 'TP. Hồ Chí Minh', area: 'Phú Nhuận' },

  { city: 'Đà Nẵng', area: 'Hải Châu' },
  { city: 'Đà Nẵng', area: 'Sơn Trà' },
  { city: 'Đà Nẵng', area: 'Ngũ Hành Sơn' },

  { city: 'Hải Phòng', area: 'Hồng Bàng' },
  { city: 'Hải Phòng', area: 'Lê Chân' },
  { city: 'Hải Phòng', area: 'Đồ Sơn' },

  { city: 'Quảng Ninh', area: 'Hạ Long' },
  { city: 'Quảng Ninh', area: 'Cẩm Phả' },
  { city: 'Quảng Ninh', area: 'Móng Cái' },

  { city: 'Huế', area: 'Trung tâm Huế' },
  { city: 'Huế', area: 'Phú Hội' },

  { city: 'Khánh Hòa', area: 'Nha Trang' },
  { city: 'Khánh Hòa', area: 'Cam Ranh' },

  { city: 'Lâm Đồng', area: 'Đà Lạt' },
  { city: 'Lâm Đồng', area: 'Bảo Lộc' },

  { city: 'Bình Định', area: 'Quy Nhơn' },
  { city: 'Phú Yên', area: 'Tuy Hòa' },
  { city: 'Bình Thuận', area: 'Phan Thiết' },

  { city: 'Bà Rịa - Vũng Tàu', area: 'Vũng Tàu' },
  { city: 'Bà Rịa - Vũng Tàu', area: 'Long Hải' },

  { city: 'Cần Thơ', area: 'Ninh Kiều' },
  { city: 'Cần Thơ', area: 'Cái Răng' },

  { city: 'An Giang', area: 'Long Xuyên' },
  { city: 'Kiên Giang', area: 'Phú Quốc' },
  { city: 'Kiên Giang', area: 'Rạch Giá' },

  { city: 'Lào Cai', area: 'Sa Pa' },
  { city: 'Ninh Bình', area: 'Tràng An' },
  { city: 'Thanh Hóa', area: 'Sầm Sơn' },
  { city: 'Nghệ An', area: 'Cửa Lò' },
];

type HotelTag = string;

type HotelCardSeed = {
  name: string;
  rating: number;
  reviews: number;
  city?: string;
  area?: string;
  location: string;
  district: string;
  discount: string;
  price: string;
  priceValue: number;
  unit: string;
  oldPrice?: string;
  image: string;
  badge?: string;
  tags: HotelTag[];
};

type CreateHotelInput = {
  name: string;
  index: number;
  city: string;
  area: string;
  rating: number;
  reviews: number;
  discount: string;
  priceValue: number;
  unit: string;
  oldPriceValue?: number;
  badge: string;
  tags: HotelTag[];
}

const cleanUrl = (url: string) => url.replace(/&amp;/g, '&');

const formatPrice = (value: number) => {
  return value.toLocaleString('vi-VN') + 'đ';
};

const slugify = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getPlace = (index: number) => {
  return locations[index % locations.length];
};

const createHotel = ({
  name,
  index,
  city,
  area,
  rating,
  reviews,
  discount,
  priceValue,
  unit,
  oldPriceValue,
  badge,
  tags,
}: CreateHotelInput): HotelCardSeed => ({
  name,
  rating,
  reviews,
  city,
  area,

  // Tương thích UI cũ
  location: area,
  district: area,

  discount,
  price: formatPrice(priceValue),
  priceValue,
  unit,
  oldPrice: oldPriceValue ? formatPrice(oldPriceValue) : '',
  image: cleanUrl(imagePool[index % imagePool.length]),
  badge,
  tags,
});

const normalizeManualHotelData = (items: HotelCardSeed[]): HotelCardSeed[] => {
  return items.map((hotel) => ({
    ...hotel,
    city: hotel.city ?? 'Hà Nội',
    area: hotel.area ?? hotel.district ?? hotel.location,
    image: cleanUrl(hotel.image),
  }));
};

// Flash Sale – Theo giờ
const flashSaleHourlyHotels: HotelCardSeed[] = Array.from({ length: 20 }, (_, i) => {
  const place = getPlace(i);
  const priceValue = 130000 + i * 7000;

  return createHotel({
    name: `Flash Hour Hotel ${i + 1} - ${place.area}, ${place.city}`,
    index: i,
    city: place.city,
    area: place.area,
    rating: Number((4.6 + (i % 4) * 0.1).toFixed(1)),
    reviews: 350 + i * 217,
    discount: i % 2 === 0 ? 'Mã giảm 10%' : 'Mã giảm 28K',
    priceValue,
    unit: '/ 2 giờ',
    oldPriceValue: priceValue + 50000,
    badge: i % 5 === 0 ? 'Nổi bật' : '',
    tags: i % 5 === 0 ? ['Theo giờ', 'Flash Sale', 'Nổi bật'] : ['Theo giờ', 'Flash Sale'],
  });
});

// Flash Sale – Qua đêm
const flashSaleOvernightHotels: HotelCardSeed[] = Array.from({ length: 20 }, (_, i) => {
  const place = getPlace(i + 5);
  const priceValue = 320000 + i * 18000;

  return createHotel({
    name: `Night Deal Hotel ${i + 1} - ${place.area}, ${place.city}`,
    index: i + 20,
    city: place.city,
    area: place.area,
    rating: Number((4.6 + (i % 4) * 0.1).toFixed(1)),
    reviews: 420 + i * 189,
    discount: i % 2 === 0 ? 'Mã giảm 15%' : 'Mã giảm 17%',
    priceValue,
    unit: '/ đêm',
    oldPriceValue: priceValue + 90000,
    badge: i % 4 === 0 ? 'Nổi bật' : '',
    tags: i % 4 === 0 ? ['Qua đêm', 'Flash Sale', 'Nổi bật'] : ['Qua đêm', 'Flash Sale'],
  });
});

// Ưu đãi đặc biệt
const specialOfferHotels: HotelCardSeed[] = Array.from({ length: 20 }, (_, i) => {
  const place = getPlace(i + 10);
  const priceValue = 650000 + i * 65000;

  return createHotel({
    name: `Premium Stay Hotel ${i + 1} - ${place.area}, ${place.city}`,
    index: i + 40,
    city: place.city,
    area: place.area,
    rating: Number((4.7 + (i % 3) * 0.1).toFixed(1)),
    reviews: 800 + i * 260,
    discount: i % 3 === 0 ? 'Ưu đãi đặc biệt' : `Ưu đãi ${20 + (i % 4) * 5}%`,
    priceValue,
    unit: '/ đêm',
    oldPriceValue: priceValue + 250000,
    badge: i % 6 === 0 ? 'VIP' : 'Ưu đãi',
    tags: i % 4 === 0 ? ['Ưu đãi', 'Qua đêm', 'Nổi bật'] : ['Ưu đãi', 'Qua đêm'],
  });
});

// StayHub gợi ý
const stayHubSuggestHotels: HotelCardSeed[] = Array.from({ length: 20 }, (_, i) => {
  const place = getPlace(i + 15);
  const isHourly = i % 2 === 0;
  const priceValue = isHourly ? 180000 + i * 6000 : 360000 + i * 14000;

  return createHotel({
    name: `StayHub Choice Hotel ${i + 1} - ${place.area}, ${place.city}`,
    index: i + 60,
    city: place.city,
    area: place.area,
    rating: Number((4.7 + (i % 3) * 0.1).toFixed(1)),
    reviews: 250 + i * 145,
    discount: i % 2 === 0 ? 'Mã giảm 28K' : 'Mã giảm 10%',
    priceValue,
    unit: isHourly ? '/ 2 giờ' : '/ đêm',
    oldPriceValue: i % 3 === 0 ? priceValue + 60000 : undefined,
    badge: i % 4 === 0 ? 'Gợi ý' : '',
    tags: isHourly ? ['Gợi ý', 'Theo giờ'] : ['Gợi ý', 'Qua đêm'],
  });
});

// Top được bình chọn
const topRatedHotels: HotelCardSeed[] = Array.from({ length: 20 }, (_, i) => {
  const place = getPlace(i + 20);
  const isHourly = i % 2 === 0;
  const priceValue = isHourly ? 230000 + i * 8000 : 480000 + i * 20000;

  return createHotel({
    name: `Top Rated Hotel ${i + 1} - ${place.area}, ${place.city}`,
    index: i + 80,
    city: place.city,
    area: place.area,
    rating: Number((4.8 + (i % 2) * 0.1).toFixed(1)),
    reviews: 1500 + i * 315,
    discount: i % 2 === 0 ? 'Mã giảm 10%' : 'Mã giảm 15%',
    priceValue,
    unit: isHourly ? '/ 2 giờ' : '/ đêm',
    oldPriceValue: isHourly ? priceValue + 50000 : priceValue + 120000,
    badge: `Top #${i + 5}`,
    tags: isHourly ? ['Nổi bật', 'Theo giờ'] : ['Nổi bật', 'Qua đêm'],
  });
});

// Khách sạn mới
const newHotels: HotelCardSeed[] = Array.from({ length: 20 }, (_, i) => {
  const place = getPlace(i + 25);
  const isHourly = i % 2 === 0;
  const priceValue = isHourly ? 170000 + i * 7000 : 420000 + i * 22000;

  return createHotel({
    name: `New Urban Hotel ${i + 1} - ${place.area}, ${place.city}`,
    index: i + 100,
    city: place.city,
    area: place.area,
    rating: Number((4.6 + (i % 4) * 0.1).toFixed(1)),
    reviews: 10 + i * 23,
    discount: i % 2 === 0 ? 'Khai trương -20%' : 'Khai trương -25%',
    priceValue,
    unit: isHourly ? '/ 2 giờ' : '/ đêm',
    oldPriceValue: isHourly ? priceValue + 50000 : priceValue + 150000,
    badge: 'Mới',
    tags: isHourly ? ['Mới', 'Theo giờ'] : ['Mới', 'Qua đêm'],
  });
});

const normalizedManualHotels = normalizeManualHotelData(hotelData as HotelCardSeed[]);

const allHotelCards: HotelCardSeed[] = [
  ...normalizedManualHotels,
  ...flashSaleHourlyHotels,
  ...flashSaleOvernightHotels,
  ...specialOfferHotels,
  ...stayHubSuggestHotels,
  ...topRatedHotels,
  ...newHotels,
];

type PropertyTypeSeed = 'hotel' | 'homestay' | 'resort' | 'motel' | 'apartment';
type AmenityCategorySeed = 'general' | 'room' | 'bathroom' | 'entertainment' | 'safety' | 'service';

type AmenitySeed = {
  name: string;
  icon: string;
  category: AmenityCategorySeed;
};

type RoomPlanSeed = {
  name: string;
  slug: string;
  description: string;
  maxGuests: number;
  bedType: string;
  roomSizeSqm: number;
  totalUnits: number;
  priceMultiplier: number;
  amenities: string[];
};

const hotelAmenitySeeds: AmenitySeed[] = [
  { name: 'Wi-Fi miễn phí', icon: 'wifi', category: 'general' },
  { name: 'Ghế tình yêu', icon: 'heart', category: 'room' },
  { name: 'Lễ tân 24/24', icon: 'concierge-bell', category: 'service' },
  { name: 'Thang máy', icon: 'building-2', category: 'general' },
  { name: 'Dịch vụ dọn phòng', icon: 'sparkles', category: 'service' },
  { name: 'Tiện nghi là/ủi', icon: 'shirt', category: 'service' },
  { name: 'Dịch vụ lưu trữ/bảo quản hành lý', icon: 'briefcase', category: 'service' },
  { name: 'Bồn tắm', icon: 'bath', category: 'bathroom' },
  { name: 'Smart TV', icon: 'tv', category: 'entertainment' },
  { name: 'Điều hoà', icon: 'wind', category: 'room' },
  { name: 'Khu vực có thể hút thuốc', icon: 'cigarette', category: 'general' },
  { name: 'Đưa đón sân bay', icon: 'plane', category: 'service' },
  { name: 'Bãi đỗ xe ô tô', icon: 'car', category: 'general' },
  { name: 'Quán cafe', icon: 'coffee', category: 'service' },
  { name: 'Nhà hàng', icon: 'utensils', category: 'service' },
  { name: 'Đồ dùng làm bếp', icon: 'cooking-pot', category: 'room' },
  { name: 'Máy sấy tóc', icon: 'waves', category: 'bathroom' },
  { name: 'Két sắt', icon: 'shield-check', category: 'safety' },
  { name: 'Bể bơi', icon: 'waves', category: 'general' },
  { name: 'Tủ lạnh', icon: 'refrigerator', category: 'room' },
];

const roomPlansByPropertyType: Record<PropertyTypeSeed, RoomPlanSeed[]> = {
  hotel: [
    {
      name: 'Phòng Standard',
      slug: 'phong-standard',
      description: 'Phòng tiêu chuẩn sạch sẽ, đầy đủ tiện nghi cho kỳ nghỉ ngắn.',
      maxGuests: 2,
      bedType: '1 giường Queen',
      roomSizeSqm: 24,
      totalUnits: 6,
      priceMultiplier: 1,
      amenities: ['Wi-Fi miễn phí', 'Smart TV', 'Điều hoà', 'Máy sấy tóc', 'Tủ lạnh'],
    },
    {
      name: 'Phòng Deluxe',
      slug: 'phong-deluxe',
      description: 'Không gian rộng hơn, phù hợp cặp đôi hoặc khách công tác.',
      maxGuests: 2,
      bedType: '1 giường King',
      roomSizeSqm: 32,
      totalUnits: 5,
      priceMultiplier: 1.35,
      amenities: ['Wi-Fi miễn phí', 'Bồn tắm', 'Smart TV', 'Điều hoà', 'Két sắt'],
    },
    {
      name: 'Suite gia đình',
      slug: 'suite-gia-dinh',
      description: 'Suite rộng rãi có khu tiếp khách và nhiều tiện ích gia đình.',
      maxGuests: 4,
      bedType: '2 giường Queen',
      roomSizeSqm: 48,
      totalUnits: 3,
      priceMultiplier: 1.8,
      amenities: ['Wi-Fi miễn phí', 'Bồn tắm', 'Smart TV', 'Đồ dùng làm bếp', 'Tủ lạnh'],
    },
  ],
  homestay: [
    {
      name: 'Phòng Couple',
      slug: 'phong-couple',
      description: 'Phòng ấm cúng cho hai người, thiết kế gần gũi và riêng tư.',
      maxGuests: 2,
      bedType: '1 giường Queen',
      roomSizeSqm: 22,
      totalUnits: 4,
      priceMultiplier: 0.95,
      amenities: ['Wi-Fi miễn phí', 'Điều hoà', 'Smart TV', 'Máy sấy tóc'],
    },
    {
      name: 'Phòng Garden',
      slug: 'phong-garden',
      description: 'Phòng có ánh sáng tự nhiên, phù hợp nghỉ dưỡng cuối tuần.',
      maxGuests: 3,
      bedType: '1 giường Queen + 1 sofa',
      roomSizeSqm: 30,
      totalUnits: 4,
      priceMultiplier: 1.2,
      amenities: ['Wi-Fi miễn phí', 'Tủ lạnh', 'Đồ dùng làm bếp', 'Khu vực có thể hút thuốc'],
    },
    {
      name: 'Phòng Family',
      slug: 'phong-family',
      description: 'Phòng gia đình có khu sinh hoạt nhỏ và tiện nghi bếp cơ bản.',
      maxGuests: 5,
      bedType: '2 giường Queen',
      roomSizeSqm: 42,
      totalUnits: 2,
      priceMultiplier: 1.55,
      amenities: ['Wi-Fi miễn phí', 'Đồ dùng làm bếp', 'Tủ lạnh', 'Tiện nghi là/ủi'],
    },
  ],
  resort: [
    {
      name: 'Garden Deluxe',
      slug: 'garden-deluxe',
      description: 'Phòng hướng vườn, phù hợp nghỉ dưỡng nhẹ nhàng.',
      maxGuests: 2,
      bedType: '1 giường King',
      roomSizeSqm: 36,
      totalUnits: 6,
      priceMultiplier: 1.25,
      amenities: ['Wi-Fi miễn phí', 'Bồn tắm', 'Smart TV', 'Điều hoà', 'Máy sấy tóc'],
    },
    {
      name: 'Ocean Suite',
      slug: 'ocean-suite',
      description: 'Suite cao cấp với không gian rộng và tiện nghi thư giãn.',
      maxGuests: 3,
      bedType: '1 giường King + 1 sofa',
      roomSizeSqm: 54,
      totalUnits: 4,
      priceMultiplier: 1.85,
      amenities: ['Wi-Fi miễn phí', 'Bồn tắm', 'Smart TV', 'Két sắt', 'Tủ lạnh'],
    },
    {
      name: 'Family Villa',
      slug: 'family-villa',
      description: 'Villa riêng cho gia đình hoặc nhóm bạn.',
      maxGuests: 6,
      bedType: '2 giường King',
      roomSizeSqm: 76,
      totalUnits: 2,
      priceMultiplier: 2.4,
      amenities: ['Wi-Fi miễn phí', 'Bồn tắm', 'Đồ dùng làm bếp', 'Tủ lạnh', 'Két sắt'],
    },
  ],
  motel: [
    {
      name: 'Phòng Tiêu chuẩn',
      slug: 'phong-tieu-chuan',
      description: 'Phòng nghỉ cơ bản, sạch sẽ, tối ưu chi phí.',
      maxGuests: 2,
      bedType: '1 giường Queen',
      roomSizeSqm: 20,
      totalUnits: 8,
      priceMultiplier: 0.85,
      amenities: ['Wi-Fi miễn phí', 'Điều hoà', 'Smart TV'],
    },
    {
      name: 'Phòng Superior',
      slug: 'phong-superior',
      description: 'Phòng rộng hơn với tiện ích bổ sung cho khách lưu trú ngắn.',
      maxGuests: 2,
      bedType: '1 giường King',
      roomSizeSqm: 26,
      totalUnits: 5,
      priceMultiplier: 1.05,
      amenities: ['Wi-Fi miễn phí', 'Smart TV', 'Điều hoà', 'Ghế tình yêu'],
    },
    {
      name: 'Phòng Twin',
      slug: 'phong-twin',
      description: 'Phòng hai giường đơn phù hợp khách đi cùng bạn bè.',
      maxGuests: 2,
      bedType: '2 giường đơn',
      roomSizeSqm: 28,
      totalUnits: 3,
      priceMultiplier: 1.15,
      amenities: ['Wi-Fi miễn phí', 'Smart TV', 'Điều hoà', 'Máy sấy tóc'],
    },
  ],
  apartment: [
    {
      name: 'Studio Apartment',
      slug: 'studio-apartment',
      description: 'Căn hộ studio tiện nghi với bếp nhỏ và khu làm việc.',
      maxGuests: 2,
      bedType: '1 giường Queen',
      roomSizeSqm: 34,
      totalUnits: 5,
      priceMultiplier: 1.15,
      amenities: ['Wi-Fi miễn phí', 'Đồ dùng làm bếp', 'Tủ lạnh', 'Tiện nghi là/ủi'],
    },
    {
      name: 'One-bedroom Apartment',
      slug: 'one-bedroom-apartment',
      description: 'Căn hộ một phòng ngủ riêng biệt, phù hợp lưu trú dài ngày.',
      maxGuests: 3,
      bedType: '1 giường Queen + 1 sofa',
      roomSizeSqm: 46,
      totalUnits: 4,
      priceMultiplier: 1.45,
      amenities: ['Wi-Fi miễn phí', 'Smart TV', 'Đồ dùng làm bếp', 'Tủ lạnh', 'Máy sấy tóc'],
    },
    {
      name: 'Two-bedroom Apartment',
      slug: 'two-bedroom-apartment',
      description: 'Căn hộ hai phòng ngủ dành cho gia đình hoặc nhóm nhỏ.',
      maxGuests: 5,
      bedType: '2 giường Queen',
      roomSizeSqm: 68,
      totalUnits: 2,
      priceMultiplier: 1.9,
      amenities: ['Wi-Fi miễn phí', 'Smart TV', 'Đồ dùng làm bếp', 'Tủ lạnh', 'Két sắt'],
    },
  ],
};

const roundToTenThousand = (value: number) => Math.round(value / 10000) * 10000;

const uniqueNames = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

const ROOM_INVENTORY_DAYS = 45;

const getPropertyType = (hotel: HotelCardSeed, index: number): PropertyTypeSeed => {
  const searchable = `${hotel.name} ${hotel.city ?? ''} ${hotel.area ?? ''}`.toLowerCase();
  if (/(resort|phú quốc|phu quoc|nha trang|hạ long|ha long|vũng tàu|vung tau|phan thiết|phan thiet)/i.test(searchable)) {
    return 'resort';
  }

  const propertyTypes: PropertyTypeSeed[] = ['hotel', 'homestay', 'resort', 'motel', 'apartment'];
  return propertyTypes[index % propertyTypes.length];
};

const buildHotelAmenityNames = (hotel: HotelCardSeed, index: number, propertyType: PropertyTypeSeed) => {
  const amenities = ['Wi-Fi miễn phí', 'Lễ tân 24/24', 'Dịch vụ dọn phòng'];

  if (index % 2 === 0) amenities.push('Thang máy', 'Bãi đỗ xe ô tô');
  if (index % 3 === 0) amenities.push('Nhà hàng', 'Quán cafe');
  if (index % 4 === 0) amenities.push('Đưa đón sân bay', 'Dịch vụ lưu trữ/bảo quản hành lý');
  if (hotel.tags.includes('Theo giờ')) amenities.push('Ghế tình yêu', 'Smart TV', 'Điều hoà');
  if (hotel.tags.includes('Nổi bật') || hotel.tags.includes('Ưu đãi')) amenities.push('Bể bơi', 'Két sắt');

  const amenitiesByType: Record<PropertyTypeSeed, string[]> = {
    hotel: ['Thang máy', 'Nhà hàng', 'Bãi đỗ xe ô tô'],
    homestay: ['Khu vực có thể hút thuốc', 'Đồ dùng làm bếp', 'Quán cafe'],
    resort: ['Bể bơi', 'Nhà hàng', 'Đưa đón sân bay', 'Bồn tắm'],
    motel: ['Bãi đỗ xe ô tô', 'Két sắt', 'Dịch vụ lưu trữ/bảo quản hành lý'],
    apartment: ['Đồ dùng làm bếp', 'Tủ lạnh', 'Tiện nghi là/ủi'],
  };

  return uniqueNames([...amenities, ...amenitiesByType[propertyType]]);
};

const toAmenityJoinData = (
  names: string[],
  amenityIds: Map<string, string>,
  mapItem: (amenityId: string) => Record<string, string>,
) => {
  const ids = uniqueNames(names)
    .map((name) => amenityIds.get(name))
    .filter((id): id is string => Boolean(id));

  return Array.from(new Set(ids)).map(mapItem);
};

const getPriceSet = (hotel: HotelCardSeed, multiplier: number) => {
  const cardPrice = hotel.priceValue;
  const hourlyBase = hotel.tags.includes('Theo giờ')
    ? cardPrice
    : Math.max(180000, roundToTenThousand(cardPrice * 0.35));
  const overnightBase = hotel.tags.includes('Qua đêm')
    ? cardPrice
    : Math.max(360000, roundToTenThousand(cardPrice * 1.8));
  const dailyBase = Math.max(overnightBase + 120000, roundToTenThousand(overnightBase * 1.35));

  return {
    hourly: roundToTenThousand(hourlyBase * multiplier),
    overnight: roundToTenThousand(overnightBase * multiplier),
    daily: roundToTenThousand(dailyBase * multiplier),
  };
};

const getInventoryDate = (offsetDays: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date;
};

const buildRoomInventorySeed = (
  roomTypeId: string,
  totalUnits: number,
  hotelIndex: number,
  roomIndex: number,
) => Array.from({ length: ROOM_INVENTORY_DAYS }, (_, dayOffset) => {
  const isClosed = (hotelIndex + roomIndex + dayOffset) % 31 === 0;
  const bookedRooms = isClosed
    ? 0
    : Math.min(totalUnits, (hotelIndex + roomIndex + dayOffset) % Math.max(1, Math.ceil(totalUnits / 2)));

  return {
    roomTypeId,
    date: getInventoryDate(dayOffset),
    totalRooms: totalUnits,
    bookedRooms,
    isClosed,
  };
});

const seedAmenities = async () => {
  const amenityIds = new Map<string, string>();

  for (const amenity of hotelAmenitySeeds) {

    const row = await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: {
        icon: amenity.icon,
        category: amenity.category as any,
        isActive: true,

      },
      create: {
        name: amenity.name,
        slug: slugify(amenity.name), 
        icon: amenity.icon,
        category: amenity.category as any,
        isActive: true,
      },
    });
    amenityIds.set(amenity.name, row.id);
  }

  return amenityIds;
};

const seedHotelDomainForCard = async (
  hotelCard: { id: string; slug: string },
  hotel: HotelCardSeed,
  index: number,
  ownerId: string,
  amenityIds: Map<string, string>,
) => {
  const propertyType = getPropertyType(hotel, index);
  const city = hotel.city ?? 'Hà Nội';
  const area = hotel.area ?? hotel.district ?? hotel.location;
  const addressLine = `Số ${100 + index}, đường ${area}`;
  const fullAddress = [addressLine, area, city].filter(Boolean).join(', ');
  const hotelId = hotelCard.id;
  const hotelAmenities = buildHotelAmenityNames(hotel, index, propertyType);
  const roomPlans = roomPlansByPropertyType[propertyType];

  await prisma.hotel.upsert({
    where: { id: hotelId },
    update: {
      ownerId,
      name: hotel.name,
      slug: `stayhub-${hotelCard.slug}`,
      description: `${hotel.name} thuộc nhóm ${propertyType}, phù hợp đặt phòng theo giờ, qua đêm hoặc theo ngày trên StayHub.`,
      propertyType: propertyType as any,
      starRating: Math.min(5, Math.max(1, Math.round(hotel.rating))),
      status: 'approved' as any,
      isFeatured: hotel.tags.includes('Nổi bật'),
      checkInTime: '14:00',
      checkOutTime: '12:00',
      minBookingHours: hotel.tags.includes('Theo giờ') ? 2 : null,
      avgRating: hotel.rating as any,
      totalReviews: hotel.reviews,
      approvedAt: new Date(),
    } as any,
    create: {
      id: hotelId,
      ownerId,
      name: hotel.name,
      slug: `stayhub-${hotelCard.slug}`,
      description: `${hotel.name} thuộc nhóm ${propertyType}, phù hợp đặt phòng theo giờ, qua đêm hoặc theo ngày trên StayHub.`,
      propertyType: propertyType as any,
      starRating: Math.min(5, Math.max(1, Math.round(hotel.rating))),
      status: 'approved' as any,
      isFeatured: hotel.tags.includes('Nổi bật'),
      totalRooms: 0,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      minBookingHours: hotel.tags.includes('Theo giờ') ? 2 : null,
      cancellationPolicy: 'moderate' as any,
      cancellationHours: 24,
      depositPercent: 0 as any,
      avgRating: hotel.rating as any,
      totalReviews: hotel.reviews,
      approvedAt: new Date(),
    } as any,
  });

  await prisma.hotelAddress.upsert({
    where: { hotelId },
    update: {
      addressLine,
      ward: area,
      district: hotel.district,
      city,
      province: city,
      country: 'Vietnam',
      fullAddress,
    } as any,
    create: {
      hotelId,
      addressLine,
      ward: area,
      district: hotel.district,
      city,
      province: city,
      country: 'Vietnam',
      fullAddress,
    } as any,
  });

  await prisma.hotelImage.deleteMany({ where: { hotelId } });
  await prisma.hotelImage.createMany({
    data: [hotel.image, imagePool[(index + 3) % imagePool.length], imagePool[(index + 7) % imagePool.length]].map((imageUrl, sortOrder) => ({
      hotelId,
      imageUrl: cleanUrl(imageUrl),
      caption: sortOrder === 0 ? 'Ảnh bìa khách sạn' : `Không gian khách sạn ${sortOrder + 1}`,
      isCover: sortOrder === 0,
      sortOrder,
    })) as any,
  });

  await prisma.hotelAmenity.deleteMany({ where: { hotelId } });
  const hotelAmenityData = toAmenityJoinData(hotelAmenities, amenityIds, (amenityId) => ({ hotelId, amenityId }));
  if (hotelAmenityData.length > 0) {
    await prisma.hotelAmenity.createMany({
      data: hotelAmenityData as any,
      skipDuplicates: true,
    });
  }

  let totalRooms = 0;

  for (let roomIndex = 0; roomIndex < roomPlans.length; roomIndex++) {
    const roomPlan = roomPlans[roomIndex];
    if (!roomPlan) continue;

    const totalUnits = roomPlan.totalUnits + (index % 3);
    totalRooms += totalUnits;

    const roomType = await prisma.roomType.upsert({
      where: {
        hotelId_slug: {
          hotelId,
          slug: roomPlan.slug,
        },
      },
      update: {
        name: roomPlan.name,
        description: roomPlan.description,
        maxGuests: roomPlan.maxGuests,
        bedType: roomPlan.bedType,
        roomSizeSqm: roomPlan.roomSizeSqm as any,
        totalUnits,
        status: 'active' as any,
        sortOrder: roomIndex,
      } as any,
      create: {
        hotelId,
        name: roomPlan.name,
        slug: roomPlan.slug,
        description: roomPlan.description,
        maxGuests: roomPlan.maxGuests,
        bedType: roomPlan.bedType,
        roomSizeSqm: roomPlan.roomSizeSqm as any,
        totalUnits,
        status: 'active' as any,
        sortOrder: roomIndex,
      } as any,
    });

    const priceSet = getPriceSet(hotel, roomPlan.priceMultiplier);
    const pricingPolicies = [
      { bookingType: 'hourly', basePrice: priceSet.hourly, minHours: 2, maxHours: 10, extraHourPrice: roundToTenThousand(priceSet.hourly * 0.35) },
      { bookingType: 'overnight', basePrice: priceSet.overnight, minHours: null, maxHours: null, extraHourPrice: null },
      { bookingType: 'daily', basePrice: priceSet.daily, minHours: null, maxHours: null, extraHourPrice: null },
    ];

    for (const policy of pricingPolicies) {
      await prisma.pricingPolicy.upsert({
        where: {
          roomTypeId_bookingType: {
            roomTypeId: roomType.id,
            bookingType: policy.bookingType as any,
          },
        },
        update: {
          basePrice: policy.basePrice as any,
          minHours: policy.minHours,
          maxHours: policy.maxHours,
          extraHourPrice: policy.extraHourPrice as any,
          overnightCheckinFrom: policy.bookingType === 'overnight' ? '22:00' : null,
          overnightCheckoutBefore: policy.bookingType === 'overnight' ? '10:00' : null,
          isActive: true,
        } as any,
        create: {
          roomTypeId: roomType.id,
          bookingType: policy.bookingType as any,
          basePrice: policy.basePrice as any,
          minHours: policy.minHours,
          maxHours: policy.maxHours,
          extraHourPrice: policy.extraHourPrice as any,
          overnightCheckinFrom: policy.bookingType === 'overnight' ? '22:00' : null,
          overnightCheckoutBefore: policy.bookingType === 'overnight' ? '10:00' : null,
          isActive: true,
        } as any,
      });
    }

    await prisma.roomUnit.deleteMany({ where: { roomTypeId: roomType.id } });
    await prisma.roomUnit.createMany({
      data: Array.from({ length: totalUnits }, (_, unitIndex) => ({
        roomTypeId: roomType.id,
        roomNumber: `${roomIndex + 2}${String(unitIndex + 1).padStart(2, '0')}`,
        floor: roomIndex + 2,
        status: 'available',
        notes: 'Seed room unit',
      })) as any,
    });

    await prisma.roomInventory.deleteMany({ where: { roomTypeId: roomType.id } });
    await prisma.roomInventory.createMany({
      data: buildRoomInventorySeed(roomType.id, totalUnits, index, roomIndex) as any,
    });

    await prisma.roomMedia.deleteMany({ where: { roomTypeId: roomType.id } });
    await prisma.roomMedia.createMany({
      data: [hotel.image, imagePool[(index + roomIndex + 5) % imagePool.length]].map((imageUrl, sortOrder) => ({
        roomTypeId: roomType.id,
        imageUrl: cleanUrl(imageUrl),
        mediaType: 'image',
        caption: sortOrder === 0 ? roomPlan.name : `${roomPlan.name} - góc nhìn ${sortOrder + 1}`,
        isCover: sortOrder === 0,
        sortOrder,
      })) as any,
    });

    await prisma.roomTypeAmenity.deleteMany({ where: { roomTypeId: roomType.id } });
    const roomAmenityData = toAmenityJoinData(roomPlan.amenities, amenityIds, (amenityId) => ({
      roomTypeId: roomType.id,
      amenityId,
    }));

    if (roomAmenityData.length > 0) {
      await prisma.roomTypeAmenity.createMany({
        data: roomAmenityData as any,
        skipDuplicates: true,
      });
    }
  }

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { totalRooms } as any,
  });
};

const seedHotelCards = async () => {
  console.log('🌱 Seeding hotel cards, khách sạn, tiện ích và phòng...');
  const partner = await prisma.user.findUnique({ where: { email: 'partner@gmail.com' } });
  if (!partner) {
    console.log('⚠ Không tìm thấy tài khoản partner để seed khách sạn.');
    return;
  }

  const amenityIds = await seedAmenities();

  for (let index = 0; index < allHotelCards.length; index++) {
    const hotel = allHotelCards[index];
    const slug = `${slugify(hotel.name)}-${index + 1}`;

    const hotelCard = await prisma.hotelCard.upsert({
      where: { slug },
      update: {
        name: hotel.name,
        rating: hotel.rating,
        reviews: hotel.reviews,
        city: hotel.city ?? 'Hà Nội',
        area: hotel.area ?? hotel.district,
        location: hotel.location,
        district: hotel.district,
        discount: hotel.discount || null,
        price: hotel.price,
        priceValue: hotel.priceValue,
        unit: hotel.unit,
        oldPrice: hotel.oldPrice || null,
        image: cleanUrl(hotel.image),
        badge: hotel.badge || null,
        tags: hotel.tags,
        isActive: true,
        sortOrder: index,
      },
      create: {
        slug,
        name: hotel.name,
        rating: hotel.rating,
        reviews: hotel.reviews,
        city: hotel.city ?? 'Hà Nội',
        area: hotel.area ?? hotel.district,
        location: hotel.location,
        district: hotel.district,
        discount: hotel.discount || null,
        price: hotel.price,
        priceValue: hotel.priceValue,
        unit: hotel.unit,
        oldPrice: hotel.oldPrice || null,
        image: cleanUrl(hotel.image),
        badge: hotel.badge || null,
        tags: hotel.tags,
        isActive: true,
        sortOrder: index,
      },
    });

    await seedHotelDomainForCard(hotelCard, hotel, index, partner.id, amenityIds);
  }

  console.log(`✅ Seeded ${allHotelCards.length} hotel cards, hotels, amenities, room types, room units, pricing và inventory thành công.`);
};


const seedVouchers = async () => {
  console.log('🌱 Seeding vouchers...');

  const partner = await prisma.user.findUnique({
    where: { email: 'partner@gmail.com' },
  });

  if (!partner) {
    console.log('⚠ Không tìm thấy partner để seed voucher.');
    return;
  }

  const hotel = await prisma.hotel.findFirst({
    where: {
      ownerId: partner.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!hotel) {
    console.log('⚠ Không tìm thấy hotel để seed voucher. Hãy seed hotel trước.');
    return;
  }

  const roomTypes = await prisma.roomType.findMany({
    where: {
      hotelId: hotel.id,
    },
    take: 2,
  });

  const welcomeVoucher = await prisma.voucher.upsert({
    where: {
      hotelId_code: {
        hotelId: hotel.id,
        code: 'CHAOBANMOI',
      },
    },
    update: {
      name: 'Chào bạn mới',
      discountType: 'percent',
      discountValue: 20,
      minOrderValue: 0,
      maxDiscount: 100000,
      usageLimit: 100,
      usedCount: 0,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T23:59:59.000Z'),
      status: 'ACTIVE',
    },
    create: {
      hotelId: hotel.id,
      code: 'CHAOBANMOI',
      name: 'Chào bạn mới',
      discountType: 'percent',
      discountValue: 20,
      minOrderValue: 0,
      maxDiscount: 100000,
      usageLimit: 100,
      usedCount: 0,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-12-31T23:59:59.000Z'),
      status: 'ACTIVE',
    },
  });

  await prisma.voucherRoomType.deleteMany({
    where: {
      voucherId: welcomeVoucher.id,
    },
  });

  if (roomTypes.length > 0) {
    await prisma.voucherRoomType.createMany({
      data: roomTypes.map((roomType) => ({
        voucherId: welcomeVoucher.id,
        roomTypeId: roomType.id,
      })),
      skipDuplicates: true,
    });
  }

  const allRoomVoucher = await prisma.voucher.upsert({
    where: {
      hotelId_code: {
        hotelId: hotel.id,
        code: 'SUMMER30',
      },
    },
    update: {
      name: 'Giảm 30% mùa hè',
      discountType: 'percent',
      discountValue: 30,
      minOrderValue: 500000,
      maxDiscount: 200000,
      usageLimit: 100,
      usedCount: 0,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-06-30T23:59:59.000Z'),
      status: 'ACTIVE',
    },
    create: {
      hotelId: hotel.id,
      code: 'SUMMER30',
      name: 'Giảm 30% mùa hè',
      discountType: 'percent',
      discountValue: 30,
      minOrderValue: 500000,
      maxDiscount: 200000,
      usageLimit: 100,
      usedCount: 0,
      startDate: new Date('2026-05-01T00:00:00.000Z'),
      endDate: new Date('2026-06-30T23:59:59.000Z'),
      status: 'ACTIVE',
    },
  });

  // Không tạo VoucherRoomType cho SUMMER30
  // Nghĩa là voucher này áp dụng cho tất cả loại phòng
  await prisma.voucherRoomType.deleteMany({
    where: {
      voucherId: allRoomVoucher.id,
    },
  });

  console.log('✔ Đã seed voucher');
};


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });