import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../src/login/app';
import prisma from '../src/login/lib/prisma';
import fs from 'fs';

// ============================================================================
// 1. MOCKING DEPENDENCIES
// ============================================================================

// Mock Prisma Client
jest.mock('../src/login/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      voucher: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      hotel: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    },
  };
});

// Mock FS for collected-vouchers.json (Customer Wallet)
jest.mock('fs', () => {
  const original = jest.requireActual('fs') as typeof fs;
  return {
    ...original,
    writeFileSync: jest.fn(),
    readFileSync: jest.fn(),
    existsSync: jest.fn(() => true),
  };
});

jest.mock('../src/customer/services/offers.service', () => {
  return {
    OffersService: jest.fn().mockImplementation(() => ({
      async getGroupedOffers() {
        const prismaMock = require('../src/login/lib/prisma').default;
        const customerVouchers = await prismaMock.voucher.findMany({
          where: { status: 'ACTIVE', hotelId: null },
        });
        const hotelVouchers = await prismaMock.voucher.findMany({
          where: { status: 'ACTIVE', hotelId: { not: null } },
        });

        return {
          flashDeals: customerVouchers.filter((voucher: any) =>
            String(voucher.code || '').toUpperCase().includes('FLASH')
          ),
          customerRewards: customerVouchers.filter((voucher: any) =>
            !String(voucher.code || '').toUpperCase().includes('FLASH')
          ),
          hotelOffers: hotelVouchers,
          nearbyOffers: [],
        };
      },
      async getWalletVouchers(userId: string) {
        const fsMock = require('fs');
        const collected = JSON.parse(fsMock.readFileSync() || '{}');
        return collected[userId] || [];
      },
      async collectOffer(userId: string, offerId: string) {
        const prismaMock = require('../src/login/lib/prisma').default;
        const fsMock = require('fs');
        const offer = await prismaMock.voucher.findUnique({ where: { id: offerId } });

        if (!offer) {
          return { success: false, message: 'Voucher khÃ´ng tá»“n táº¡i' };
        }

        const collected = JSON.parse(fsMock.readFileSync() || '{}');
        const current = Array.isArray(collected[userId]) ? collected[userId] : [];
        collected[userId] = [...new Set([...current, offer.code])];
        fsMock.writeFileSync('collected-vouchers.json', JSON.stringify(collected));

        return {
          success: true,
          message: 'Thu th\u1eadp voucher th\u00e0nh c\u00f4ng',
          data: { code: offer.code, name: offer.name },
        };
      },
    })),
  };
});

// Mock Authentication & Authorization Middlewares
jest.mock('../src/login/middlewares/auth.middleware', () => {
  return {
    authenticate: (req: any, res: any, next: any) => {
      // Simulate authenticating an Admin/Partner based on request headers
      const authHeader = req.headers.authorization || '';
      if (authHeader.includes('admin-token')) {
        req.user = { id: 'admin-uuid-1111', role: 'admin', status: 'ACTIVE' };
      } else if (authHeader.includes('partner-token')) {
        req.user = { id: 'partner-uuid-2222', role: 'partner', status: 'ACTIVE' };
      } else {
        req.user = undefined;
      }
      next();
    },
    authorize: (roles: string[]) => (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      next();
    },
  };
});

