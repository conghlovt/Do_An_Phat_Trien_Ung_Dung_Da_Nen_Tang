import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  FlatList, TextInput, ActivityIndicator, Platform,
  KeyboardAvoidingView, Pressable,
} from 'react-native';

// ============================================================
// SelectDropdown — Component chọn giá trị dùng chung
// Hỗ trợ đa nền tảng (Web & Mobile) với tìm kiếm
// ============================================================

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number | null;
  onChange: (option: SelectOption) => void;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  searchable?: boolean;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  placeholder = 'Chọn...',
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
  required = false,
  searchable = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedLabel = useMemo(() => {
    if (value == null) return '';
    const found = options.find((o) => o.value === value);
    return found?.label || '';
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const keyword = search.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(keyword));
  }, [options, search]);

  const handleSelect = (option: SelectOption) => {
    onChange(option);
    setVisible(false);
    setSearch('');
  };

  const openDropdown = () => {
    if (disabled || loading) return;
    setVisible(true);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.trigger,
          disabled && styles.triggerDisabled,
          loading && styles.triggerDisabled,
        ]}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled || loading}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#008080" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <>
            <Text
              style={[styles.triggerText, !selectedLabel && styles.placeholderText]}
              numberOfLines={1}
            >
              {selectedLabel || placeholder}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Modal Dropdown */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => { setVisible(false); setSearch(''); }}
      >
        <Pressable style={styles.overlay} onPress={() => { setVisible(false); setSearch(''); }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label || 'Chọn giá trị'}</Text>
                <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search */}
              {searchable && (
                <View style={styles.searchBox}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm..."
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                    autoFocus={Platform.OS === 'web'}
                  />
                </View>
              )}

              {/* Options List */}
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => String(item.value)}
                style={styles.list}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <TouchableOpacity
                      style={[styles.optionItem, isSelected && styles.optionSelected]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {item.label}
                      </Text>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
                  </View>
                }
              />
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  required: {
    color: '#EF4444',
  },
  trigger: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  chevron: {
    fontSize: 10,
    color: '#94A3B8',
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: 500,
    ...Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' as any },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
    padding: 4,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },

  // List
  list: {
    maxHeight: 340,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  optionSelected: {
    backgroundColor: '#F0FDFA',
  },
  optionText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  optionTextSelected: {
    color: '#008080',
    fontWeight: '600',
  },
  checkmark: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Empty
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
