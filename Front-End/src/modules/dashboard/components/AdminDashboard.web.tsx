import React, { useState } from 'react';
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

interface AdminDashboardProps {
  user: any;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'booking':
        return <BookingManagement />;
      case 'lodging':
        return <LodgingManagement />;
      case 'roles':
        return <PermissionMatrix />;
      case 'payment':
      case 'revenue':
        return <FinanceView />;
      case 'users':
        return <UserManagement />;
      case 'customers':
        return <UserManagement role="customer" />;
      case 'partners':
        return <UserManagement role="partner" />;
      case 'staff':
        return <UserManagement role="staff" />;
      case 'admins':
        return <UserManagement role="admin" />;
      case 'voucher':
        return <VoucherManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'content':
        return <ContentManagement />;
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
    >
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Text>
        <Text style={styles.pageSubtitle}>System status and performance metrics</Text>
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
