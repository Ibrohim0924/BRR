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
  TablePagination,
  Alert,
  LinearProgress,
  InputAdornment,
  Autocomplete,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Remove,
  Search,
  ShoppingCart,
  Receipt,
  Delete,
  Print,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

import { salesApi, customersApi, productsApi } from '../services/api';

const saleSchema = yup.object().shape({
  customerId: yup.string().required('Mijoz tanlanishi shart'),
  paymentMethod: yup.string().required('To\'lov usuli tanlanishi shart'),
  items: yup.array().of(
    yup.object().shape({
      productId: yup.string().required('Mahsulot tanlanishi shart'),
      quantity: yup.number().positive('Miqdor musbat son bo\'lishi kerak').required('Miqdor kiritilishi shart'),
      price: yup.number().positive('Narx musbat son bo\'lishi kerak').required('Narx kiritilishi shart'),
    })
  ).min(1, 'Kamida bitta mahsulot qo\'shilishi kerak'),
  discount: yup.number().min(0, 'Chegirma manfiy bo\'lmasligi kerak').default(0),
  description: yup.string(),
});

interface SaleFormData {
  customerId: string;
  paymentMethod: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  discount?: number;
  description?: string;
}

const SaleForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SaleFormData) => void;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, loading = false }) => {
  const [customerSearch, setCustomerSearch] = useState('');
  
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: yupResolver(saleSchema),
    defaultValues: {
      customerId: '',
      paymentMethod: 'CASH',
      items: [{ productId: '', quantity: 1, price: 0 }],
      discount: 0,
      description: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedDiscount = watch('discount') || 0;

  const { data: customers } = useQuery(
    ['customersSearch', customerSearch],
    () => customersApi.search(customerSearch),
    {
      enabled: customerSearch.length > 2,
      staleTime: 30000,
    }
  );

  const { data: products } = useQuery('activeProducts', productsApi.getActive);

  const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const total = Math.max(0, subtotal - watchedDiscount);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find((p: any) => p.id === productId);
    if (product) {
      const updatedItems = [...watchedItems];
      updatedItems[index] = {
        ...updatedItems[index],
        productId,
        price: product.price,
      };
      // Update form values
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Yangi sotuv yaratish</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Customer Selection */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={customers || []}
                    getOptionLabel={(option: any) => `${option.name} - ${option.phone}`}
                    onInputChange={(_, value) => setCustomerSearch(value)}
                    onChange={(_, value) => field.onChange(value?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Mijoz *"
                        placeholder="Mijoz qidirish..."
                        error={!!errors.customerId}
                        helperText={errors.customerId?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Payment Method */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.paymentMethod}>
                    <InputLabel>To'lov usuli *</InputLabel>
                    <Select {...field} label="To'lov usuli *">
                      <MenuItem value="CASH">Naqd</MenuItem>
                      <MenuItem value="CREDIT">Qarz</MenuItem>
                      <MenuItem value="BANK_TRANSFER">Bank o'tkazmasi</MenuItem>
                      <MenuItem value="CARD">Karta</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Mahsulotlar
              </Typography>
              
              {fields.map((field, index) => (
                <Card key={field.id} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field: productField }) => (
                          <Autocomplete
                            {...productField}
                            options={products || []}
                            getOptionLabel={(option: any) => `${option.name} - ${option.price.toLocaleString()} so'm`}
                            onChange={(_, value) => {
                              productField.onChange(value?.id || '');
                              handleProductChange(index, value?.id || '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Mahsulot *"
                                error={!!errors.items?.[index]?.productId}
                                helperText={errors.items?.[index]?.productId?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field: quantityField }) => (
                          <TextField
                            {...quantityField}
                            fullWidth
                            type="number"
                            label="Miqdor *"
                            error={!!errors.items?.[index]?.quantity}
                            helperText={errors.items?.[index]?.quantity?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Controller
                        name={`items.${index}.price`}
                        control={control}
                        render={({ field: priceField }) => (
                          <TextField
                            {...priceField}
                            fullWidth
                            type="number"
                            label="Narx *"
                            InputProps={{
                              endAdornment: <InputAdornment position="end">so'm</InputAdornment>,
                            }}
                            error={!!errors.items?.[index]?.price}
                            helperText={errors.items?.[index]?.price?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <IconButton
                        color="error"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>

                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
                    Jami: {(watchedItems[index]?.quantity * watchedItems[index]?.price || 0).toLocaleString()} so'm
                  </Typography>
                </Card>
              ))}

              <Button
                startIcon={<Add />}
                onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                Mahsulot qo'shish
              </Button>
            </Grid>

            {/* Discount */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="discount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Chegirma"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">so'm</InputAdornment>,
                    }}
                    error={!!errors.discount}
                    helperText={errors.discount?.message}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    label="Izoh"
                    placeholder="Sotuv haqida qo'shimcha ma'lumot"
                  />
                )}
              />
            </Grid>

            {/* Summary */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1">
                  Oraliq jami: {subtotal.toLocaleString()} so'm
                </Typography>
                <Typography variant="body1">
                  Chegirma: -{watchedDiscount.toLocaleString()} so'm
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Jami: {total.toLocaleString()} so'm
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Sotilmoqda...' : 'Sotish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const SalesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const {
    data: salesData,
    isLoading,
    refetch,
    error,
  } = useQuery(
    ['sales', page, rowsPerPage],
    () => salesApi.getAll({
      page: page + 1,
      limit: rowsPerPage,
    }),
    {
      keepPreviousData: true,
    }
  );

  const { data: todaysSales } = useQuery('todaysSales', salesApi.getToday);

  const createMutation = useMutation(salesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('sales');
      queryClient.invalidateQueries('todaysSales');
      queryClient.invalidateQueries('dashboardStats');
      toast.success('Sotuv muvaffaqiyatli yaratildi');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Sotuv yaratishda xatolik yuz berdi');
    },
  });

  const handleSubmit = (data: SaleFormData) => {
    createMutation.mutate(data);
  };

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setDetailDialogOpen(true);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Naqd';
      case 'CREDIT':
        return 'Qarz';
      case 'BANK_TRANSFER':
        return 'Bank';
      case 'CARD':
        return 'Karta';
      default:
        return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'success';
      case 'CREDIT':
        return 'warning';
      case 'BANK_TRANSFER':
        return 'info';
      case 'CARD':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Sotuv
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={refetch} color="primary">
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Yangi sotuv
          </Button>
        </Box>
      </Box>

      {/* Today's Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {todaysSales?.totalCount || 0}
              </Typography>
              <Typography color="text.secondary">
                Bugungi sotuvlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Receipt sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {todaysSales?.totalAmount?.toLocaleString() || 0}
              </Typography>
              <Typography color="text.secondary">
                Bugungi daromad (so'm)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {salesData?.meta?.total || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami sotuvlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error handling */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ma'lumotlarni yuklashda xatolik yuz berdi
        </Alert>
      )}

      {/* Loading */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Sales Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mijoz</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Sana</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jami</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>To'lov usuli</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData?.data?.map((sale: any) => (
                <TableRow key={sale.id} hover>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {sale.id.slice(-8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                      {sale.customer?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sale.customer?.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(sale.createdAt), 'dd MMM yyyy, HH:mm', { locale: uz })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {sale.totalAmount.toLocaleString()} so'm
                    </Typography>
                    {sale.discount > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        (Chegirma: -{sale.discount.toLocaleString()})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentMethodLabel(sale.paymentMethod)}
                      color={getPaymentMethodColor(sale.paymentMethod) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(sale)}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => console.log('Print receipt')}
                      color="secondary"
                    >
                      <Print />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!salesData?.data || salesData.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Sotuvlar topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={salesData?.meta?.total || 0}
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

      {/* Sale Form Dialog */}
      <SaleForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        loading={createMutation.isLoading}
      />

      {/* Sale Details Dialog */}
      {selectedSale && (
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Sotuv tafsilotlari
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sotuv ID:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                  {selectedSale.id}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  Mijoz:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedSale.customer?.name} ({selectedSale.customer?.phone})
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sana:
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {format(new Date(selectedSale.createdAt), 'dd MMMM yyyy, HH:mm', { locale: uz })}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  To'lov usuli:
                </Typography>
                <Chip
                  label={getPaymentMethodLabel(selectedSale.paymentMethod)}
                  color={getPaymentMethodColor(selectedSale.paymentMethod) as any}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Sotilgan mahsulotlar:
                </Typography>
                <List>
                  {selectedSale.items?.map((item: any) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.product?.name}
                        secondary={`${item.quantity} × ${item.price.toLocaleString()} so'm = ${(item.quantity * item.price).toLocaleString()} so'm`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1">
                    Oraliq jami: {(selectedSale.totalAmount + selectedSale.discount).toLocaleString()} so'm
                  </Typography>
                  {selectedSale.discount > 0 && (
                    <Typography variant="body1" color="warning.main">
                      Chegirma: -{selectedSale.discount.toLocaleString()} so'm
                    </Typography>
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Jami: {selectedSale.totalAmount.toLocaleString()} so'm
                  </Typography>
                </Box>
              </Grid>

              {selectedSale.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Izoh:
                  </Typography>
                  <Typography variant="body1">
                    {selectedSale.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Yopish
            </Button>
            <Button variant="contained" startIcon={<Print />}>
              Chop etish
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SalesPage;