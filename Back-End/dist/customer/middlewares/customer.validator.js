import { z } from 'zod';
const nonEmptyString = (field, max = 255) => z.string().trim().min(1, `${field} là bắt buộc`).max(max, `${field} quá dài`);
export const customerRegisterSchema = z.object({
    email: z.email('Email không hợp lệ').trim().toLowerCase(),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(100, 'Mật khẩu quá dài'),
    username: nonEmptyString('Tên người dùng', 100),
});
export const customerLoginSchema = z.object({
    email: z.email('Email không hợp lệ').trim().toLowerCase(),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});
export const refreshTokenSchema = z.object({
    refreshToken: nonEmptyString('Refresh token', 2000),
});
export const logoutSchema = z.object({
    refreshToken: z.string().trim().min(1).max(2000).optional(),
});
export const forgotPasswordSchema = z.object({
    email: z.email('Email không hợp lệ').trim().toLowerCase(),
});
export const resetPasswordSchema = z.object({
    email: z.email('Email không hợp lệ').trim().toLowerCase(),
    code: nonEmptyString('Mã xác nhận', 20),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').max(100, 'Mật khẩu mới quá dài'),
});
export const hotelListQuerySchema = z.object({
    tag: z.string().trim().min(1).max(100).optional(),
    sort: z.enum(['relevant', 'rating', 'price-asc', 'price-desc']).optional(),
    minPrice: z.coerce.number().int().min(0).optional().transform((value) => value?.toString()),
    maxPrice: z.coerce.number().int().min(0).optional().transform((value) => value?.toString()),
    district: z.string().trim().min(1).max(100).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().transform((value) => value?.toString()),
}).refine((query) => {
    if (!query.minPrice || !query.maxPrice)
        return true;
    return Number(query.minPrice) <= Number(query.maxPrice);
}, {
    path: ['maxPrice'],
    message: 'Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu',
});
export const hotelIdParamsSchema = z.object({
    id: nonEmptyString('Mã khách sạn', 100),
});
export const hotelAvailabilityQuerySchema = z.object({
    bookingType: z.enum(['Theo giờ', 'Qua đêm', 'Theo ngày']).default('Theo giờ'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải có định dạng YYYY-MM-DD'),
});
export const hotelCardCityParamsSchema = z.object({
    city: nonEmptyString('Thành phố', 100),
});
//# sourceMappingURL=customer.validator.js.map