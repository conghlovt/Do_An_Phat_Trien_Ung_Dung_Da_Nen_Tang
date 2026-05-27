import ExcelJS from 'exceljs';
import { bookingService } from './booking.service';
import { contentService } from './content.service';
import { financeService } from './finance.service';
import { propertyService } from './property.service';
import { reviewService } from './review.service';
import { userService } from './user.service';
import { voucherService } from './voucher.service';
import { getExportFileDate, type DateRange, type SortOrder } from '../utils/admin-query.util';

export type ExportResource =
  | 'users'
  | 'properties'
  | 'bookings'
  | 'reviews'
  | 'vouchers'
  | 'finance'
  | 'content';

export type ExportOptions = {
  resource: ExportResource;
  requesterRole: string;
  search?: string | undefined;
  status?: string | undefined;
  role?: string | undefined;
  city?: string | undefined;
  propertyType?: string | undefined;
  rating?: string | undefined;
  paymentId?: string | undefined;
  month?: string | undefined;
  category?: string | undefined;
  sortBy?: string | undefined;
  sortOrder?: SortOrder | undefined;
  dateRange?: DateRange | undefined;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const money = (value: unknown) => Number(value || 0);

const addRows = (sheet: ExcelJS.Worksheet, rows: Record<string, unknown>[]) => {
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    column.width = Math.max(column.width || 12, 14);
  });
};

const buildWorkbook = (sheetName: string, columns: Partial<ExcelJS.Column>[], rows: Record<string, unknown>[]) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'StayHub Admin';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;
  addRows(sheet, rows);
  return workbook;
};

const extractItems = (result: any) => result?.items || [];

