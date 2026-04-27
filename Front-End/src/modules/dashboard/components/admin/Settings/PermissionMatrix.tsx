import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Shield, Check, X } from 'lucide-react-native';

const MODULES = [
  { id: 'revenue', name: 'Doanh thu' },
  { id: 'booking', name: 'Booking' },
  { id: 'lodging', name: 'Cơ sở lưu trú' },
  { id: 'users', name: 'Người dùng' },
  { id: 'partners', name: 'Đối tác' },
  { id: 'finance', name: 'Đối soát & Thanh toán' },
];

const ACTIONS = [
  { id: 'view', name: 'Xem' },
  { id: 'edit', name: 'Sửa' },
  { id: 'delete', name: 'Xóa' },
  { id: 'approve', name: 'Phê duyệt' },
];

const ROLES = [
  { id: 'SUPER_ADMIN', name: 'Super Admin' },
  { id: 'OPERATOR', name: 'Editor/Operator' },
  { id: 'ACCOUNTANT', name: 'Accountant' },
];

export const PermissionMatrix = () => {
  const [selectedRole, setSelectedRole] = useState('SUPER_ADMIN');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    'SUPER_ADMIN-revenue-view': true,
    'SUPER_ADMIN-revenue-edit': true,
    'SUPER_ADMIN-revenue-delete': true,
    'SUPER_ADMIN-revenue-approve': true,
    // Add more defaults...
  });

  const togglePermission = (moduleId: string, actionId: string) => {
    const key = `${selectedRole}-${moduleId}-${actionId}`;
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color="#3B82F6" />
        <Text style={styles.title}>Quản lý phân quyền</Text>
      </View>

      {/* Role Selection */}
      <View style={styles.roleTabs}>
        {ROLES.map((role) => (
          <TouchableOpacity 
            key={role.id}
            style={[styles.roleTab, selectedRole === role.id && styles.roleTabActive]}
            onPress={() => setSelectedRole(role.id)}
          >
            <Text style={[styles.roleTabText, selectedRole === role.id && styles.roleTabTextActive]}>
              {role.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Matrix Table */}
      <View style={styles.matrixContainer}>
        <View style={styles.matrixHeader}>
          <View style={[styles.matrixCell, { flex: 2 }]}>
            <Text style={styles.columnLabel}>Module / Tính năng</Text>
          </View>
          {ACTIONS.map(action => (
            <View key={action.id} style={[styles.matrixCell, { flex: 1 }]}>
              <Text style={styles.columnLabel}>{action.name}</Text>
            </View>
          ))}
        </View>

        <ScrollView>
          {MODULES.map(module => (
            <View key={module.id} style={styles.matrixRow}>
              <View style={[styles.matrixCell, { flex: 2 }]}>
                <Text style={styles.moduleName}>{module.name}</Text>
              </View>
              
              {ACTIONS.map(action => {
                const isActive = permissions[`${selectedRole}-${module.id}-${action.id}`];
                return (
                  <TouchableOpacity 
                    key={action.id} 
                    style={[styles.matrixCell, { flex: 1 }]}
                    onPress={() => togglePermission(module.id, action.id)}
                  >
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
        <TouchableOpacity style={styles.saveBtn}>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
