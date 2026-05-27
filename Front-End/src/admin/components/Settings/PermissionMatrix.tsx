import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Check, Save, Shield, UsersRound, X } from 'lucide-react-native';
import { adminService } from '../../services/admin.service';
import {
  ADMIN_CONFIG_ROLES,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  PermissionAction,
  PermissionMap,
  ROOT_ADMIN_ROLES,
  createPermissionMap,
  getDefaultPermissions,
  normalizePermissions,
} from '../../utils/permissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { useAdminTheme } from '../AdminShell';

type PermissionMatrixProps = {
  currentUserRole?: string;
  onDirtyChange?: (dirty: boolean) => void;
};

const ROLE_LABELS: Record<string, { name: string; description: string }> = {
  SUPER_ADMIN: { name: 'Super Admin', description: 'Toàn quyền hệ thống' },
  admin: { name: 'Admin', description: 'Quản trị hệ thống' },
  OPERATOR: { name: 'Vận hành', description: 'Xử lý lưu trú, đặt phòng, nội dung' },
  ACCOUNTANT: { name: 'Kế toán', description: 'Theo dõi tài chính và doanh thu' },
  staff: { name: 'Nhân viên', description: 'Quyền nội bộ giới hạn' },
  partner: { name: 'Partner/Host', description: 'Chủ khách sạn/homestay' },
  customer: { name: 'Customer/User', description: 'Người dùng đặt phòng' },
};

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Quản lý người dùng',
  lodging: 'Quản lý khách sạn/homestay',
  rooms: 'Quản lý phòng',
  booking: 'Quản lý đặt phòng',
  voucher: 'Quản lý voucher',
  reviews: 'Quản lý đánh giá',
  content: 'Quản lý nội dung',
  finance: 'Quản lý tài chính',
  notifications: 'Quản lý thông báo',
};

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'Xem',
  create: 'Thêm',
  update: 'Sửa',
  delete: 'Xóa',
  approve: 'Duyệt',
  export: 'Xuất dữ liệu',
};

const emptyByRole = () =>
  ADMIN_CONFIG_ROLES.reduce((acc, role) => {
    acc[role] = getDefaultPermissions(role);
    return acc;
  }, {} as Record<string, PermissionMap>);

const clonePermissions = (permissions: Record<string, PermissionMap>) =>
  JSON.parse(JSON.stringify(permissions)) as Record<string, PermissionMap>;

