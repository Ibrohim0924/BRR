import React from 'react';
import { useQuery } from 'react-query';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  AttachMoney,
  Warning,
  ShoppingCart,
  Receipt,
  AccountBalance,
  Refresh,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import { dashboardApi, customersApi, warehouseApi } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  change?: number;
}

const StatCard: React.FC<{ stat: StatCard }> = ({ stat }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {stat.title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: stat.color }}>
            {stat.value}
          </Typography>
          {stat.subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {stat.subtitle}
            </Typography>
          )}
          {stat.change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp
                sx={{
                  fontSize: 16,
                  color: stat.change >= 0 ? 'success.main' : 'error.main',
                  mr: 0.5,
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: stat.change >= 0 ? 'success.main' : 'error.main' }}
              >
                {stat.change >= 0 ? '+' : ''}{stat.change}% bugun
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${stat.color}15`,
            color: stat.color,
          }}
        >
          {stat.icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const {
    data: dashStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery('dashboardStats', dashboardApi.getStats, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const {
    data: customersWithDebt,
    isLoading: debtLoading,
    refetch: refetchDebt,
  } = useQuery('customersWithDebt', customersApi.getWithDebt);

  const {
    data: lowStockItems,
    isLoading: stockLoading,
    refetch: refetchStock,
  } = useQuery('lowStockItems', warehouseApi.getLowStock);

  const handleRefresh = () => {
    refetchStats();
    refetchDebt();
    refetchStock();
  };

  if (statsLoading && !dashStats) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography>Ma'lumotlar yuklanmoqda...</Typography>
        </Box>
      </Box>
    );
  }

  if (statsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
      </Alert>
    );
  }

  const stats: StatCard[] = [
    {
      title: "Bugungi sotuv",
      value: `${dashStats?.todaySales?.totalAmount || 0} so'm`,
      subtitle: `${dashStats?.todaySales?.totalCount || 0} ta sotuv`,
      icon: <AttachMoney sx={{ fontSize: 28 }} />,
      color: '#1976d2',
      change: dashStats?.todaySales?.changePercent || 0,
    },
    {
      title: "Jami mijozlar",
      value: dashStats?.totalCustomers || 0,
      subtitle: `${dashStats?.newCustomersThisMonth || 0} yangi bu oy`,
      icon: <People sx={{ fontSize: 28 }} />,
      color: '#2e7d32',
    },
    {
      title: "Mahsulotlar",
      value: dashStats?.totalProducts || 0,
      subtitle: `${dashStats?.activeProducts || 0} faol`,
      icon: <Inventory sx={{ fontSize: 28 }} />,
      color: '#ed6c02',
    },
    {
      title: "Jami qarz",
      value: `${dashStats?.totalDebt || 0} so'm`,
      subtitle: `${dashStats?.debtorsCount || 0} mijoz`,
      icon: <AccountBalance sx={{ fontSize: 28 }} />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Bosh sahifa
        </Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard stat={stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Haftalik sotuv statistikasi
              </Typography>
              {dashStats?.weeklyChart && (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashStats.weeklyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} so'm`, 'Sotuv']} />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#1976d2"
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Eng ko'p qarzga ega mijozlar
              </Typography>
              {debtLoading ? (
                <LinearProgress />
              ) : (
                <List dense>
                  {customersWithDebt?.slice(0, 5).map((customer: any, index: number) => (
                    <ListItem key={customer.id} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          color="primary"
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={customer.name}
                        secondary={`${customer.totalDebt} so'm`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.8rem', color: 'error.main' }}
                      />
                    </ListItem>
                  ))}
                  {!customersWithDebt?.length && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Qarzdor mijozlar yo'q
                    </Typography>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alert */}
        {lowStockItems?.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ color: 'warning.main', mr: 1 }} />
                  Kam qolgan materiallar
                </Typography>
                <List dense>
                  {lowStockItems.slice(0, 5).map((item: any) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity} ${item.unit} qolgan`}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.8rem', color: 'warning.main' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Monthly Expenses */}
        {dashStats?.monthlyExpenses && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bu oylik xarajatlar
                </Typography>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashStats.monthlyExpenses}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dashStats.monthlyExpenses.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} so'm`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default DashboardPage;