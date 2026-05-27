export const ACTIVE_USER_STATUSES = ['ACTIVE', 'active'] as const;
export const PENDING_USER_STATUSES = ['PENDING'] as const;
export const BLOCKED_USER_STATUSES = ['BLOCKED', 'inactive', 'banned'] as const;

export const VALID_USER_STATUSES = [
  ...ACTIVE_USER_STATUSES,
  ...PENDING_USER_STATUSES,
  ...BLOCKED_USER_STATUSES,
] as const;

export type UserStatusValue = (typeof VALID_USER_STATUSES)[number];

const includesStatus = (values: readonly string[], status?: string | null) =>
  Boolean(status && values.includes(status));

export const isActiveUserStatus = (status?: string | null) => includesStatus(ACTIVE_USER_STATUSES, status);

export const isPendingUserStatus = (status?: string | null) => includesStatus(PENDING_USER_STATUSES, status);

export const isBlockedUserStatus = (status?: string | null) => includesStatus(BLOCKED_USER_STATUSES, status);

export const isValidUserStatus = (status?: string | null): status is UserStatusValue =>
  includesStatus(VALID_USER_STATUSES, status);
