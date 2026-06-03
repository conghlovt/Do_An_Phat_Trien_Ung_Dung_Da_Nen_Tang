import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle } from 'lucide-react-native';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose?: () => void;
}

export function SuccessModal({ visible, message, onClose }: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.iconWrapper}>
            <CheckCircle size={48} color="#10B981" />
          </View>
          <Text style={styles.title}>Thành công!</Text>
          <Text style={styles.message}>{message}</Text>
          {onClose && (
            <TouchableOpacity style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>Đóng</Text>
            </TouchableOpacity>
          )}
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
    width: 320,
    borderRadius: 20,
    padding: 24,
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
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
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
    backgroundColor: '#10B981',
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
