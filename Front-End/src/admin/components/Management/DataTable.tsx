import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAdminTheme } from '../AdminShell';

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
  // Server-side props
  serverSide?: boolean;
  totalCount?: number;
  loading?: boolean;
  page?: number;
  onPageChange?: (page: number) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data,
  onSearch,
  onFilterClick,
  onExport,
  actions,
  serverSide,
  totalCount,
  loading,
  page: externalPage,
  onPageChange,
}) => {
  const { isLight } = useAdminTheme();
  const [internalPage, setInternalPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;
  const hasActions = Boolean(actions?.length);

  const currentPage = serverSide ? (externalPage || 1) : internalPage;

  const filteredData = useMemo(() => {
    if (serverSide) return data; // Data is already filtered by server

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
  }, [data, searchQuery, serverSide]);

  const totalItems = serverSide ? (totalCount || 0) : filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    if (serverSide) return data; // Data is already paginated by server
    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [serverSide, data, filteredData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (serverSide) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (serverSide) {
      onSearch(query);
    } else {
      setInternalPage(1);
      onSearch(query);
    }
  };

  return (
    <View style={[styles.container, !isLight && styles.containerDark]}>
      <View style={[styles.header, !isLight && styles.headerDark]}>
        <Text style={[styles.title, !isLight && styles.textLight]}>{title}</Text>
        <View style={styles.controls}>
          <View style={[styles.searchBox, !isLight && styles.controlDark]}>
            <Search size={18} color={isLight ? '#64748B' : '#94A3B8'} />
            <TextInput
              placeholder="Tìm kiếm..."
              style={[styles.searchInput, !isLight && styles.searchInputDark]}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor={isLight ? '#94A3B8' : '#64748B'}
            />
          </View>

          <TouchableOpacity style={[styles.iconBtn, !isLight && styles.controlDark]} onPress={onFilterClick}>
            <Filter size={18} color={isLight ? '#475569' : '#94A3B8'} />
            <Text style={[styles.iconBtnText, !isLight && styles.mutedTextDark]}>Bộ lọc</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, !isLight && styles.controlDark]} onPress={() => onExport?.('excel')}>
            <Download size={18} color={isLight ? '#475569' : '#94A3B8'} />
            <Text style={[styles.iconBtnText, !isLight && styles.mutedTextDark]}>Xuất Excel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <View style={[styles.tableHeader, !isLight && styles.tableHeaderDark]}>
          {columns.map((col) => (
            <Text key={col.key} style={[styles.columnHeader, !isLight && styles.columnHeaderDark, { flex: 1 }]}>
              {col.label}
            </Text>
          ))}
          {hasActions && <Text style={[styles.columnHeader, !isLight && styles.columnHeaderDark, { width: 140, textAlign: 'center' }]}>Hành động</Text>}
        </View>

        <ScrollView style={styles.tableBody}>
          {loading ? (
            <View style={styles.emptyRow}>
               <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <View
                key={item.id || index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                  !isLight && styles.tableRowDark,
                  !isLight && index % 2 === 1 && styles.tableRowAltDark,
                ]}
              >
                {columns.map((col) => (
                  <View key={col.key} style={[styles.cell, { flex: 1 }]}>
                    {col.render ? col.render(item[col.key], item) : <Text style={[styles.cellText, !isLight && styles.cellTextDark]}>{item[col.key] || '---'}</Text>}
                  </View>
                ))}

                {hasActions && (
                  <View style={[styles.cell, { width: 140, flexDirection: 'row', justifyContent: 'center', gap: 10 }]}>
                    {actions!.map((action, idx) => (
                      <TouchableOpacity key={idx} onPress={() => action.onPress(item)} style={[styles.actionBtn, !isLight && styles.actionBtnDark]}>
                        <action.icon size={16} color={action.color || '#94A3B8'} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, !isLight && styles.mutedTextDark]}>Không tìm thấy dữ liệu phù hợp</Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[styles.footer, !isLight && styles.footerDark]}>
        <Text style={[styles.paginationInfo, !isLight && styles.mutedTextDark]}>
          {`Hiển thị ${totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0} - ${Math.min(
            currentPage * itemsPerPage,
            totalItems,
          )} trong ${totalItems}`}
        </Text>
        <View style={styles.paginationControls}>
          <TouchableOpacity
            disabled={currentPage === 1 || loading}
            onPress={() => handlePageChange(currentPage - 1)}
            style={[styles.pageBtn, !isLight && styles.pageBtnDark, (currentPage === 1 || loading) && styles.pageBtnDisabled]}
          >
            <ChevronLeft size={18} color={currentPage === 1 ? (isLight ? '#CBD5E1' : '#334155') : (isLight ? '#475569' : '#94A3B8')} />
          </TouchableOpacity>

          <View style={styles.pageNumber}>
            <Text style={styles.pageNumberText}>{currentPage}</Text>
          </View>

          <TouchableOpacity
            disabled={currentPage === totalPages || totalPages === 0 || loading}
            onPress={() => handlePageChange(currentPage + 1)}
            style={[styles.pageBtn, !isLight && styles.pageBtnDark, (currentPage === totalPages || totalPages === 0 || loading) && styles.pageBtnDisabled]}
          >
            <ChevronRight size={18} color={currentPage === totalPages || totalPages === 0 ? (isLight ? '#CBD5E1' : '#334155') : (isLight ? '#475569' : '#94A3B8')} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)' } as any,
      default: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 3,
      },
    }),
  },
  containerDark: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  headerDark: {
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  textLight: {
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    width: 250,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  controlDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  } as any,
  searchInputDark: {
    color: '#FFFFFF',
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
  },
  iconBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  mutedTextDark: {
    color: '#94A3B8',
  },
  tableWrapper: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderDark: {
    backgroundColor: '#0F172A',
    borderBottomColor: '#334155',
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  columnHeaderDark: {
    color: '#94A3B8',
  },
  tableBody: {
    maxHeight: 600,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableRowDark: {
    backgroundColor: '#1E293B',
    borderBottomColor: '#334155',
  },
  tableRowAltDark: {
    backgroundColor: '#172133',
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#334155',
  },
  cellTextDark: {
    color: '#CBD5E1',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionBtnDark: {
    backgroundColor: '#0F172A',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerDark: {
    backgroundColor: '#1E293B',
    borderTopColor: '#334155',
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
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  pageBtnDark: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
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
