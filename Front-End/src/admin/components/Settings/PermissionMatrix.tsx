import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Shield, Check, X } from 'lucide-react-native';
import { adminService } from '../../services/admin.service';
import { ROOT_ADMIN_ROLES } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { useAdminTheme } from '../AdminShell';

const MODULES = [
  { id: 'revenue', name: 'Doanh thu' },
  { id: 'booking', name: 'Đặt phòng' },
  { id: 'lodging', name: 'Lưu trú' },
  { id: 'users', name: 'Người dùng' },
  { id: 'partners', name: 'Đối tác' },
  { id: 'finance', name: 'Đối soát' },
  { id: 'voucher', name: 'Voucher' },
  { id: 'reviews', name: 'Đánh giá' },
  { id: 'content', name: 'Nội dung' },
];

const ACTIONS = [
  { id: 'view', name: 'Xem' },
  { id: 'edit', name: 'Sửa' },
  { id: 'delete', name: 'Xóa' },
  { id: 'approve', name: 'Duyệt' },
];

const ROLES = [
  { id: 'SUPER_ADMIN', name: 'Quản trị tối cao' },
  { id: 'OPERATOR', name: 'Nhân viên vận hành' },
  { id: 'ACCOUNTANT', name: 'Kế toán' },
];

const createEmptyPermissions = () =>
  MODULES.reduce((acc, module) => {
    acc[module.id] = ACTIONS.reduce((actionAcc, action) => {
      actionAcc[action.id] = false;
      return actionAcc;
    }, {} as Record<string, boolean>);
    return acc;
  }, {} as Record<string, Record<string, boolean>>);

export const PermissionMatrix = ({ currentUserRole }: { currentUserRole?: string }) => {
  const { isLight } = useAdminTheme();
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPermissions();
      const next = (data || []).reduce((acc: any, item: any) => {
        acc[item.role] = item.permissions || createEmptyPermissions();
        return acc;
      }, {});
      setPermissionsByRole(next);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const currentPermissions = permissionsByRole[selectedRole] || createEmptyPermissions();
  const canManagePermissions = ROOT_ADMIN_ROLES.includes(currentUserRole || '');

  const togglePermission = (moduleId: string, actionId: string) => {
    if (!canManagePermissions) return;

    setPermissionsByRole((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] || createEmptyPermissions()),
        [moduleId]: {
          ...((prev[selectedRole] || createEmptyPermissions())[moduleId] || {}),
          [actionId]: !currentPermissions[moduleId]?.[actionId],
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!canManagePermissions) {
      Alert.alert('Lỗi', 'Chỉ Super Admin mới được lưu cấu hình phân quyền');
      return;
    }

    try {
      await adminService.updatePermissions(selectedRole, currentPermissions);
      Alert.alert('Thành công', `Đã lưu cấu hình quyền cho ${selectedRole}`);
      fetchPermissions();
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể lưu phân quyền.'));
    }
  };

  if (loading) return <View style={[styles.container, !isLight && styles.containerDark]}><Text style={[styles.title, !isLight && styles.textLight]}>Đang tải cấu hình quyền...</Text></View>;
  if (!canManagePermissions) {
    return <View style={[styles.container, !isLight && styles.containerDark]}><Text style={[styles.title, !isLight && styles.textLight]}>Bạn không có quyền cấu hình phân quyền.</Text></View>;
  }

  return (
    <View style={[styles.container, !isLight && styles.containerDark]}>
      <View style={styles.header}>
        <Shield size={24} color="#3B82F6" />
        <Text style={[styles.title, !isLight && styles.textLight]}>Quản lý phân quyền</Text>
      </View>

      <View style={[styles.roleTabs, !isLight && styles.roleTabsDark]}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleTab,
              selectedRole === role.id && styles.roleTabActive,
              !isLight && selectedRole === role.id && styles.roleTabActiveDark,
            ]}
            onPress={() => setSelectedRole(role.id)}
          >
            <Text style={[styles.roleTabText, selectedRole === role.id && styles.roleTabTextActive]}>{role.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.matrixContainer, !isLight && styles.matrixContainerDark]}>
        <View style={[styles.matrixHeader, !isLight && styles.matrixHeaderDark]}>
          <View style={[styles.matrixCell, { flex: 2 }]}>
            <Text style={[styles.columnLabel, !isLight && styles.columnLabelDark]}>Module</Text>
          </View>
          {ACTIONS.map((action) => (
            <View key={action.id} style={[styles.matrixCell, { flex: 1 }]}>
              <Text style={[styles.columnLabel, !isLight && styles.columnLabelDark]}>{action.name}</Text>
            </View>
          ))}
        </View>

        <ScrollView>
          {MODULES.map((module) => (
            <View key={module.id} style={[styles.matrixRow, !isLight && styles.matrixRowDark]}>
              <View style={[styles.matrixCell, { flex: 2 }]}>
                <Text style={[styles.moduleName, !isLight && styles.moduleNameDark]}>{module.name}</Text>
              </View>

              {ACTIONS.map((action) => {
                const isActive = currentPermissions[module.id]?.[action.id];
                return (
                  <TouchableOpacity key={action.id} style={[styles.matrixCell, { flex: 1 }]} onPress={() => togglePermission(module.id, action.id)}>
                    <View style={[styles.checkbox, !isLight && styles.checkboxDark, isActive && styles.checkboxActive]}>
                      {isActive ? <Check size={14} color="#FFF" /> : <X size={14} color={isLight ? '#CBD5E1' : '#64748B'} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu cấu hình</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 30,
  },
  containerDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  textLight: {
    color: '#FFFFFF',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 12,
    marginBottom: 30,
    gap: 4,
  },
  roleTabsDark: {
    backgroundColor: '#0F172A',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: '#FFF',
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
    }),
  },
  roleTabActiveDark: {
    backgroundColor: '#1E293B',
    ...Platform.select({
      web: { boxShadow: 'none' } as any,
      default: {
        shadowOpacity: 0,
      },
    }),
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#3B82F6',
  },
  matrixContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  matrixContainerDark: {
    borderColor: '#334155',
  },
  matrixHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  matrixHeaderDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#334155',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  matrixRowDark: {
    borderBottomColor: '#334155',
  },
  matrixCell: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  columnLabelDark: {
    color: '#94A3B8',
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    alignSelf: 'flex-start',
  },
  moduleNameDark: {
    color: '#E2E8F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  footer: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
