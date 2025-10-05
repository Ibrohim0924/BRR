import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Alert,
  LinearProgress,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Receipt,
  TrendingUp,
  DateRange,
  Category,
  Refresh,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

import { expensesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const expenseSchema = yup.object().shape({
  description: yup.string().required('Tavsif kiritilishi shart'),
  amount: yup.number().positive('Miqdor musbat son bo\'lishi kerak').required('Miqdor kiritilishi shart'),
  category: yup.string().required('Kategoriya tanlanishi shart'),
  expenseDate: yup.date().required('Sana tanlanishi shart'),
});

const expenseCategories = [
  { value: 'SALARY', label: 'Ish haqi' },
  { value: 'UTILITIES', label: 'Kommunal xizmatlar' },
  { value: 'RAW_MATERIALS', label: 'Xom ashyo' },
  { value: 'EQUIPMENT', label: 'Asbob-uskunalar' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'MAINTENANCE', label: 'Ta\'mirlash' },
  { value: 'OTHER', label: 'Boshqa' },
];

interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  expenseDate: Date;
}

const ExpenseForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: any;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, initialData, loading = false }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(expenseSchema),
    defaultValues: initialData || {
      description: '',
      amount: 0,
      category: '',
      expenseDate: new Date(),
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        expenseDate: new Date(initialData.expenseDate),
      });
    } else {
      reset({
        description: '',
        amount: 0,
        category: '',
        expenseDate: new Date(),
      });
    }
  }, [initialData, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Xarajatni tahrirlash' : 'Yangi xarajat qo\'shish'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Xarajat tavsifi *"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Miqdor *"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">so'm</InputAdornment>,
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Kategoriya *</InputLabel>
                    <Select {...field} label="Kategoriya *">
                      {expenseCategories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="expenseDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Xarajat sanasi *"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.expenseDate,
                        helperText: errors.expenseDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : initialData ? 'Saqlash' : 'Qo\'shish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const canEdit = user?.role === 'admin' || user?.role === 'accountant';

  const {
    data: expensesData,
    isLoading,
    refetch,
    error,
  } = useQuery(
    ['expenses', page, rowsPerPage],
    () => expensesApi.getAll({
      page: page + 1,
      limit: rowsPerPage,
    }),
    {
      keepPreviousData: true,
    }
  );

  const {
    data: monthlyExpenses,
  } = useQuery(
    'monthlyExpenses',
    () => expensesApi.getMonthly(new Date().getFullYear(), new Date().getMonth() + 1)
  );

  const createMutation = useMutation(expensesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      queryClient.invalidateQueries('monthlyExpenses');
      toast.success('Xarajat muvaffaqiyatli qo\'shildi');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Xarajat qo\'shishda xatolik yuz berdi');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: ExpenseFormData }) => expensesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
        queryClient.invalidateQueries('monthlyExpenses');
        toast.success('Xarajat muvaffaqiyatli tahrirlandi');
        setDialogOpen(false);
        setSelectedExpense(null);
      },
      onError: () => {
        toast.error('Xarajatni tahrirlashda xatolik yuz berdi');
      },
    }
  );

  const deleteMutation = useMutation(expensesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      queryClient.invalidateQueries('monthlyExpenses');
      toast.success('Xarajat muvaffaqiyatli o\'chirildi');
    },
    onError: () => {
      toast.error('Xarajatni o\'chirishda xatolik yuz berdi');
    },
  });

  const handleSubmit = (data: ExpenseFormData) => {
    if (selectedExpense) {
      updateMutation.mutate({ id: selectedExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xarajatni o\'chirishni tasdiqlaysizmi?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedExpense(null);
    setDialogOpen(true);
  };

  const getCategoryLabel = (category: string) => {
    return expenseCategories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: any } = {
      'SALARY': 'primary',
      'UTILITIES': 'info',
      'RAW_MATERIALS': 'warning',
      'EQUIPMENT': 'secondary',
      'TRANSPORT': 'success',
      'MARKETING': 'error',
      'MAINTENANCE': 'default',
      'OTHER': 'default',
    };
    return colors[category] || 'default';
  };

  const filteredExpenses = expensesData?.data?.filter((expense: any) => {
    if (categoryFilter && expense.category !== categoryFilter) {
      return false;
    }
    return true;
  }) || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Xarajatlar
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={refetch} color="primary">
            <Refresh />
          </IconButton>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
            >
              Yangi xarajat
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {expensesData?.meta?.total || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami xarajatlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {monthlyExpenses?.totalAmount?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Bu oylik (so'm)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <DateRange sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {monthlyExpenses?.totalCount || 0}
              </Typography>
              <Typography color="text.secondary">
                Bu oylik soni
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Category sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {new Set(expensesData?.data?.map((e: any) => e.category)).size || 0}
              </Typography>
              <Typography color="text.secondary">
                Kategoriyalar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Kategoriya bo'yicha filter</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Kategoriya bo'yicha filter"
                >
                  <MenuItem value="">Barchasi</MenuItem>
                  {expenseCategories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error handling */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ma'lumotlarni yuklashda xatolik yuz berdi
        </Alert>
      )}

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Expenses Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Tavsif</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Kategoriya</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Miqdor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sana</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 'bold' }}>Amallar</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses.map((expense: any) => (
                <TableRow key={expense.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                      {expense.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(expense.category)}
                      color={getCategoryColor(expense.category)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {expense.amount.toLocaleString()} so'm
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(expense.expenseDate), 'dd MMM yyyy', { locale: uz })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(expense.createdAt), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(expense)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      {user?.role === 'admin' && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(expense.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!isLoading && filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Xarajatlar topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={expensesData?.meta?.total || 0}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Sahifadagi qatorlar:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / ${count !== -1 ? count : `${to} dan ko'p`}`
          }
        />
      </Card>

      {/* Expense Form Dialog */}
      <ExpenseForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedExpense}
        loading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Box>
  );
};

export default ExpensesPage;