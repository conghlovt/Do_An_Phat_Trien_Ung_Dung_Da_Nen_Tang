import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { DataTable } from './DataTable';
import { adminService } from '../../../services/admin.service';
import { Edit, Trash2, ShieldAlert, Plus, X, CheckCircle, User as UserIcon } from 'lucide-react-native';

interface UserManagementProps {
  role?: 'customer' | 'partner' | 'admin' | 'staff';
}

export const UserManagement: React.FC<UserManagementProps> = ({ role }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (role) {
      if (role === 'staff') {
        setFilteredUsers(users.filter((u: any) => u.role === 'OPERATOR' || u.role === 'ACCOUNTANT'));
      } else {
        const targetRole = role.toUpperCase();
        setFilteredUsers(users.filter((u: any) => u.role === targetRole || u.role === role));
      }
    } else {
      setFilteredUsers(users);
    }
  }, [role, users]);

  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      await adminService.createUser(formData);
      Alert.alert('Thành công', 'Đã tạo tài khoản nhân viên mới');
      setIsCreateModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'OPERATOR' });
      fetchUsers();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo tài khoản');
    }
  };

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedUser) return;
    try {
      await adminService.updateUser(selectedUser.id, { role: newRole });
      Alert.alert('Thành công', `Đã cập nhật quyền cho ${selectedUser.username}`);
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật quyền');
    }
  };

  const handleDeleteUser = async (user: any) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa người dùng ${user.username}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(user.id);
              Alert.alert('Thành công', 'Đã xóa người dùng');
              fetchUsers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa người dùng');
            }
          }
        }
      ]
    );
  };

  const columns = [
    { key: 'username', label: 'Tên người dùng' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Vai trò',
      render: (role: string) => (
        <View style={[styles.badge, { backgroundColor: role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'rgba(59, 130, 246, 0.1)' : (role === 'OPERATOR' || role === 'ACCOUNTANT' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(71, 85, 105, 0.1)') }]}>
          <Text style={[styles.badgeText, { color: role === 'ADMIN' || role === 'SUPER_ADMIN' ? '#60A5FA' : (role === 'OPERATOR' || role === 'ACCOUNTANT' ? '#FBBF24' : '#94A3B8') }]}>{role}</Text>
        </View>
      )
    },
    { key: 'createdAt', label: 'Ngày tham gia', render: (date: string) => <Text style={{color: '#94A3B8'}}>{new Date(date).toLocaleDateString('vi-VN')}</Text> },
  ];

  const actions = [
    { label: 'Xóa', icon: Trash2, color: '#EF4444', onPress: (item: any) => handleDeleteUser(item) },
    { label: 'Phân quyền', icon: ShieldAlert, color: '#F59E0B', onPress: (item: any) => {
      setSelectedUser(item);
      setIsRoleModalOpen(true);
    }},
  ];

  if (loading) return <View style={styles.container}><Text style={{color: '#FFF'}}>Đang tải dữ liệu...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.createBtn} onPress={() => setIsCreateModalOpen(true)}>
          <Plus size={18} color="#FFF" />
          <Text style={styles.createBtnText}>Tạo nhân viên mới</Text>
        </TouchableOpacity>
      </View>

      <DataTable 
        title={`Quản lý ${role ? (role === 'customer' ? 'Khách hàng' : role === 'partner' ? 'Đối tác' : role === 'staff' ? 'Nhân viên' : 'Quản trị viên') : 'người dùng'}`}
        columns={columns}
        data={filteredUsers}
        onSearch={(q) => console.log('Search', q)}
        actions={actions}
      />

      {/* Modal Tạo nhân viên */}
      <Modal visible={isCreateModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo tài khoản nhân viên</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên nhân viên</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Nhập tên..." 
                  placeholderTextColor="#475569"
                  value={formData.username} 
                  onChangeText={(t) => setFormData({...formData, username: t})} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email đăng nhập</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="email@example.com" 
                  placeholderTextColor="#475569"
                  value={formData.email} 
                  autoCapitalize="none" 
                  onChangeText={(t) => setFormData({...formData, email: t})} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Mật khẩu..." 
                  placeholderTextColor="#475569"
                  secureTextEntry 
                  value={formData.password} 
                  onChangeText={(t) => setFormData({...formData, password: t})} 
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vai trò</Text>
                <View style={styles.roleSelector}>
                  {['OPERATOR', 'ACCOUNTANT', 'ADMIN'].map((r) => (
                    <TouchableOpacity 
                      key={r}
                      style={[styles.roleBtn, formData.role === r && styles.roleBtnActive]}
                      onPress={() => setFormData({...formData, role: r})}
                    >
                      <Text style={[styles.roleBtnText, formData.role === r && styles.roleBtnTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Phân quyền người dùng</Text>
              <TouchableOpacity onPress={() => setIsRoleModalOpen(false)}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedUserInfo}>
              <View style={styles.userAvatarLarge}>
                <UserIcon size={32} color="#FFF" />
              </View>
              <Text style={styles.selectedUserName}>{selectedUser?.username}</Text>
              <Text style={styles.selectedUserEmail}>{selectedUser?.email}</Text>
            </View>

            <View style={styles.roleSelectorVertical}>
              {['CUSTOMER', 'PARTNER', 'OPERATOR', 'ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
                <TouchableOpacity 
                  key={r}
                  style={[styles.roleRow, selectedUser?.role === r && styles.roleRowActive]}
                  onPress={() => handleUpdateRole(r)}
                >
                  <View style={styles.roleRowLeft}>
                    <View style={[styles.roleDot, { backgroundColor: selectedUser?.role === r ? '#3B82F6' : '#334155' }]} />
                    <Text style={[styles.roleRowText, selectedUser?.role === r && styles.roleRowTextActive]}>{r}</Text>
                  </View>
                  {selectedUser?.role === r && <CheckCircle size={18} color="#3B82F6" />}
                </TouchableOpacity>
              ))}
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
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { 
    backgroundColor: '#1E293B', 
    width: '100%', 
    maxWidth: 500, 
    borderRadius: 24, 
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#334155', 
    paddingBottom: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  form: { gap: 20 },
  inputGroup: { gap: 10, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  input: { 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    color: '#FFF',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  } as any,
  roleSelector: { flexDirection: 'row', gap: 10 },
  roleBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10, 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
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
  selectedUserName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  selectedUserEmail: { fontSize: 14, color: '#64748B' },
  roleSelectorVertical: { gap: 10 },
  roleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#0F172A', 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  roleRowActive: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.05)' },
  roleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleDot: { width: 8, height: 8, borderRadius: 4 },
  roleRowText: { fontSize: 14, fontWeight: '500', color: '#94A3B8' },
  roleRowTextActive: { color: '#FFF', fontWeight: '700' },
  submitBtn: { 
    backgroundColor: '#3B82F6', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
