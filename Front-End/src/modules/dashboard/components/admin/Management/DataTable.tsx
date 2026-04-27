import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  onExport?: (type: 'excel' | 'pdf') => void;
  actions?: {
    label: string;
    icon: any;
    color?: string;
    onPress: (item: any) => void;
  }[];
}

export const DataTable: React.FC<DataTableProps> = ({ 
  title, columns, data, onSearch, onFilterClick, onExport, actions 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <View style={styles.container}>
      {/* Table Header Controls */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.controls}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput 
              placeholder="Tìm kiếm..." 
              style={styles.searchInput}
              onChangeText={onSearch}
              placeholderTextColor="#475569"
            />
          </View>
          
          <TouchableOpacity style={styles.iconBtn} onPress={onFilterClick}>
            <Filter size={18} color="#94A3B8" />
            <Text style={styles.iconBtnText}>Bộ lọc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => onExport?.('excel')}>
            <Download size={18} color="#94A3B8" />
            <Text style={styles.iconBtnText}>Xuất Excel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table Content */}
      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          {columns.map((col) => (
            <Text key={col.key} style={[styles.columnHeader, { flex: 1 }]}>{col.label}</Text>
          ))}
          {actions && <Text style={[styles.columnHeader, { width: 120, textAlign: 'center' }]}>Hành động</Text>}
        </View>

        <ScrollView style={styles.tableBody}>
          {paginatedData.length > 0 ? paginatedData.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              {columns.map((col) => (
                <View key={col.key} style={[styles.cell, { flex: 1 }]}>
                  {col.render ? col.render(item[col.key], item) : <Text style={styles.cellText}>{item[col.key] || '---'}</Text>}
                </View>
              ))}
              
              {actions && (
                <View style={[styles.cell, { width: 120, flexDirection: 'row', justifyContent: 'center', gap: 12 }]}>
                  {actions.map((action, idx) => (
                    <TouchableOpacity key={idx} onPress={() => action.onPress(item)} style={styles.actionBtn}>
                      <action.icon size={16} color={action.color || '#94A3B8'} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Không tìm thấy dữ liệu phù hợp</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Pagination */}
      <View style={styles.footer}>
        <Text style={styles.paginationInfo}>
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, data.length)} trong {data.length}
        </Text>
        <View style={styles.paginationControls}>
          <TouchableOpacity 
            disabled={currentPage === 1} 
            onPress={() => setCurrentPage(v => v - 1)}
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          >
            <ChevronLeft size={18} color={currentPage === 1 ? '#334155' : '#94A3B8'} />
          </TouchableOpacity>
          
          <View style={styles.pageNumber}>
            <Text style={styles.pageNumberText}>{currentPage}</Text>
          </View>
          
          <TouchableOpacity 
            disabled={currentPage === totalPages || totalPages === 0} 
            onPress={() => setCurrentPage(v => v + 1)}
            style={[styles.pageBtn, (currentPage === totalPages || totalPages === 0) && styles.pageBtnDisabled]}
          >
            <ChevronRight size={18} color={(currentPage === totalPages || totalPages === 0) ? '#334155' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    width: 250,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#FFF',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any
    })
  } as any,
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
  },
  iconBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tableWrapper: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableBody: {
    maxHeight: 600,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyRow: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#1E293B',
  },
  paginationInfo: {
    fontSize: 13,
    color: '#64748B',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
