export const PERMISSIONS = {
  // Booking
  BOOKING_CREATE: 'booking.create',
  BOOKING_READ_SELF: 'booking.read.self',
  BOOKING_CANCEL_SELF: 'booking.cancel.self',
  
  // Partner
  PARTNER_PROFILE_READ: 'partner.profile.read',
  PARTNER_ROOM_MANAGE: 'partner.room.manage',
  PARTNER_BOOKING_READ: 'partner.booking.read',
  PARTNER_BOOKING_UPDATE: 'partner.booking.update',
  PARTNER_SETTLEMENT_READ: 'partner.settlement.read',

  // Admin
  ADMIN_OPERATION_READ: 'admin.operation.read',
  ADMIN_PARTNER_APPROVE: 'admin.partner.approve',
  ADMIN_VOUCHER_MANAGE: 'admin.system_voucher.manage',
  ADMIN_PLATFORM_FEE_MANAGE: 'admin.platform_fee.manage',
  ADMIN_DISPUTE_RESOLVE: 'admin.dispute.resolve',
};

// RBAC
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  customer: [
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ_SELF,
    PERMISSIONS.BOOKING_CANCEL_SELF,
  ],
  partner: [
    PERMISSIONS.PARTNER_PROFILE_READ,
    PERMISSIONS.PARTNER_ROOM_MANAGE,
    PERMISSIONS.PARTNER_BOOKING_READ,
    PERMISSIONS.PARTNER_BOOKING_UPDATE,
    PERMISSIONS.PARTNER_SETTLEMENT_READ,
  ],
  admin: [
    PERMISSIONS.ADMIN_OPERATION_READ,
    PERMISSIONS.ADMIN_PARTNER_APPROVE,
    PERMISSIONS.ADMIN_VOUCHER_MANAGE,
    PERMISSIONS.ADMIN_PLATFORM_FEE_MANAGE,
    PERMISSIONS.ADMIN_DISPUTE_RESOLVE,
    // Admin có thể có thêm các quyền khác tuỳ quy định
  ],
};

export const hasPermission = (userRole: string | undefined, permission: string): boolean => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};