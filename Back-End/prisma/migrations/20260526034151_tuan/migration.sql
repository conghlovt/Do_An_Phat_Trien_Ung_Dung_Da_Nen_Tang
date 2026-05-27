-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'partner', 'customer', 'staff', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'BLOCKED', 'active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('hotel', 'homestay', 'resort', 'motel', 'apartment');

-- CreateEnum
CREATE TYPE "HotelStatus" AS ENUM ('draft', 'pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('flexible', 'moderate', 'strict', 'non_refundable');

-- CreateEnum
CREATE TYPE "RoomTypeStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "RoomUnitStatus" AS ENUM ('available', 'occupied', 'maintenance', 'cleaning');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('hourly', 'overnight', 'daily');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "AmenityCategory" AS ENUM ('general', 'room', 'bathroom', 'entertainment', 'safety', 'service');

-- CreateEnum
CREATE TYPE "CustomerNotificationType" AS ENUM ('booking', 'offers', 'others');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'customer',
    "code" TEXT,
    "avatar" TEXT,
    "refreshToken" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "images" TEXT[],
    "amenities" TEXT[],
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "totalRooms" INTEGER NOT NULL DEFAULT 1,
    "available" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "voucherCode" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "images" TEXT[],
    "reply" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "partnerNet" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "thumbnail" TEXT,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_objects" (
    "id" TEXT NOT NULL,
    "bucket_name" TEXT NOT NULL,
    "object_key" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "extension" TEXT NOT NULL,
    "checksum_md5" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_by" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "property_type" "PropertyType" NOT NULL DEFAULT 'hotel',
    "star_rating" INTEGER,
    "status" "HotelStatus" NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "total_rooms" INTEGER NOT NULL DEFAULT 0,
    "check_in_time" TEXT NOT NULL DEFAULT '14:00',
    "check_out_time" TEXT NOT NULL DEFAULT '12:00',
    "min_booking_hours" INTEGER,
    "cancellation_policy" "CancellationPolicy" NOT NULL DEFAULT 'moderate',
    "cancellation_hours" INTEGER NOT NULL DEFAULT 24,
    "deposit_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "avg_rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_addresses" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "ward" TEXT,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Vietnam',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "full_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_images" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "file_id" TEXT,
    "image_url" TEXT,
    "caption" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_videos" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "file_id" TEXT,
    "video_url" TEXT,
    "title" TEXT,
    "duration" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "category" "AmenityCategory" NOT NULL DEFAULT 'general',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_amenities" (
    "hotel_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "hotel_amenities_pkey" PRIMARY KEY ("hotel_id","amenity_id")
);

-- CreateTable
CREATE TABLE "room_types" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "max_guests" INTEGER NOT NULL DEFAULT 2,
    "bed_type" TEXT,
    "room_size_sqm" DECIMAL(6,1),
    "total_units" INTEGER NOT NULL DEFAULT 1,
    "status" "RoomTypeStatus" NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_units" (
    "id" TEXT NOT NULL,
    "room_type_id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "floor" INTEGER,
    "status" "RoomUnitStatus" NOT NULL DEFAULT 'available',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_media" (
    "id" TEXT NOT NULL,
    "room_type_id" TEXT NOT NULL,
    "file_id" TEXT,
    "image_url" TEXT,
    "media_type" "MediaType" NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_type_amenities" (
    "room_type_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,

    CONSTRAINT "room_type_amenities_pkey" PRIMARY KEY ("room_type_id","amenity_id")
);

