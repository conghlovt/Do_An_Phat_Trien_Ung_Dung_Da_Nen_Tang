import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../../login/hooks/useAuth';
import { Menu } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Trang chủ', onMenuPress }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {Platform.OS === 'web' && onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} activeOpacity={0.6}>
            <Menu size={18} color="#475569" strokeWidth={2} />
          </TouchableOpacity>
        )}
        {Platform.OS !== 'web' && onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} activeOpacity={0.6}>
            <Menu size={18} color="#475569" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.right}>
        <View style={styles.userInfo}>
          {Platform.OS === 'web' && (
            <View style={{ marginRight: 10 }}>
              <Text style={styles.userName}>{user?.username || 'Người dùng'}</Text>
              <Text style={styles.userRole}>Đối tác</Text>
            </View>
          )}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)' as any,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 2,
      },
    }),
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  right: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  userName: { fontSize: 13, fontWeight: '600', color: '#1E293B', textAlign: 'right' },
  userRole: { fontSize: 11, color: '#94A3B8', textAlign: 'right' },
});
