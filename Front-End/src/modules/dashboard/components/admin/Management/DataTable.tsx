import React, { useMemo, useState } from 'react';
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
  title,
  columns,
  data,
  onSearch,
  onFilterClick,
  onExport,
  actions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const hasActions = Boolean(actions?.length);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((item) =>
      Object.values(item)
        .map((value) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.controls}>
          <View style={styles.searchBox}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              placeholder="Tim kiem..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#475569"
            />
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={onFilterClick}>
            <Filter size={18} color="#94A3B8" />
            <Text style={styles.iconBtnText}>Bo loc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => onExport?.('excel')}>
            <Download size={18} color="#94A3B8" />
            <Text style={styles.iconBtnText}>Xuat Excel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <View style={styles.tableHeader}>
          {columns.map((col) => (
            <Text key={col.key} style={[styles.columnHeader, { flex: 1 }]}>
              {col.label}
            </Text>
          ))}
          {hasActions && <Text style={[styles.columnHeader, { width: 140, textAlign: 'center' }]}>Hanh dong</Text>}
        </View>

        <ScrollView style={styles.tableBody}>
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                {columns.map((col) => (
                  <View key={col.key} style={[styles.cell, { flex: 1 }]}>
                    {col.render ? col.render(item[col.key], item) : <Text style={styles.cellText}>{item[col.key] || '---'}</Text>}
                  </View>
                ))}

                {hasActions && (
                  <View style={[styles.cell, { width: 140, flexDirection: 'row', justifyContent: 'center', gap: 10 }]}>
                    {actions!.map((action, idx) => (
                      <TouchableOpacity key={idx} onPress={() => action.onPress(item)} style={styles.actionBtn}>
                        <action.icon size={16} color={action.color || '#94A3B8'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Khong tim thay du lieu phu hop</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.paginationInfo}>
          {`Hien thi ${filteredData.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - ${Math.min(
            currentPage * itemsPerPage,
            filteredData.length,
          )} trong ${filteredData.length}`}
        </Text>
        <View style={styles.paginationControls}>
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((v) => v - 1)}
            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
          >
            <ChevronLeft size={18} color={currentPage === 1 ? '#334155' : '#94A3B8'} />
          </TouchableOpacity>

          <View style={styles.pageNumber}>
            <Text style={styles.pageNumberText}>{currentPage}</Text>
          </View>

          <TouchableOpacity
            disabled={currentPage === totalPages || totalPages === 0}
            onPress={() => setCurrentPage((v) => v + 1)}
            style={[styles.pageBtn, (currentPage === totalPages || totalPages === 0) && styles.pageBtnDisabled]}
          >
            <ChevronRight size={18} color={currentPage === totalPages || totalPages === 0 ? '#334155' : '#94A3B8'} />
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
    gap: 16,
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
      web: { outlineStyle: 'none' } as any,
    }),
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
    color: '#94A3B8',
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
    color: '#64748B',
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