export const adminExportService = {
  exportResource: async (options: ExportOptions) => {
    let workbook: ExcelJS.Workbook;

    if (options.resource === 'users') {
      const result = await userService.getAllUsers({
        search: options.search,
        role: options.role,
        status: options.status,
        requesterRole: options.requesterRole,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Users', [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Username', key: 'username', width: 24 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 18 },
        { header: 'Role', key: 'role', width: 16 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'CreatedAt', key: 'createdAt', width: 16 },
        { header: 'LastLoginAt', key: 'lastLoginAt', width: 16 },
      ], extractItems(result).map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        createdAt: formatDate(user.createdAt),
        lastLoginAt: formatDate(user.lastLoginAt),
      })));
    } else if (options.resource === 'properties') {
      const result = await propertyService.getProperties({
        search: options.search,
        status: options.status,
        city: options.city,
        propertyType: options.propertyType,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Properties', [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Name', key: 'name', width: 32 },
        { header: 'Owner', key: 'owner', width: 24 },
        { header: 'City', key: 'city', width: 18 },
        { header: 'Address', key: 'address', width: 42 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'TotalRooms', key: 'totalRooms', width: 12 },
        { header: 'CreatedAt', key: 'createdAt', width: 16 },
        { header: 'ApprovedAt', key: 'approvedAt', width: 16 },
      ], extractItems(result).map((property: any) => ({
        id: property.id,
        name: property.name,
        owner: property.owner?.username || property.owner?.email || '',
        city: property.city || '',
        address: property.address || '',
        status: property.status || property.propertyStatus || '',
        totalRooms: property.totalRooms ?? property.roomCount ?? '',
        createdAt: formatDate(property.createdAt),
        approvedAt: formatDate(property.approvedAt),
      })));
    } else if (options.resource === 'bookings') {
      const result = await bookingService.getAllBookings({
        search: options.search,
        status: options.status,
        paymentId: options.paymentId,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Bookings', [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Customer', key: 'customer', width: 24 },
        { header: 'Property', key: 'property', width: 32 },
        { header: 'Room', key: 'room', width: 24 },
        { header: 'CheckIn', key: 'checkIn', width: 16 },
        { header: 'CheckOut', key: 'checkOut', width: 16 },
        { header: 'Guests', key: 'guests', width: 10 },
        { header: 'TotalPrice', key: 'totalPrice', width: 16, style: { numFmt: '#,##0' } },
        { header: 'VoucherCode', key: 'voucherCode', width: 18 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'PaymentId', key: 'paymentId', width: 24 },
        { header: 'CreatedAt', key: 'createdAt', width: 16 },
      ], extractItems(result).map((booking: any) => ({
        id: booking.id,
        customer: booking.user?.username || booking.user?.email || '',
        property: booking.property?.name || '',
        room: booking.room?.name || '',
        checkIn: formatDate(booking.checkIn),
        checkOut: formatDate(booking.checkOut),
        guests: booking.guests,
        totalPrice: money(booking.totalPrice),
        voucherCode: booking.voucherCode || '',
        status: booking.status,
        paymentId: booking.paymentId || '',
        createdAt: formatDate(booking.createdAt),
      })));
    } else if (options.resource === 'reviews') {
      const result = await reviewService.getAllReviews({
        search: options.search,
        status: options.status,
        rating: options.rating,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Reviews', [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Customer', key: 'customer', width: 24 },
        { header: 'Booking', key: 'bookingId', width: 36 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Comment', key: 'comment', width: 48 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'CreatedAt', key: 'createdAt', width: 16 },
      ], extractItems(result).map((review: any) => ({
        id: review.id,
        customer: review.user?.username || review.guest || '',
        bookingId: review.bookingId,
        rating: review.rating,
        comment: review.comment || '',
        status: review.status,
        createdAt: formatDate(review.createdAt),
      })));
    } else if (options.resource === 'vouchers') {
      const result = await voucherService.getAllVouchers({
        search: options.search,
        status: options.status,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Vouchers', [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Code', key: 'code', width: 18 },
        { header: 'Name', key: 'name', width: 28 },
        { header: 'Hotel', key: 'hotel', width: 28 },
        { header: 'DiscountType', key: 'discountType', width: 16 },
        { header: 'DiscountValue', key: 'discountValue', width: 16 },
        { header: 'UsageLimit', key: 'usageLimit', width: 14 },
        { header: 'UsedCount', key: 'usedCount', width: 14 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'StartDate', key: 'startDate', width: 16 },
        { header: 'EndDate', key: 'endDate', width: 16 },
      ], extractItems(result).map((voucher: any) => ({
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        hotel: voucher.hotel?.name || '',
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        usageLimit: voucher.usageLimit ?? '',
        usedCount: voucher.usedCount ?? 0,
        status: voucher.status,
        startDate: formatDate(voucher.startDate),
        endDate: formatDate(voucher.endDate),
      })));
    } else if (options.resource === 'finance') {
      const result = await financeService.getFinanceRecords({
        search: options.search,
        status: options.status,
        month: options.month,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Finance', [
        { header: 'Month', key: 'month', width: 16 },
        { header: 'GrossRevenue', key: 'grossRevenue', width: 18, style: { numFmt: '#,##0' } },
        { header: 'PlatformFee', key: 'platformFee', width: 18, style: { numFmt: '#,##0' } },
        { header: 'PartnerNet', key: 'partnerNet', width: 18, style: { numFmt: '#,##0' } },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'CreatedAt', key: 'createdAt', width: 16 },
      ], extractItems(result).map((record: any) => ({
        month: record.month,
        grossRevenue: money(record.totalRevenue),
        platformFee: money(record.platformFee),
        partnerNet: money(record.partnerNet),
        status: record.status,
        createdAt: formatDate(record.createdAt),
      })));
    } else {
      const result = await contentService.getAllContent({
        search: options.search,
        status: options.status,
        category: options.category,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        dateRange: options.dateRange,
        paginate: false,
      });
      workbook = buildWorkbook('Content', [
        { header: 'ID', key: 'id', width: 36 },
        { header: 'Title', key: 'title', width: 36 },
        { header: 'Category', key: 'category', width: 24 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Views', key: 'views', width: 12 },
        { header: 'CreatedAt', key: 'createdAt', width: 16 },
        { header: 'UpdatedAt', key: 'updatedAt', width: 16 },
      ], extractItems(result).map((post: any) => ({
        id: post.id,
        title: post.title,
        category: post.category,
        status: post.status,
        views: post.views,
        createdAt: formatDate(post.createdAt),
        updatedAt: formatDate(post.updatedAt),
      })));
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      buffer,
      filename: `admin-${options.resource}-${getExportFileDate()}.xlsx`,
    };
  },
};
