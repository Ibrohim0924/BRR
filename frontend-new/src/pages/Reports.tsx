import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assessment,
  FileDownload,
  DateRange,
  TrendingUp,
  People,
  ShoppingCart,
  Receipt,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { uz } from 'date-fns/locale';

import {
  dashboardApi,
  salesApi,
  expensesApi,
  customersApi,
  productsApi,
} from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });

  // Dashboard stats
  const { data: dashStats } = useQuery('dashboardStats', dashboardApi.getStats);
  
  // Monthly data
  const { data: monthlyReport } = useQuery(
    ['monthlyReport', dateRange.start.getFullYear(), dateRange.start.getMonth() + 1],
    () => dashboardApi.getMonthlyReport(
      dateRange.start.getFullYear(),
      dateRange.start.getMonth() + 1
    )
  );

  // Sales data
  const { data: salesData, isLoading: salesLoading } = useQuery(
    ['salesReport'],
    () => salesApi.getAll({ page: 1, limit: 1000 })
  );

  // Expenses data
  const { data: expensesData, isLoading: expensesLoading } = useQuery(
    ['expensesReport'],
    () => expensesApi.getAll({ page: 1, limit: 1000 })
  );

  // Customers with debt
  const { data: customersWithDebt } = useQuery('customersWithDebt', customersApi.getWithDebt);

  // Products data
  const { data: productsData } = useQuery('productsReport', productsApi.getAll);

  const handleExportToExcel = (reportType: string) => {
    // In a real application, you would implement Excel export here
    console.log(`Exporting ${reportType} to Excel...`);
    // This could use libraries like xlsx or send a request to backend for PDF/Excel generation
  };

  // Prepare chart data
  const salesChartData = React.useMemo(() => {
    if (!salesData?.data) return [];
    
    const monthlyData: { [key: string]: number } = {};
    
    salesData.data.forEach((sale: any) => {
      const month = format(new Date(sale.createdAt), 'yyyy-MM');
      monthlyData[month] = (monthlyData[month] || 0) + sale.totalAmount;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy', { locale: uz }),
        amount,
      }));
  }, [salesData]);

  const expensesChartData = React.useMemo(() => {
    if (!expensesData?.data) return [];
    
    const categoryData: { [key: string]: number } = {};
    
    expensesData.data.forEach((expense: any) => {
      categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryData).map(([category, amount]) => ({
      category: getCategoryLabel(category),
      amount,
    }));
  }, [expensesData]);

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'SALARY': 'Ish haqi',
      'UTILITIES': 'Kommunal',
      'RAW_MATERIALS': 'Xom ashyo',
      'EQUIPMENT': 'Asboblar',
      'TRANSPORT': 'Transport',
      'MARKETING': 'Marketing',
      'MAINTENANCE': 'Ta\'mir',
      'OTHER': 'Boshqa',
    };
    return labels[category] || category;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Hisobotlar
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={() => handleExportToExcel('all')}
        >
          Excel yuklab olish
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashStats?.totalSales?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami sotuv (so'm)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashStats?.totalExpenses?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami xarajat (so'm)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {((dashStats?.totalSales || 0) - (dashStats?.totalExpenses || 0)).toLocaleString()}
              </Typography>
              <Typography color="text.secondary">
                Foyda (so'm)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {customersWithDebt?.length || 0}
              </Typography>
              <Typography color="text.secondary">
                Qarzdor mijozlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Boshlanish sanasi"
                value={dateRange.start}
                onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, start: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Tugash sanasi"
                value={dateRange.end}
                onChange={(newValue) => newValue && setDateRange(prev => ({ ...prev, end: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Assessment />}
                onClick={() => console.log('Generate report')}
              >
                Hisobot yaratish
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Sotuv hisoboti" />
          <Tab label="Xarajat hisoboti" />
          <Tab label="Mijozlar hisoboti" />
          <Tab label="Mahsulotlar hisoboti" />
        </Tabs>
      </Card>

      {/* Sales Report */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Oylik sotuv statistikasi
                </Typography>
                {salesLoading ? (
                  <LinearProgress />
                ) : (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value?.toLocaleString()} so'm`, 'Sotuv']} />
                        <Bar dataKey="amount" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eng yaxshi sotuvlar
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sana</TableCell>
                      <TableCell align="right">Miqdor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData?.data?.slice(0, 5).map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {format(new Date(sale.createdAt), 'dd MMM', { locale: uz })}
                        </TableCell>
                        <TableCell align="right">
                          {sale.totalAmount.toLocaleString()} so'm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Expenses Report */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Kategoriya bo'yicha xarajatlar
                </Typography>
                {expensesLoading ? (
                  <LinearProgress />
                ) : (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="amount"
                          label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {expensesChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value?.toLocaleString()} so'm`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Eng katta xarajatlar
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tavsif</TableCell>
                      <TableCell align="right">Miqdor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expensesData?.data
                      ?.sort((a: any, b: any) => b.amount - a.amount)
                      .slice(0, 5)
                      .map((expense: any) => (
                        <TableRow key={expense.id}>
                          <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {expense.description}
                          </TableCell>
                          <TableCell align="right">
                            {expense.amount.toLocaleString()} so'm
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Customers Report */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Qarzdor mijozlar ro'yxati
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mijoz nomi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Qarz miqdori</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Oxirgi sotuv</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customersWithDebt?.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Typography color="error.main" sx={{ fontWeight: 'medium' }}>
                        {customer.totalDebt.toLocaleString()} so'm
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {customer.lastSaleDate ? 
                        format(new Date(customer.lastSaleDate), 'dd MMM yyyy', { locale: uz }) :
                        'Ma\'lumot yo\'q'
                      }
                    </TableCell>
                  </TableRow>
                ))}
                {(!customersWithDebt || customersWithDebt.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        Qarzdor mijozlar yo'q
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Products Report */}
      {tabValue === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mahsulotlar hisoboti
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mahsulot nomi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Turi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Joriy miqdor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Min. miqdor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Holat</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsData?.data?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {product.type === 'BREAD' ? 'Non' : 
                       product.type === 'WATER' ? 'Suv' : 'Boshqa'}
                    </TableCell>
                    <TableCell>{product.stock || 0} {product.unit}</TableCell>
                    <TableCell>{product.minStock} {product.unit}</TableCell>
                    <TableCell>
                      {(product.stock || 0) <= product.minStock ? (
                        <Typography color="warning.main">Kam qolgan</Typography>
                      ) : (
                        <Typography color="success.main">Yetarli</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!productsData?.data || productsData.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        Mahsulotlar yo'q
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ReportsPage;