import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react-native';
import { adminService } from '../../../services/admin.service';

const REVENUE_DATA = [
  { name: 'T2', revenue: 4000, bookings: 24 },
  { name: 'T3', revenue: 3000, bookings: 18 },
  { name: 'T4', revenue: 2000, bookings: 12 },
  { name: 'T5', revenue: 2780, bookings: 22 },
  { name: 'T6', revenue: 1890, bookings: 15 },
  { name: 'T7', revenue: 2390, bookings: 19 },
  { name: 'CN', revenue: 3490, bookings: 28 },
];

export const PARTNER_DATA = [
  { name: 'Sheraton', direct: 4000, indirect: 2400 },
  { name: 'Hilton', direct: 3000, indirect: 1398 },
  { name: 'Marriott', direct: 2000, indirect: 9800 },
  { name: 'InterCon', direct: 2780, indirect: 3908 },
];

const STATUS_DATA = [
  { name: 'Hoàn tất', value: 400, color: '#10B981' },
  { name: 'Hủy', value: 80, color: '#EF4444' },
  { name: 'Chờ duyệt', value: 120, color: '#F59E0B' },
];

export const TYPE_DATA = [
  { name: 'Theo giờ', value: 150, color: '#3B82F6' },
  { name: 'Qua đêm', value: 250, color: '#6366F1' },
  { name: 'Theo ngày', value: 200, color: '#8B5CF6' },
];

const MetricCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <View style={styles.metricCard}>
    <View style={styles.metricHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
        {trend >= 0 ? <ArrowUpRight size={14} color="#10B981" /> : <ArrowDownRight size={14} color="#EF4444" />}
        <Text style={[styles.trendText, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>{Math.abs(trend)}%</Text>
      </View>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

export const DashboardOverview = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (Platform.OS !== 'web') {
    return <View style={styles.container}><Text style={{color: '#FFF'}}>Bảng điều khiển chỉ khả dụng trên Web</Text></View>;
  }

  if (loading) {
    return <View style={styles.container}><Text style={{color: '#FFF'}}>Đang tải dữ liệu...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Metric Cards Row */}
      <View style={styles.gridRow}>
        <MetricCard 
          title="Tổng doanh thu" 
          value={`$${stats?.totalRevenue || 0}`} 
          trend={stats?.trends?.revenue || 0} 
          icon={DollarSign} 
          color="#3B82F6" 
        />
        <MetricCard 
          title="Booking mới" 
          value={stats?.totalBookings || 0} 
          trend={stats?.trends?.bookings || 0} 
          icon={Calendar} 
          color="#10B981" 
        />
        <MetricCard 
          title="Khách hàng mới" 
          value={stats?.totalUsers || 0} 
          trend={stats?.trends?.users || 0} 
          icon={Users} 
          color="#8B5CF6" 
        />
        <MetricCard 
          title="Đối tác mới" 
          value={stats?.totalProperties || 0} 
          trend={stats?.trends?.partners || 0} 
          icon={TrendingUp} 
          color="#F59E0B" 
        />
      </View>

      {/* Main Charts Row */}
      <View style={styles.chartGrid}>
        {/* Revenue Area Chart */}
        <View style={[styles.chartCard, { flex: 2 }]}>
          <Text style={styles.chartTitle}>Doanh thu & Booking theo ngày</Text>
          <View style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: '1px solid #334155', color: '#FFF' }}
                  itemStyle={{ color: '#FFF' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={3} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </View>
        </View>

        {/* Booking Status Pie Chart */}
        <View style={[styles.chartCard, { flex: 1 }]}>
          <Text style={styles.chartTitle}>Trạng thái Booking</Text>
          <View style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {STATUS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: 12, border: '1px solid #334155' }} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </View>
        </View>
      </View>

      <View style={styles.activityGrid}>
        <View style={styles.activityCard}>
          <Text style={styles.chartTitle}>Hoạt động mới nhất</Text>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.activityItem, i === 5 && { borderBottomWidth: 0 }]}>
              <View style={styles.avatarMini}>
                <Users size={18} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>Khách hàng đăng ký #{i}029</Text>
                <Text style={styles.activityDetail}>Vừa tham gia hệ thống từ Hà Nội</Text>
              </View>
              <View style={styles.activityStatus}>
                <Text style={styles.timeText}>{i * 2} phút trước</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.chartTitle}>Yêu cầu đối tác</Text>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.activityItem, i === 5 && { borderBottomWidth: 0 }]}>
              <View style={[styles.avatarMini, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <TrendingUp size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>Khách sạn ABC Luxury</Text>
                <Text style={styles.activityDetail}>Yêu cầu xét duyệt cơ sở lưu trú mới</Text>
              </View>
              <View style={styles.activityStatus}>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>Mới</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
  },
  metricTitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    minWidth: 350,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 24,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  activityCard: {
    flex: 1,
    minWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 16,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  activityDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#475569',
  },
  priorityBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
});