-- CreateTable
CREATE TABLE "pricing_policies" (
    "id" TEXT NOT NULL,
    "room_type_id" TEXT NOT NULL,
    "booking_type" "BookingType" NOT NULL,
    "base_price" DECIMAL(12,0) NOT NULL,
    "min_hours" INTEGER,
    "max_hours" INTEGER,
    "extra_hour_price" DECIMAL(12,0),
    "overnight_checkin_from" TEXT,
    "overnight_checkout_before" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_prices" (
    "id" TEXT NOT NULL,
    "pricing_policy_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "price" DECIMAL(12,0) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "special_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_inventory" (
    "id" TEXT NOT NULL,
    "room_type_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_rooms" INTEGER NOT NULL,
    "booked_rooms" INTEGER NOT NULL DEFAULT 0,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_cards" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "discount" TEXT,
    "price" TEXT NOT NULL,
    "priceValue" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "oldPrice" TEXT,
    "image" TEXT NOT NULL,
    "badge" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_messages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hotel_name" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_notifications" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "CustomerNotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_status_idx" ON "Voucher"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_hotel_id_code_key" ON "Voucher"("hotel_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_key" ON "RolePermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "file_objects_object_key_key" ON "file_objects"("object_key");

-- CreateIndex
CREATE INDEX "file_objects_entity_type_entity_id_idx" ON "file_objects"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "file_objects_bucket_name_idx" ON "file_objects"("bucket_name");

-- CreateIndex
CREATE INDEX "file_objects_uploaded_by_idx" ON "file_objects"("uploaded_by");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_slug_key" ON "hotels"("slug");

-- CreateIndex
CREATE INDEX "hotels_owner_id_idx" ON "hotels"("owner_id");

-- CreateIndex
CREATE INDEX "hotels_status_idx" ON "hotels"("status");

-- CreateIndex
CREATE INDEX "hotels_property_type_idx" ON "hotels"("property_type");

-- CreateIndex
CREATE INDEX "hotels_avg_rating_idx" ON "hotels"("avg_rating");

-- CreateIndex
CREATE INDEX "hotels_is_featured_idx" ON "hotels"("is_featured");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_addresses_hotel_id_key" ON "hotel_addresses"("hotel_id");

-- CreateIndex
CREATE INDEX "hotel_addresses_city_idx" ON "hotel_addresses"("city");

-- CreateIndex
CREATE INDEX "hotel_addresses_district_idx" ON "hotel_addresses"("district");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_slug_key" ON "amenities"("slug");

-- CreateIndex
CREATE INDEX "room_types_hotel_id_idx" ON "room_types"("hotel_id");

-- CreateIndex
CREATE INDEX "room_types_status_idx" ON "room_types"("status");

-- CreateIndex
CREATE UNIQUE INDEX "room_types_hotel_id_slug_key" ON "room_types"("hotel_id", "slug");

-- CreateIndex
CREATE INDEX "room_units_status_idx" ON "room_units"("status");

-- CreateIndex
CREATE UNIQUE INDEX "room_units_room_type_id_room_number_key" ON "room_units"("room_type_id", "room_number");

-- CreateIndex
CREATE INDEX "pricing_policies_room_type_id_idx" ON "pricing_policies"("room_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_policies_room_type_id_booking_type_key" ON "pricing_policies"("room_type_id", "booking_type");

-- CreateIndex
CREATE UNIQUE INDEX "special_prices_pricing_policy_id_date_key" ON "special_prices"("pricing_policy_id", "date");

-- CreateIndex
CREATE INDEX "room_inventory_date_idx" ON "room_inventory"("date");

-- CreateIndex
CREATE UNIQUE INDEX "room_inventory_room_type_id_date_key" ON "room_inventory"("room_type_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_cards_slug_key" ON "hotel_cards"("slug");

-- CreateIndex
CREATE INDEX "hotel_cards_city_idx" ON "hotel_cards"("city");

-- CreateIndex
CREATE INDEX "hotel_cards_area_idx" ON "hotel_cards"("area");

-- CreateIndex
CREATE INDEX "hotel_cards_district_idx" ON "hotel_cards"("district");

-- CreateIndex
CREATE INDEX "hotel_cards_priceValue_idx" ON "hotel_cards"("priceValue");

-- CreateIndex
CREATE INDEX "hotel_cards_rating_idx" ON "hotel_cards"("rating");

-- CreateIndex
CREATE INDEX "hotel_cards_isActive_idx" ON "hotel_cards"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "customer_messages_code_key" ON "customer_messages"("code");

-- CreateIndex
CREATE INDEX "customer_messages_user_id_idx" ON "customer_messages"("user_id");

-- CreateIndex
CREATE INDEX "customer_messages_user_id_is_read_idx" ON "customer_messages"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "customer_notifications_code_key" ON "customer_notifications"("code");

-- CreateIndex
CREATE INDEX "customer_notifications_user_id_idx" ON "customer_notifications"("user_id");

-- CreateIndex
CREATE INDEX "customer_notifications_user_id_type_idx" ON "customer_notifications"("user_id", "type");

-- CreateIndex
CREATE INDEX "customer_notifications_user_id_is_read_idx" ON "customer_notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPost" ADD CONSTRAINT "ContentPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_objects" ADD CONSTRAINT "file_objects_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_addresses" ADD CONSTRAINT "hotel_addresses_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_videos" ADD CONSTRAINT "hotel_videos_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_videos" ADD CONSTRAINT "hotel_videos_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_videos" ADD CONSTRAINT "hotel_videos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_amenities" ADD CONSTRAINT "hotel_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_amenities" ADD CONSTRAINT "hotel_amenities_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_units" ADD CONSTRAINT "room_units_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_media" ADD CONSTRAINT "room_media_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_media" ADD CONSTRAINT "room_media_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_media" ADD CONSTRAINT "room_media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_type_amenities" ADD CONSTRAINT "room_type_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_type_amenities" ADD CONSTRAINT "room_type_amenities_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_policies" ADD CONSTRAINT "pricing_policies_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "special_prices" ADD CONSTRAINT "special_prices_pricing_policy_id_fkey" FOREIGN KEY ("pricing_policy_id") REFERENCES "pricing_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_inventory" ADD CONSTRAINT "room_inventory_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_messages" ADD CONSTRAINT "customer_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_notifications" ADD CONSTRAINT "customer_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
