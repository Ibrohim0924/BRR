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
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Alert,
  LinearProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  People,
  Phone,
  Home,
  Payment,
  History,
  AccountBalance,
  Refresh,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

import { customersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const customerSchema = yup.object().shape({
  name: yup.string().required('Mijoz nomi kiritilishi shart'),
  phone: yup.string().required('Telefon raqami kiritilishi shart'),
  address: yup.string(),
  description: yup.string(),
});

const paymentSchema = yup.object().shape({
  customerId: yup.string().required('Mijoz tanlanishi shart'),
  amount: yup.number().positive('Miqdor musbat son bo\'lishi kerak').required('Miqdor kiritilishi shart'),
  paymentMethod: yup.string().required('To\'lov usuli tanlanishi shart'),
  description: yup.string(),
});

interface CustomerFormData {
  name: string;
  phone: string;
  address?: string;
  description?: string;
}

interface PaymentFormData {
  customerId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
}

const CustomerForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  initialData?: any;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, initialData, loading = false }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: yupResolver(customerSchema),
    defaultValues: initialData || {
      name: '',
      phone: '',
      address: '',
      description: '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        phone: '',
        address: '',
        description: '',
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
        {initialData ? 'Mijozni tahrirlash' : 'Yangi mijoz qo\'shish'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mijoz nomi *"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Telefon raqami *"
                    placeholder="+998901234567"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Manzil"
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Izoh"
                    placeholder="Mijoz haqida qo'shimcha ma'lumot"
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

const PaymentForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  customerId?: string;
  customerName?: string;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, customerId, customerName, loading = false }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      customerId: customerId || '',
      amount: 0,
      paymentMethod: 'CASH',
      description: '',
    },
  });

  React.useEffect(() => {
    if (customerId) {
      reset({
        customerId,
        amount: 0,
        paymentMethod: 'CASH',
        description: '',
      });
    }
  }, [customerId, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        To'lov qo'shish
        {customerName && (
          <Typography variant="subtitle2" color="text.secondary">
            Mijoz: {customerName}
          </Typography>
        )}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="To'lov miqdori *"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Payment />
                        </InputAdornment>
                      ),
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
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="To'lov usuli *"
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="CASH">Naqd</option>
                    <option value="BANK_TRANSFER">Bank o'tkazmasi</option>
                    <option value="CARD">Karta</option>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Izoh"
                    placeholder="To'lov haqida qo'shimcha ma'lumot"
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
            {loading ? 'Saqlanmoqda...' : 'To\'lov qo\'shish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  const {
    data: customersData,
    isLoading,
    refetch,
    error,
  } = useQuery(
    ['customers', page, rowsPerPage, searchTerm],
    () => customersApi.getAll({
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm || undefined,
    }),
    {
      keepPreviousData: true,
    }
  );

  const { data: customersWithDebt } = useQuery('customersWithDebt', customersApi.getWithDebt);

  const {
    data: customerPayments,
    isLoading: paymentsLoading,
  } = useQuery(
    ['customerPayments', selectedCustomer?.id],
    () => customersApi.getPayments(selectedCustomer.id),
    {
      enabled: !!selectedCustomer?.id && detailDialogOpen,
    }
  );

  const createMutation = useMutation(customersApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers');
      toast.success('Mijoz muvaffaqiyatli qo\'shildi');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Mijoz qo\'shishda xatolik yuz berdi');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: CustomerFormData }) => customersApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
        toast.success('Mijoz muvaffaqiyatli tahrirlandi');
        setDialogOpen(false);
        setSelectedCustomer(null);
      },
      onError: () => {
        toast.error('Mijozni tahrirlashda xatolik yuz berdi');
      },
    }
  );

  const deleteMutation = useMutation(customersApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('customers');
      toast.success('Mijoz muvaffaqiyatli o\'chirildi');
    },
    onError: () => {
      toast.error('Mijozni o\'chirishda xatolik yuz berdi');
    },
  });

  const paymentMutation = useMutation(customersApi.addPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      queryClient.invalidateQueries(['customerPayments']);
      queryClient.invalidateQueries(['customersWithDebt']);
      toast.success('To\'lov muvaffaqiyatli qo\'shildi');
      setPaymentDialogOpen(false);
    },
    onError: () => {
      toast.error('To\'lov qo\'shishda xatolik yuz berdi');
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    if (selectedCustomer) {
      updateMutation.mutate({ id: selectedCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePaymentSubmit = (data: PaymentFormData) => {
    paymentMutation.mutate(data);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Mijozni o\'chirishni tasdiqlaysizmi?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handlePayment = (customer: any) => {
    setSelectedCustomer(customer);
    setPaymentDialogOpen(true);
  };

  const handleViewDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailDialogOpen(true);
    setDetailTab(0);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Naqd';
      case 'BANK_TRANSFER':
        return 'Bank';
      case 'CARD':
        return 'Karta';
      default:
        return method;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mijozlar
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={refetch} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddNew}
          >
            Yangi mijoz
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {customersData?.meta?.total || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami mijozlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                {customersWithDebt?.length || 0}
              </Typography>
              <Typography color="text.secondary">
                Qarzdor mijozlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Payment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {customersWithDebt?.reduce((sum: number, c: any) => sum + (c.totalDebt || 0), 0)?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami qarz (so'm)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Mijoz nomi yoki telefon raqami bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
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

      {/* Customers Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Mijoz</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Telefon</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Manzil</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Qarz</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customersData?.data?.map((customer: any) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {customer.name}
                      </Typography>
                      {customer.description && (
                        <Typography variant="caption" color="text.secondary">
                          {customer.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {customer.address || 'Kiritilmagan'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {customer.totalDebt > 0 ? (
                      <Chip
                        label={`${customer.totalDebt.toLocaleString()} so'm`}
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Qarz yo'q"
                        color="success"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(customer)}
                        color="info"
                        title="Ma'lumotlarni ko'rish"
                      >
                        <History />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePayment(customer)}
                        color="success"
                        title="To'lov qo'shish"
                      >
                        <Payment />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(customer)}
                        color="primary"
                        title="Tahrirlash"
                      >
                        <Edit />
                      </IconButton>
                      {user?.role === 'admin' && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(customer.id)}
                          color="error"
                          title="O'chirish"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!customersData?.data || customersData.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Mijozlar topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={customersData?.meta?.total || 0}
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

      {/* Customer Form Dialog */}
      <CustomerForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedCustomer}
        loading={createMutation.isLoading || updateMutation.isLoading}
      />

      {/* Payment Form Dialog */}
      <PaymentForm
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handlePaymentSubmit}
        customerId={selectedCustomer?.id}
        customerName={selectedCustomer?.name}
        loading={paymentMutation.isLoading}
      />

      {/* Customer Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedCustomer(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Mijoz ma'lumotlari: {selectedCustomer?.name}
        </DialogTitle>
        <DialogContent>
          <Tabs value={detailTab} onChange={(_, newTab) => setDetailTab(newTab)}>
            <Tab label="Umumiy ma'lumotlar" />
            <Tab label="To'lovlar tarixi" />
          </Tabs>
          
          {detailTab === 0 && selectedCustomer && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telefon raqami:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedCustomer.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Jami qarz:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, color: selectedCustomer.totalDebt > 0 ? 'error.main' : 'success.main' }}>
                    {selectedCustomer.totalDebt?.toLocaleString() || 0} so'm
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Manzil:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedCustomer.address || 'Kiritilmagan'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Izoh:
                  </Typography>
                  <Typography variant="body1">
                    {selectedCustomer.description || 'Izoh yo\'q'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {detailTab === 1 && (
            <Box sx={{ mt: 2 }}>
              {paymentsLoading ? (
                <LinearProgress />
              ) : (
                <List>
                  {customerPayments?.data?.map((payment: any) => (
                    <React.Fragment key={payment.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {payment.amount.toLocaleString()} so'm
                              </Typography>
                              <Chip
                                label={getPaymentMethodLabel(payment.paymentMethod)}
                                size="small"
                                color="primary"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(payment.createdAt), 'dd MMMM yyyy, HH:mm', { locale: uz })}
                              </Typography>
                              {payment.description && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {payment.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  {(!customerPayments?.data || customerPayments.data.length === 0) && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      To'lovlar tarixi yo'q
                    </Typography>
                  )}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Yopish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersPage;