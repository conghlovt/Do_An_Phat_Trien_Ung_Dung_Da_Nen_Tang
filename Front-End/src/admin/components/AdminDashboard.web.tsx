import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AdminShell } from './AdminShell';
import { DashboardOverview } from './Overview/DashboardOverview';
import { BookingManagement } from './Management/BookingManagement';
import { LodgingManagement } from './Management/LodgingManagement';
import { PermissionMatrix } from './Settings/PermissionMatrix';
import { FinanceView } from './Finance/FinanceView';
import { UserManagement } from './Management/UserManagement';
import { VoucherManagement } from './Management/VoucherManagement';
import { ReviewManagement } from './Feedback/ReviewManagement';
import { ContentManagement } from './Content/ContentManagement';
import { adminService } from '../services/admin.service';
import {
  canAccess,
  canViewTab,
  getDefaultPermissions,
  getModuleForTab,
  normalizePermissions,
  PermissionMap,
} from '../utils/permissions';

interface AdminDashboardProps {
  user: any;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [permissions, setPermissions] = useState<PermissionMap>(() => getDefaultPermissions(user?.role));
  const [hasUnsavedPermissionChanges, setHasUnsavedPermissionChanges] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await adminService.getPermissions();
        const rolePermissions = data?.find((item: any) => item.role === user?.role)?.permissions;
        setPermissions(normalizePermissions(user?.role, rolePermissions));
      } catch (error) {
        console.error('Failed to load dashboard permissions:', error);
        setPermissions(getDefaultPermissions(user?.role));
      }
    };

    fetchPermissions();
  }, [user?.role]);

  useEffect(() => {
    if (!canViewTab(permissions, user?.role, activeTab)) {
      setActiveTab('overview');
    }
  }, [activeTab, permissions, user?.role]);

  const getModulePermissions = useCallback((tab: string) => {
    const moduleId = getModuleForTab(tab);
    if (moduleId === 'overview' || moduleId === 'roles') {
      return {
        canView: true,
        canCreate: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
        canEdit: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
        canDelete: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
        canApprove: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
        canExport: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
      };
    }

    return {
      canView: canAccess(permissions, moduleId, 'view'),
      canCreate: canAccess(permissions, moduleId, 'create'),
      canEdit: canAccess(permissions, moduleId, 'update'),
      canDelete: canAccess(permissions, moduleId, 'delete'),
      canApprove: canAccess(permissions, moduleId, 'approve'),
      canExport: canAccess(permissions, moduleId, 'export'),
    };
  }, [permissions, user?.role]);

  const currentAccess = useMemo(() => getModulePermissions(activeTab), [activeTab, getModulePermissions]);

  const requestTabChange = useCallback((nextTab: string) => {
    if (activeTab === 'roles' && hasUnsavedPermissionChanges) {
      const shouldLeave = Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.confirm('Bạn có thay đổi phân quyền chưa lưu. Rời trang này?')
        : true;
      if (!shouldLeave) return;
      setHasUnsavedPermissionChanges(false);
    }

    setActiveTab(nextTab);
  }, [activeTab, hasUnsavedPermissionChanges]);

  const renderContent = () => {
    if (!canViewTab(permissions, user?.role, activeTab)) {
      return <Text style={styles.placeholderText}>Bạn không có quyền truy cập chức năng này.</Text>;
    }

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'booking':
        return <BookingManagement permissions={currentAccess} />;
      case 'lodging':
        return <LodgingManagement permissions={currentAccess} />;
      case 'roles':
        return <PermissionMatrix currentUserRole={user?.role} onDirtyChange={setHasUnsavedPermissionChanges} />;
      case 'payment':
      case 'revenue':
        return <FinanceView />;
      case 'users':
        return <UserManagement permissions={currentAccess} currentUserRole={user?.role} currentUserId={user?.id} />;
      case 'customers':
        return <UserManagement role="customer" permissions={currentAccess} currentUserRole={user?.role} currentUserId={user?.id} />;
      case 'partners':
        return <UserManagement role="partner" permissions={currentAccess} currentUserRole={user?.role} currentUserId={user?.id} />;
      case 'staff':
        return <UserManagement role="staff" permissions={currentAccess} currentUserRole={user?.role} currentUserId={user?.id} />;
      case 'admins':
        return <UserManagement role="admin" permissions={currentAccess} currentUserRole={user?.role} currentUserId={user?.id} />;
      case 'voucher':
        return <VoucherManagement permissions={currentAccess} />;
      case 'reviews':
        return <ReviewManagement permissions={currentAccess} />;
      case 'content':
        return <ContentManagement permissions={currentAccess} />;
      default:
        return (
          <View>
            <Text style={styles.placeholderText}>Chức năng cho {activeTab} đang được phát triển...</Text>
          </View>
        );
    }
  };

  return (
    <AdminShell 
      user={user} 
      activeTab={activeTab} 
      setActiveTab={requestTabChange}
      onLogout={onLogout}
      permissions={permissions}
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          {activeTab === 'overview' && 'Tổng quan'}
          {activeTab === 'lodging' && 'Quản lý cơ sở lưu trú'}
          {activeTab === 'booking' && 'Quản lý đặt phòng'}
          {activeTab === 'voucher' && 'Chương trình ưu đãi'}
          {activeTab === 'reviews' && 'Đánh giá & Phản hồi'}
          {activeTab === 'content' && 'Quản lý nội dung'}
          {activeTab === 'users' && 'Quản lý người dùng'}
          {activeTab === 'customers' && 'Quản lý khách hàng'}
          {activeTab === 'partners' && 'Quản lý đối tác'}
          {activeTab === 'staff' && 'Quản lý nhân viên'}
          {activeTab === 'admins' && 'Quản lý quản trị viên'}
          {activeTab === 'roles' && 'Phân quyền hệ thống'}
        </Text>
        <Text style={styles.pageSubtitle}>Trạng thái hệ thống và các chỉ số hiệu suất</Text>
      </View>
      
      {renderContent()}
    </AdminShell>
  );
};

const styles = StyleSheet.create({
  pageHeader: { marginBottom: 30 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B' },
  pageSubtitle: { fontSize: 15, color: '#64748B', marginTop: 4 },
  placeholderText: { fontSize: 18, color: '#94A3B8', textAlign: 'center', marginTop: 50 },
});
