import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AdminShell } from './admin/AdminShell';
import { DashboardOverview } from './admin/Overview/DashboardOverview';
import { BookingManagement } from './admin/Management/BookingManagement';
import { LodgingManagement } from './admin/Management/LodgingManagement';
import { PermissionMatrix } from './admin/Settings/PermissionMatrix';
import { FinanceView } from './admin/Finance/FinanceView';
import { UserManagement } from './admin/Management/UserManagement';
import { VoucherManagement } from './admin/Management/VoucherManagement';
import { ReviewManagement } from './admin/Feedback/ReviewManagement';
import { ContentManagement } from './admin/Content/ContentManagement';
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
        canEdit: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
        canDelete: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
        canApprove: user?.role === 'SUPER_ADMIN' || user?.role === 'admin',
      };
    }

    return {
      canView: canAccess(permissions, moduleId, 'view'),
      canEdit: canAccess(permissions, moduleId, 'edit'),
      canDelete: canAccess(permissions, moduleId, 'delete'),
      canApprove: canAccess(permissions, moduleId, 'approve'),
    };
  }, [permissions, user?.role]);

  const currentAccess = useMemo(() => getModulePermissions(activeTab), [activeTab, getModulePermissions]);

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
        return <PermissionMatrix currentUserRole={user?.role} />;
      case 'payment':
      case 'revenue':
        return <FinanceView />;
      case 'users':
        return <UserManagement permissions={currentAccess} currentUserRole={user?.role} />;
      case 'customers':
        return <UserManagement role="customer" permissions={currentAccess} currentUserRole={user?.role} />;
      case 'partners':
        return <UserManagement role="partner" permissions={getModulePermissions('partners')} currentUserRole={user?.role} />;
      case 'staff':
        return <UserManagement role="staff" permissions={currentAccess} currentUserRole={user?.role} />;
      case 'admins':
        return <UserManagement role="admin" permissions={currentAccess} currentUserRole={user?.role} />;
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
      setActiveTab={setActiveTab}
      onLogout={onLogout}
      permissions={permissions}
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
