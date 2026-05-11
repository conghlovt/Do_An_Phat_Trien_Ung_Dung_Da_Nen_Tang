import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../services/admin.service';
import { Trash2, ShieldAlert, Plus, X, CheckCircle, User as UserIcon, Ban, Check } from 'lucide-react-native';
import { confirmAction } from '../../utils/confirmAction';
import { ModuleAccess, ROOT_ADMIN_ROLES } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/errorMessage';
import { useAdminTheme } from '../AdminShell';

interface UserManagementProps {
  role?: 'customer' | 'partner' | 'admin' | 'staff';
  permissions?: ModuleAccess;
  currentUserRole?: string;
}

const fullAccess: ModuleAccess = { canView: true, canEdit: true, canDelete: true, canApprove: true };
const protectedRoles = ['admin', 'SUPER_ADMIN', 'OPERATOR', 'ACCOUNTANT'];

export const UserManagement: React.FC<UserManagementProps> = ({ role, permissions = fullAccess, currentUserRole }) => {
  const { isLight } = useAdminTheme();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'OPERATOR'
  });

  const fetchUsers = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      // Mapping FE role to BE role filter if needed
      let roleFilter = role;
      if (role === 'staff') roleFilter = undefined; // Staff is a mix of roles, let server handle or filter here
      if (role === 'admin') roleFilter = 'admin';

      const result = await adminService.getUsers(q, p, 10, roleFilter);
      setUsers(result.users);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsers(searchQuery, page);
  }, [fetchUsers, page, searchQuery]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleCreateUser = async () => {
    if (!permissions.canEdit) {
      Alert.alert('Lỗi', 'Bạn không có quyền tạo tài khoản');
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await adminService.createUser(formData);
      Alert.alert('Thành công', 'Đã tạo tài khoản nhân viên mới');
      setIsCreateModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'OPERATOR' });
      fetchUsers(searchQuery, page);
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể tạo tài khoản.'));
    }
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return;
    if (!permissions.canEdit) {
      Alert.alert('Lỗi', 'Bạn không có quyền cập nhật quyền');
      return;
    }
    if (!ROOT_ADMIN_ROLES.includes(currentUserRole || '') && (protectedRoles.includes(selectedUser.role) || protectedRoles.includes(newRole))) {
      Alert.alert('Lỗi', 'Chỉ Super Admin mới được quản lý tài khoản admin/nhân viên');
      return;
    }

    try {
      await adminService.updateUser(selectedUser.id, { role: newRole });
      Alert.alert('Thành công', `Đã cập nhật quyền cho ${selectedUser.username}`);
      setIsRoleModalOpen(false);
      fetchUsers(searchQuery, page);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật quyền');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!permissions.canApprove) {
      Alert.alert('Lỗi', 'Bạn không có quyền phê duyệt/khóa người dùng');
      return;
    }

    try {
      await adminService.updateUserStatus(id, status);
      Alert.alert('Thành công', `Đã chuyển trạng thái sang ${status}`);
      fetchUsers(searchQuery, page);
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể cập nhật trạng thái.'));
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!permissions.canDelete) {
      Alert.alert('Lỗi', 'Bạn không có quyền xóa người dùng');
      return;
    }
    if (!ROOT_ADMIN_ROLES.includes(currentUserRole || '') && protectedRoles.includes(user.role)) {
      Alert.alert('Lỗi', 'Chỉ Super Admin mới được xóa tài khoản admin/nhân viên');
      return;
    }

    const confirmed = await confirmAction('Xác nhận xóa', `Bạn có chắc chắn muốn xóa người dùng ${user.username}?`);
    if (!confirmed) return;

    try {
      await adminService.deleteUser(user.id);
      Alert.alert('Thành công', 'Đã xóa người dùng');
      fetchUsers(searchQuery, page);
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error, 'Không thể xóa người dùng.'));
    }
  };

  const columns = [
    { key: 'username', label: 'Tên người dùng' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Vai trò',
      render: (role: string) => {
        const roleMap: any = {
          'admin': 'Quản trị viên',
          'SUPER_ADMIN': 'Quản trị tối cao',
          'OPERATOR': 'Nhân viên vận hành',
          'ACCOUNTANT': 'Kế toán',
          'customer': 'Khách hàng',
          'partner': 'Đối tác'
        };
        return (
          <View style={[styles.badge, { backgroundColor: role === 'admin' || role === 'SUPER_ADMIN' ? 'rgba(59, 130, 246, 0.1)' : (role === 'OPERATOR' || role === 'ACCOUNTANT' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(71, 85, 105, 0.1)') }]}>
            <Text style={[styles.badgeText, { color: role === 'admin' || role === 'SUPER_ADMIN' ? (isLight ? '#2563EB' : '#60A5FA') : (role === 'OPERATOR' || role === 'ACCOUNTANT' ? (isLight ? '#B45309' : '#FBBF24') : (isLight ? '#475569' : '#94A3B8')) }]}>
              {roleMap[role] || role}
            </Text>
          </View>
        );
      }
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (status: string) => (
        <View style={[styles.badge, { 
          backgroundColor: status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : (status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)') 
        }]}>
          <Text style={[styles.badgeText, { 
            color: status === 'ACTIVE' ? (isLight ? '#047857' : '#10B981') : (status === 'PENDING' ? (isLight ? '#B45309' : '#F59E0B') : (isLight ? '#B91C1C' : '#EF4444')) 
          }]}>{status === 'ACTIVE' ? 'Hoạt động' : (status === 'PENDING' ? 'Chờ duyệt' : 'Đã khóa')}</Text>
        </View>
      )
    },
    { key: 'createdAt', label: 'Ngày tham gia', render: (date: string) => <Text style={{color: isLight ? '#64748B' : '#94A3B8'}}>{new Date(date).toLocaleDateString('vi-VN')}</Text> },
  ];

  const actions = [
    ...(permissions.canDelete ? [{ label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDeleteUser(item) }] : []),
    ...(permissions.canEdit
      ? [
          { label: 'Phân quyền', icon: ShieldAlert, color: '#F59E0B', onPress: (item: any) => {
            setSelectedUser(item);
            setIsRoleModalOpen(true);
          } },
        ]
      : []),
    ...(permissions.canApprove 
      ? [
          { label: 'Phê duyệt', icon: Check, color: '#10B981', onPress: (item: any) => handleUpdateStatus(item.id, 'ACTIVE') },
          { label: 'Khóa tài khoản', icon: Ban, color: '#EF4444', onPress: (item: any) => handleUpdateStatus(item.id, 'BLOCKED') },
        ] 
      : []),
  ];


  return (
    <View style={styles.container}>
      {permissions.canEdit && (
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreateModalOpen(true)}>
            <Plus size={18} color="#FFF" />
            <Text style={styles.createBtnText}>Tạo nhân viên mới</Text>
          </TouchableOpacity>
        </View>
      )}

      <DataTable 
        title={`Quản lý ${role ? (role === 'customer' ? 'Khách hàng' : role === 'partner' ? 'Đối tác' : role === 'staff' ? 'Nhân viên' : 'Quản trị viên') : 'người dùng'}`}
        columns={columns}
        data={users}
        onSearch={handleSearch}
        actions={actions}
        serverSide
        loading={loading}
        totalCount={totalCount}
        page={page}
        onPageChange={handlePageChange}
      />

      {/* Modal Tạo nhân viên */}
      <Modal visible={isCreateModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, !isLight && styles.modalContentDark]}>
            <View style={[styles.modalHeader, !isLight && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, !isLight && styles.textLight]}>Tạo tài khoản nhân viên</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={24} color={isLight ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, !isLight && styles.mutedTextDark]}>Tên nhân viên</Text>
                <TextInput 
                  style={[styles.input, !isLight && styles.inputDark]} 
                  placeholder="Nhập tên..." 
                  placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
                  value={formData.username} 
                  onChangeText={(t) => setFormData({...formData, username: t})} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, !isLight && styles.mutedTextDark]}>Email đăng nhập</Text>
                <TextInput 
                  style={[styles.input, !isLight && styles.inputDark]} 
                  placeholder="email@example.com" 
                  placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
                  value={formData.email} 
                  autoCapitalize="none" 
                  onChangeText={(t) => setFormData({...formData, email: t})} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, !isLight && styles.mutedTextDark]}>Mật khẩu</Text>
                <TextInput 
                  style={[styles.input, !isLight && styles.inputDark]} 
                  placeholder="Mật khẩu..." 
                  placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
                  secureTextEntry 
                  value={formData.password} 
                  onChangeText={(t) => setFormData({...formData, password: t})} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, !isLight && styles.mutedTextDark]}>Vai trò</Text>
                <View style={styles.roleSelector}>
                  {['OPERATOR', 'ACCOUNTANT', 'admin', 'SUPER_ADMIN'].map((r) => {
                    const roleMap: any = {
                      'OPERATOR': 'Vận hành',
                      'ACCOUNTANT': 'Kế toán',
                      'admin': 'Quản trị',
                      'SUPER_ADMIN': 'Tối cao'
                    };
                    return (
                      <TouchableOpacity 
                        key={r}
                        style={[styles.roleBtn, !isLight && styles.roleBtnDark, formData.role === r && styles.roleBtnActive]}
                        onPress={() => setFormData({...formData, role: r})}
                      >
                        <Text style={[styles.roleBtnText, formData.role === r && styles.roleBtnTextActive]}>{roleMap[r] || r}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateUser}>
                <Text style={styles.submitBtnText}>Xác nhận tạo tài khoản</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Phân quyền */}
      <Modal visible={isRoleModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, !isLight && styles.modalContentDark]}>
            <View style={[styles.modalHeader, !isLight && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, !isLight && styles.textLight]}>Phân quyền người dùng</Text>
              <TouchableOpacity onPress={() => setIsRoleModalOpen(false)}>
                <X size={24} color={isLight ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedUserInfo}>
              <View style={styles.userAvatarLarge}>
                <UserIcon size={32} color="#FFF" />
              </View>
              <Text style={[styles.selectedUserName, !isLight && styles.textLight]}>{selectedUser?.username}</Text>
              <Text style={styles.selectedUserEmail}>{selectedUser?.email}</Text>
            </View>

            <View style={styles.roleSelectorVertical}>
              {['customer', 'partner', 'OPERATOR', 'ACCOUNTANT', 'admin', 'SUPER_ADMIN'].map((r) => {
                const roleMap: any = {
                  'customer': 'Khách hàng',
                  'partner': 'Đối tác',
                  'OPERATOR': 'Nhân viên vận hành',
                  'ACCOUNTANT': 'Kế toán',
                  'admin': 'Quản trị viên',
                  'SUPER_ADMIN': 'Quản trị tối cao'
                };
                return (
                  <TouchableOpacity 
                    key={r}
                    style={[styles.roleRow, !isLight && styles.roleRowDark, selectedUser?.role === r && styles.roleRowActive, !isLight && selectedUser?.role === r && styles.roleRowActiveDark]}
                    onPress={() => handleUpdateRole(r)}
                  >
                    <View style={styles.roleRowLeft}>
                      <View style={[styles.roleDot, { backgroundColor: selectedUser?.role === r ? '#3B82F6' : (isLight ? '#CBD5E1' : '#475569') }]} />
                      <Text style={[styles.roleRowText, !isLight && styles.mutedTextDark, selectedUser?.role === r && styles.roleRowTextActive]}>{roleMap[r] || r}</Text>
                    </View>
                    {selectedUser?.role === r && <CheckCircle size={18} color="#3B82F6" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  createBtn: { 
    backgroundColor: '#3B82F6', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 12, 
    gap: 10,
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)' } as any,
      default: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  createBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { 
    backgroundColor: '#FFFFFF', 
    width: '100%', 
    maxWidth: 500, 
    borderRadius: 24, 
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0 18px 36px rgba(15, 23, 42, 0.16)' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 5,
      },
    }),
  },
  modalContentDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    ...Platform.select({
      web: { boxShadow: 'none' } as any,
      default: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0', 
    paddingBottom: 20 
  },
  modalHeaderDark: { borderBottomColor: '#334155' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  textLight: { color: '#FFFFFF' },
  form: { gap: 20 },
  inputGroup: { gap: 10, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569' },
  mutedTextDark: { color: '#94A3B8' },
  input: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#CBD5E1', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    color: '#0F172A',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  } as any,
  inputDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    color: '#FFFFFF',
  },
  roleSelector: { flexDirection: 'row', gap: 10 },
  roleBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10, 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#CBD5E1' 
  },
  roleBtnDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  roleBtnActive: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3B82F6' },
  roleBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  roleBtnTextActive: { color: '#3B82F6' },
  selectedUserInfo: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  userAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedUserName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  selectedUserEmail: { fontSize: 14, color: '#64748B' },
  roleSelectorVertical: { gap: 10 },
  roleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#CBD5E1' 
  },
  roleRowDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  roleRowActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  roleRowActiveDark: { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
  roleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleDot: { width: 8, height: 8, borderRadius: 4 },
  roleRowText: { fontSize: 14, fontWeight: '500', color: '#475569' },
  roleRowTextActive: { color: '#1D4ED8', fontWeight: '700' },
  submitBtn: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    ...Platform.select({
      web: { boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)' } as any,
      default: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
