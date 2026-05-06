import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Shield, Check, X } from 'lucide-react-native';
import { adminService } from '../../../services/admin.service';
import { ROOT_ADMIN_ROLES } from '../../../utils/permissions';

const MODULES = [
  { id: 'revenue', name: 'Doanh thu' },
  { id: 'booking', name: 'Booking' },
  { id: 'lodging', name: 'Luu tru' },
  { id: 'users', name: 'Nguoi dung' },
  { id: 'partners', name: 'Doi tac' },
  { id: 'finance', name: 'Doi soat' },
  { id: 'voucher', name: 'Voucher' },
  { id: 'reviews', name: 'Danh gia' },
  { id: 'content', name: 'Noi dung' },
];

const ACTIONS = [
  { id: 'view', name: 'Xem' },
  { id: 'edit', name: 'Sua' },
  { id: 'delete', name: 'Xoa' },
  { id: 'approve', name: 'Duyet' },
];

const ROLES = [
  { id: 'SUPER_ADMIN', name: 'Super Admin' },
  { id: 'OPERATOR', name: 'Editor/Operator' },
  { id: 'ACCOUNTANT', name: 'Accountant' },
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
      Alert.alert('Loi', 'Chi Super Admin moi duoc luu cau hinh phan quyen');
      return;
    }

    try {
      await adminService.updatePermissions(selectedRole, currentPermissions);
      Alert.alert('Thanh cong', `Da luu cau hinh quyen cho ${selectedRole}`);
      fetchPermissions();
    } catch (error: any) {
      Alert.alert('Loi', error.response?.data?.message || 'Khong the luu phan quyen');
    }
  };

  if (loading) return <View style={styles.container}><Text style={styles.title}>Dang tai cau hinh quyen...</Text></View>;
  if (!canManagePermissions) {
    return <View style={styles.container}><Text style={styles.title}>Ban khong co quyen cau hinh phan quyen.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color="#3B82F6" />
        <Text style={styles.title}>Quan ly phan quyen</Text>
      </View>

      <View style={styles.roleTabs}>
        {ROLES.map((role) => (
          <TouchableOpacity key={role.id} style={[styles.roleTab, selectedRole === role.id && styles.roleTabActive]} onPress={() => setSelectedRole(role.id)}>
            <Text style={[styles.roleTabText, selectedRole === role.id && styles.roleTabTextActive]}>{role.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.matrixContainer}>
        <View style={styles.matrixHeader}>
          <View style={[styles.matrixCell, { flex: 2 }]}>
            <Text style={styles.columnLabel}>Module</Text>
          </View>
          {ACTIONS.map((action) => (
            <View key={action.id} style={[styles.matrixCell, { flex: 1 }]}>
              <Text style={styles.columnLabel}>{action.name}</Text>
            </View>
          ))}
        </View>

        <ScrollView>
          {MODULES.map((module) => (
            <View key={module.id} style={styles.matrixRow}>
              <View style={[styles.matrixCell, { flex: 2 }]}>
                <Text style={styles.moduleName}>{module.name}</Text>
              </View>

              {ACTIONS.map((action) => {
                const isActive = currentPermissions[module.id]?.[action.id];
                return (
                  <TouchableOpacity key={action.id} style={[styles.matrixCell, { flex: 1 }]} onPress={() => togglePermission(module.id, action.id)}>
                    <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                      {isActive ? <Check size={14} color="#FFF" /> : <X size={14} color="#CBD5E1" />}
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
          <Text style={styles.saveBtnText}>Luu cau hinh</Text>
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
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 4,
    borderRadius: 12,
    marginBottom: 30,
    gap: 4,
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
  matrixHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  moduleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    alignSelf: 'flex-start',
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
