import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';

export type MessageType = 'success' | 'error' | 'warning';

interface MessageModalProps {
  visible: boolean;
  type?: MessageType;
  title?: string;
  message: string;
  onClose: () => void;
}

const TYPE_CONFIG: Record<MessageType, { icon: React.ElementType; color: string; bg: string; defaultTitle: string }> = {
  success: { icon: CheckCircle, color: '#10B981', bg: '#ECFDF5', defaultTitle: 'Thành công!' },
  error:   { icon: XCircle,     color: '#EF4444', bg: '#FEF2F2', defaultTitle: 'Có lỗi xảy ra' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', defaultTitle: 'Cảnh báo' },
};

export function MessageModal({ visible, type = 'success', title, message, onClose }: MessageModalProps) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  const displayTitle = title || cfg.defaultTitle;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={[styles.iconWrapper, { backgroundColor: cfg.bg }]}>  
            <Icon size={48} color={cfg.color} />
          </View>
          <Text style={[styles.title, { color: cfg.color }]}>{displayTitle}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: cfg.color }]} onPress={onClose}>
            <Text style={styles.btnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFF',
    width: 340,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
