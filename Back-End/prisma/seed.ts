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

  await seedHotelCards();

  console.log('--- Hoàn tất Seeding ---');
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

const seedHotelCards = async () => {
  console.log('🌱 Seeding hotel cards theo tỉnh/thành phố...');

  for (let index = 0; index < allHotelCards.length; index++) {
    const hotel = allHotelCards[index];
    const slug = `${slugify(hotel.name)}-${index + 1}`;

    await prisma.hotelCard.upsert({
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
  }

  console.log(`✅ Seeded ${allHotelCards.length} hotel cards thành công.`);
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