export const PermissionMatrix = ({ currentUserRole, onDirtyChange }: PermissionMatrixProps) => {
  const { isLight } = useAdminTheme();
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, PermissionMap>>(() => emptyByRole());
  const [savedPermissionsByRole, setSavedPermissionsByRole] = useState<Record<string, PermissionMap>>(() => emptyByRole());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const currentPermissions = permissionsByRole[selectedRole] || createPermissionMap(false);
  const canManagePermissions = ROOT_ADMIN_ROLES.includes(currentUserRole || '');
  const dirty = useMemo(
    () => JSON.stringify(permissionsByRole) !== JSON.stringify(savedPermissionsByRole),
    [permissionsByRole, savedPermissionsByRole],
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getRolePermissions();
      const next = emptyByRole();

      (data || []).forEach((item: any) => {
        if (item?.role) {
          next[item.role] = normalizePermissions(item.role, item.permissions);
        }
      });

      setPermissionsByRole(next);
      setSavedPermissionsByRole(clonePermissions(next));
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Không thể tải cấu hình phân quyền.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const confirmDiscardChanges = () => {
    if (!dirty) return true;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.confirm('Bạn có thay đổi phân quyền chưa lưu. Bỏ thay đổi?');
    }
    return true;
  };

  const handleSelectRole = (role: string) => {
    if (role === selectedRole) return;
    if (!confirmDiscardChanges()) return;
    setPermissionsByRole(clonePermissions(savedPermissionsByRole));
    setSelectedRole(role);
    setNotice(null);
  };

  const togglePermission = (moduleId: string, actionId: PermissionAction) => {
    if (!canManagePermissions || saving) return;
    setNotice(null);

    setPermissionsByRole((prev) => {
      const rolePermissions = prev[selectedRole] || createPermissionMap(false);
      return {
        ...prev,
        [selectedRole]: {
          ...rolePermissions,
          [moduleId]: {
            ...rolePermissions[moduleId as keyof PermissionMap],
            [actionId]: !rolePermissions[moduleId as keyof PermissionMap]?.[actionId],
          },
        },
      };
    });
  };

  const handleSave = async () => {
    if (!canManagePermissions || saving || !dirty) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await adminService.updateRolePermissions(selectedRole, currentPermissions);
      const normalized = normalizePermissions(selectedRole, updated?.permissions || currentPermissions);
      const next = {
        ...permissionsByRole,
        [selectedRole]: normalized,
      };

      setPermissionsByRole(next);
      setSavedPermissionsByRole(clonePermissions(next));
      setNotice(`Đã lưu phân quyền cho ${ROLE_LABELS[selectedRole]?.name || selectedRole}.`);
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Không thể lưu cấu hình phân quyền.'));
    } finally {
      setSaving(false);
    }
  };

  const renderSkeleton = () => (
    <View style={[styles.panel, !isLight && styles.panelDark]}>
      <ActivityIndicator size="small" color="#2563EB" />
      <Text style={[styles.stateText, !isLight && styles.textLight]}>Đang tải cấu hình phân quyền...</Text>
    </View>
  );

  if (loading) return renderSkeleton();

  return (
    <View style={styles.container}>
      <View style={[styles.summary, !isLight && styles.panelDark]}>
        <View style={styles.summaryTitle}>
          <Shield size={22} color="#2563EB" />
          <View>
            <Text style={[styles.title, !isLight && styles.textLight]}>Quản lý phân quyền</Text>
            <Text style={styles.subtitle}>Chọn role và bật/tắt quyền theo từng module chức năng.</Text>
          </View>
        </View>
        {!canManagePermissions && (
          <View style={styles.warningPill}>
            <Text style={styles.warningText}>Chỉ Super Admin/Admin được lưu thay đổi</Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {notice ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <View style={styles.workspace}>
        <View style={[styles.rolePanel, !isLight && styles.panelDark]}>
          <Text style={[styles.sectionLabel, !isLight && styles.mutedTextDark]}>Nhóm vai trò</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {ADMIN_CONFIG_ROLES.length ? ADMIN_CONFIG_ROLES.map((role) => {
              const active = role === selectedRole;
              const config = ROLE_LABELS[role] || { name: role, description: role };

              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleItem, !isLight && styles.roleItemDark, active && styles.roleItemActive]}
                  onPress={() => handleSelectRole(role)}
                >
                  <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                    <UsersRound size={16} color={active ? '#FFF' : '#64748B'} />
                  </View>
                  <View style={styles.roleCopy}>
                    <Text style={[styles.roleName, !isLight && styles.textLight, active && styles.roleNameActive]}>{config.name}</Text>
                    <Text style={styles.roleDescription}>{config.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View style={styles.emptyState}>
                <Text style={styles.stateText}>Chưa có role để cấu hình.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={[styles.matrixPanel, !isLight && styles.panelDark]}>
          <View style={styles.matrixHeaderBar}>
            <View>
              <Text style={[styles.matrixTitle, !isLight && styles.textLight]}>{ROLE_LABELS[selectedRole]?.name || selectedRole}</Text>
              <Text style={styles.subtitle}>{ROLE_LABELS[selectedRole]?.description}</Text>
            </View>
            <TouchableOpacity
              style={[styles.saveButton, (!dirty || saving || !canManagePermissions) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!dirty || saving || !canManagePermissions}
            >
              {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Save size={16} color="#FFF" />}
              <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={styles.matrixTable}>
              <View style={[styles.matrixRow, styles.matrixHeadRow, !isLight && styles.matrixHeadRowDark]}>
                <View style={[styles.moduleCell, styles.headerCell]}>
                  <Text style={[styles.headerText, !isLight && styles.mutedTextDark]}>Module</Text>
                </View>
                {PERMISSION_ACTIONS.map((action) => (
                  <View key={action} style={[styles.actionCell, styles.headerCell]}>
                    <Text style={[styles.headerText, !isLight && styles.mutedTextDark]}>{ACTION_LABELS[action]}</Text>
                  </View>
                ))}
              </View>

              {PERMISSION_MODULES.map((moduleId) => (
                <View key={moduleId} style={[styles.matrixRow, !isLight && styles.matrixRowDark]}>
                  <View style={styles.moduleCell}>
                    <Text style={[styles.moduleText, !isLight && styles.textLight]}>{MODULE_LABELS[moduleId]}</Text>
                  </View>
                  {PERMISSION_ACTIONS.map((action) => {
                    const active = Boolean(currentPermissions[moduleId]?.[action]);
                    return (
                      <TouchableOpacity
                        key={`${moduleId}-${action}`}
                        style={styles.actionCell}
                        onPress={() => togglePermission(moduleId, action)}
                        disabled={!canManagePermissions || saving}
                      >
                        <View style={[styles.checkbox, !isLight && styles.checkboxDark, active && styles.checkboxActive]}>
                          {active ? <Check size={14} color="#FFF" /> : <X size={14} color={isLight ? '#CBD5E1' : '#64748B'} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  summary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  summaryTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  warningPill: { backgroundColor: '#FEF3C7', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  warningText: { color: '#92400E', fontSize: 12, fontWeight: '700' },
  workspace: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  panel: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  panelDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  rolePanel: {
    width: 300,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    maxHeight: 720,
  },
  sectionLabel: { color: '#64748B', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12 },
  roleItem: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
  roleItemDark: { borderColor: 'transparent' },
  roleItemActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  roleIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  roleIconActive: { backgroundColor: '#2563EB' },
  roleCopy: { flex: 1 },
  roleName: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  roleNameActive: { color: '#1D4ED8' },
  roleDescription: { color: '#64748B', fontSize: 12, marginTop: 3, lineHeight: 16 },
  matrixPanel: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  matrixHeaderBar: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  matrixTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  matrixTable: { minWidth: 860 },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', minHeight: 58 },
  matrixRowDark: { borderBottomColor: '#334155' },
  matrixHeadRow: { backgroundColor: '#F8FAFC' },
  matrixHeadRowDark: { backgroundColor: '#0F172A' },
  moduleCell: { width: 260, justifyContent: 'center', paddingHorizontal: 16 },
  actionCell: { width: 100, alignItems: 'center', justifyContent: 'center', padding: 10 },
  headerCell: { paddingVertical: 14 },
  headerText: { color: '#64748B', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
  moduleText: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  checkboxActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  saveButton: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 16, height: 42 },
  saveButtonDisabled: { opacity: 0.55 },
  saveButtonText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  errorBox: { borderRadius: 10, padding: 12, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: '#B91C1C', fontWeight: '700' },
  noticeBox: { borderRadius: 10, padding: 12, backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#BBF7D0' },
  noticeText: { color: '#166534', fontWeight: '700' },
  emptyState: { padding: 24, alignItems: 'center' },
  stateText: { color: '#64748B', fontSize: 14, marginTop: 10 },
  textLight: { color: '#FFF' },
  mutedTextDark: { color: '#94A3B8' },
});