jest.mock('../src/customer/middlewares/auth.middleware', () => {
  return {
    authenticateCustomer: (req: any, res: any, next: any) => {
      const authHeader = req.headers.authorization || '';
      if (authHeader.includes('customer-token')) {
        req.user = { id: 'customer-uuid-3333', role: 'customer' };
        next();
      } else {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
    },
    requireCustomer: (req: any, res: any, next: any) => {
      if (req.user?.role !== 'customer') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      next();
    },
    forceCustomerRole: (req: any, res: any, next: any) => {
      req.body = { ...req.body, role: 'customer' };
      next();
    },
    ensureCustomerAccountByEmail: (req: any, res: any, next: any) => next(),
    ensureCustomerRefreshToken: (req: any, res: any, next: any) => next(),
    customerOnly: [
      (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization || '';
        if (authHeader.includes('customer-token')) {
          req.user = { id: 'customer-uuid-3333', role: 'customer' };
          next();
        } else {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
      }
    ],
  };
});

jest.mock('../src/admin/middlewares/admin-permission.middleware', () => {
  return {
    permissionGuard: (module: string, action: string | string[]) => (req: any, res: any, next: any) => {
      // Simulate permission validation. Grant all to mock admin.
      if (req.user && req.user.role === 'admin') {
        return next();
      }
      return res.status(403).json({ success: false, message: 'Permission Denied' });
    },
    requireRootAdmin: (req: any, res: any, next: any) => next(),
  };
});

// ============================================================================
// 2. TEST SUITES
// ============================================================================

describe('StayHub Voucher & Logo API Test Suite', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // TEST GROUP B: Admin Voucher Tab / Scope API
  // --------------------------------------------------------------------------
  describe('GET /api/admin/vouchers (Scope & Filtration)', () => {
    const mockVouchers = [
      {
        id: 'v-cus-1',
        code: 'CUS10',
        name: 'Giảm 10% cho khách',
        hotelId: null,
        status: 'ACTIVE',
        rules: [],
        actions: [{ type: 'percent', value: 10 }],
        constraints: {},
      },
      {
        id: 'v-ptn-1',
        code: 'HOTEL20',
        name: 'Giảm 20% khách sạn',
        hotelId: 'hotel-123',
        status: 'ACTIVE',
        rules: [],
        actions: [{ type: 'percent', value: 20 }],
        constraints: {},
        hotel: { id: 'hotel-123', name: 'Rex Hotel' },
      },
    ];

    it('should return only Customer vouchers when scope=customer', async () => {
      // Mock findMany and count
      (mockPrisma.voucher.findMany as jest.Mock).mockResolvedValue([mockVouchers[0]]);
      (mockPrisma.voucher.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.hotel.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/vouchers?scope=customer')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vouchers).toHaveLength(1);
      expect(response.body.data.vouchers[0].hotelId).toBeNull();
      expect(mockPrisma.voucher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ hotelId: null }),
        })
      );
    });

    it('should return only Partner vouchers when scope=partner', async () => {
      (mockPrisma.voucher.findMany as jest.Mock).mockResolvedValue([mockVouchers[1]]);
      (mockPrisma.voucher.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.hotel.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/admin/vouchers?scope=partner')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vouchers).toHaveLength(1);
      expect(response.body.data.vouchers[0].hotelId).toBe('hotel-123');
      expect(mockPrisma.voucher.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hotelId: expect.objectContaining({ not: null }),
          }),
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // TEST GROUP C: Admin Create Voucher Customer API
  // --------------------------------------------------------------------------
  describe('POST /api/admin/vouchers (Create Customer Voucher)', () => {
    it('should successfully create a customer voucher with hotelId = null', async () => {
      const payload = {
        code: 'WELCOME50',
        name: 'Giảm 50K chào mừng',
        scope: 'customer',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 300000,
      };

      (mockPrisma.voucher.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.voucher.create as jest.Mock).mockResolvedValue({
        id: 'new-v-uuid',
        code: 'WELCOME50',
        name: 'Giảm 50K chào mừng',
        hotelId: null,
        rules: [{ type: 'minOrder', value: 300000 }],
        actions: [{ type: 'fixed', value: 50000 }],
        constraints: {},
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/admin/vouchers')
        .set('Authorization', 'Bearer admin-token')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.hotelId).toBeNull();
      expect(response.body.data.code).toBe('WELCOME50');
      expect(mockPrisma.voucher.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: 'WELCOME50',
            hotelId: null,
          }),
        })
      );
    });

    it('should return 409 conflict when duplicate system voucher code is provided', async () => {
      const payload = {
        code: 'DUPLICATE100',
        name: 'Voucher trùng',
        scope: 'customer',
        discountType: 'percent',
        discountValue: 10,
      };

      // Mock duplicate existing
      (mockPrisma.voucher.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-id' });

      const response = await request(app)
        .post('/api/admin/vouchers')
        .set('Authorization', 'Bearer admin-token')
        .send(payload);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('đã tồn tại');
    });

    it('should validate inputs and return 400 Bad Request on invalid discount percentage', async () => {
      const payload = {
        code: 'OVER100',
        name: 'Giảm 150%',
        scope: 'customer',
        discountType: 'percent',
        discountValue: 150, // invalid: percent cannot exceed 100
      };

      const response = await request(app)
        .post('/api/admin/vouchers')
        .set('Authorization', 'Bearer admin-token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('khoảng 1-100');
    });
  });

  // --------------------------------------------------------------------------
  // TEST GROUP H: Customer Offers & Wallet API
  // --------------------------------------------------------------------------
  describe('/api/customer/offers (Offers & Wallet)', () => {
    describe('GET /api/customer/offers', () => {
      it('should return grouped offers containing customer rewards and hotel offers', async () => {
        const mockDbVouchers = [
          {
            id: 'v1',
            code: 'FLASH50',
            name: 'Flash Deal 50%',
            hotelId: null,
            status: 'ACTIVE',
            rules: [],
            actions: [{ type: 'percent', value: 50 }],
            constraints: {},
          },
          {
            id: 'v2',
            code: 'HOTELOFFER',
            name: 'Rex Hotel Deal',
            hotelId: 'hotel-123',
            status: 'ACTIVE',
            rules: [],
            actions: [{ type: 'fixed', value: 100000 }],
            constraints: {},
            hotel: { id: 'hotel-123', name: 'Rex Hotel', slug: 'rex-hotel' },
          },
        ];

        (mockPrisma.voucher.findMany as jest.Mock)
          .mockResolvedValueOnce([mockDbVouchers[0]]) // customer vouchers
          .mockResolvedValueOnce([mockDbVouchers[1]]); // hotel vouchers

        const response = await request(app).get('/api/customer/offers');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.flashDeals).toHaveLength(1);
        expect(response.body.data.hotelOffers).toHaveLength(1);
      });
    });

    describe('POST /api/customer/offers/:offerId/collect', () => {
      it('should successfully collect a valid customer voucher to wallet', async () => {
        const mockOffer = {
          id: 'offer-123',
          code: 'COLLECTNEW',
          name: 'Voucher thu thập',
          hotelId: null,
          status: 'ACTIVE',
          constraints: { startDate: '2026-01-01', endDate: '2026-12-31' },
        };

        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue(mockOffer);
        (mockFs.readFileSync as jest.Mock).mockReturnValue('{}'); // empty collected json

        const response = await request(app)
          .post('/api/customer/offers/offer-123/collect')
          .set('Authorization', 'Bearer customer-token');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('thành công');
        expect(mockFs.writeFileSync).toHaveBeenCalled();
      });

      it('should fail (401) to collect voucher when not logged in', async () => {
        const response = await request(app)
          .post('/api/customer/offers/offer-123/collect'); // No auth header

        expect(response.status).toBe(401);
      });
    });
  });

  // --------------------------------------------------------------------------
  // TEST GROUP G: Partner Voucher Regression API
  // --------------------------------------------------------------------------
  describe('Partner Vouchers Regression', () => {
    describe('POST /api/v1/partner/hotels/:hotelId/vouchers/apply', () => {
      it('should apply valid partner hotel voucher successfully', async () => {
        const mockVoucher = {
          id: 'partner-v-1',
          code: 'REX100',
          name: 'Rex Discount',
          hotelId: 'hotel-rex',
          status: 'ACTIVE',
          rules: [{ type: 'minOrder', value: 500000 }],
          actions: [{ type: 'fixed', value: 100000 }],
          constraints: {},
        };

        (mockPrisma.voucher.findFirst as jest.Mock).mockResolvedValue(mockVoucher);

        const payload = {
          code: 'REX100',
          totalPrice: 600000, // Meets minOrderValue of 500k
          bookingType: 'daily',
        };

        const response = await request(app)
          .post('/api/v1/partner/hotels/hotel-rex/vouchers/apply')
          .set('Authorization', 'Bearer partner-token')
          .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.discount).toBe(100000);
        expect(response.body.data.finalPrice).toBe(500000);
      });

      it('should reject partner hotel voucher application when order value is below minimum', async () => {
        const mockVoucher = {
          id: 'partner-v-1',
          code: 'REX100',
          name: 'Rex Discount',
          hotelId: 'hotel-rex',
          status: 'ACTIVE',
          rules: [{ type: 'minOrder', value: 500000 }],
          actions: [{ type: 'fixed', value: 100000 }],
          constraints: {},
        };

        (mockPrisma.voucher.findFirst as jest.Mock).mockResolvedValue(mockVoucher);

        const payload = {
          code: 'REX100',
          totalPrice: 400000, // Below minOrderValue of 500k
        };

        const response = await request(app)
          .post('/api/v1/partner/hotels/hotel-rex/vouchers/apply')
          .set('Authorization', 'Bearer partner-token')
          .send(payload);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('chưa đạt giá trị tối thiểu');
      });
    });
  });
});
