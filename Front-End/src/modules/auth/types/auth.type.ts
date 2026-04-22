export type RoleCode = 'customer' | 'partner' | 'admin'

export type Permission =
  | 'booking.create'
  | 'booking.read.self'
  | 'booking.cancel.self'
  | 'partner.profile.read'
  | 'partner.room.manage'
  | 'partner.booking.read'
  | 'partner.booking.update'
  | 'partner.settlement.read'
  | 'admin.operation.read'
  | 'admin.partner.approve'
  | 'admin.system_voucher.manage'
  | 'admin.platform_fee.manage'
  | 'admin.dispute.resolve'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  roles: RoleCode[]
  permissions: Permission[]
}

export interface AuthSession {
  accessToken: string
  user: AuthUser
}