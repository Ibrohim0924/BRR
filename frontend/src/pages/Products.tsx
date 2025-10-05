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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Alert,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Inventory,
  TrendingUp,
  TrendingDown,
  Refresh,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

import { productsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const productSchema = yup.object().shape({
  name: yup.string().required('Mahsulot nomi kiritilishi shart'),
  type: yup.string().required('Mahsulot turi tanlanishi shart'),
  price: yup.number().positive('Narx musbat son bo\'lishi kerak').required('Narx kiritilishi shart'),
  unit: yup.string().required('O\'lchov birligi kiritilishi shart'),
  description: yup.string(),
  minStock: yup.number().min(0, 'Minimal miqdor 0 dan kam bo\'lmasligi kerak'),
});

interface ProductFormData {
  name: string;
  type: string;
  price: number;
  unit: string;
  description?: string;
  minStock?: number;
}

const ProductForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: any;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, initialData, loading = false }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: initialData || {
      name: '',
      type: '',
      price: 0,
      unit: '',
      description: '',
      minStock: 0,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        type: '',
        price: 0,
        unit: '',
        description: '',
        minStock: 0,
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
        {initialData ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
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
                    label="Mahsulot nomi *"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Turi *</InputLabel>
                    <Select {...field} label="Turi *">
                      <MenuItem value="BREAD">Non</MenuItem>
                      <MenuItem value="WATER">Suv</MenuItem>
                      <MenuItem value="OTHER">Boshqa</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="O'lchov birligi *"
                    placeholder="dona, litr, kg"
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Narxi *"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">so'm</InputAdornment>,
                    }}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="minStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Minimal miqdor"
                    error={!!errors.minStock}
                    helperText={errors.minStock?.message}
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
                    label="Tavsif"
                    placeholder="Mahsulot haqida qo'shimcha ma'lumot"
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

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const canEdit = user?.role === 'admin' || user?.role === 'accountant';

  const {
    data: productsData,
    isLoading,
    refetch,
    error,
  } = useQuery(
    ['products', page, rowsPerPage, searchTerm, typeFilter],
    () => productsApi.getAll({
      page: page + 1,
      limit: rowsPerPage,
      type: typeFilter || undefined,
    }),
    {
      keepPreviousData: true,
    }
  );

  const createMutation = useMutation(productsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      toast.success('Mahsulot muvaffaqiyatli qo\'shildi');
      setDialogOpen(false);
    },
    onError: () => {
      toast.error('Mahsulot qo\'shishda xatolik yuz berdi');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: ProductFormData }) => productsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Mahsulot muvaffaqiyatli tahrirlandi');
        setDialogOpen(false);
        setSelectedProduct(null);
      },
      onError: () => {
        toast.error('Mahsulotni tahrirlashda xatolik yuz berdi');
      },
    }
  );

  const deleteMutation = useMutation(productsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      toast.success('Mahsulot muvaffaqiyatli o\'chirildi');
    },
    onError: () => {
      toast.error('Mahsulotni o\'chirishda xatolik yuz berdi');
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Mahsulotni o\'chirishni tasdiqlaysizmi?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BREAD':
        return 'warning';
      case 'WATER':
        return 'info';
      case 'OTHER':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BREAD':
        return 'Non';
      case 'WATER':
        return 'Suv';
      case 'OTHER':
        return 'Boshqa';
      default:
        return type;
    }
  };

  const filteredProducts = productsData?.data?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mahsulotlar
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
              Yangi mahsulot
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {productsData?.meta?.total || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami mahsulotlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {filteredProducts.filter((p: any) => p.isActive).length}
              </Typography>
              <Typography color="text.secondary">
                Faol mahsulotlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {filteredProducts.filter((p: any) => p.stock < (p.minStock || 0)).length}
              </Typography>
              <Typography color="text.secondary">
                Kam qolgan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Mahsulot nomi bo'yicha qidirish..."
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
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Turi bo'yicha filter</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Turi bo'yicha filter"
                >
                  <MenuItem value="">Barchasi</MenuItem>
                  <MenuItem value="BREAD">Non</MenuItem>
                  <MenuItem value="WATER">Suv</MenuItem>
                  <MenuItem value="OTHER">Boshqa</MenuItem>
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

      {/* Products Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nomi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Turi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Narxi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>O'lchov</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Miqdor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Holat</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 'bold' }}>Amallar</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography variant="caption" color="text.secondary">
                        {product.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(product.type)}
                      color={getTypeColor(product.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {product.price.toLocaleString()} so'm
                    </Typography>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {product.stock || 0}
                      </Typography>
                      {product.stock < (product.minStock || 0) && (
                        <Chip
                          label="Kam"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.isActive ? 'Faol' : 'Nofaol'}
                      color={product.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(product)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      {user?.role === 'admin' && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(product.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {!isLoading && filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Mahsulotlar topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={productsData?.meta?.total || 0}
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

      {/* Product Form Dialog */}
      <ProductForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedProduct}
        loading={createMutation.isLoading || updateMutation.isLoading}
      />
    </Box>
  );
};

export default ProductsPage;