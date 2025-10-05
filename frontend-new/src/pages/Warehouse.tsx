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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warehouse as WarehouseIcon,
  Inventory,
  TrendingDown,
  TrendingUp,
  Refresh,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

import { warehouseApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const materialSchema = yup.object().shape({
  name: yup.string().required('Material nomi kiritilishi shart'),
  unit: yup.string().required('O\'lchov birligi kiritilishi shart'),
  minStock: yup.number().min(0, 'Minimal miqdor 0 dan kam bo\'lmasligi kerak').required('Minimal miqdor kiritilishi shart'),
  description: yup.string(),
});

const movementSchema = yup.object().shape({
  materialId: yup.string().required('Material tanlanishi shart'),
  type: yup.string().required('Harakat turi tanlanishi shart'),
  quantity: yup.number().positive('Miqdor musbat son bo\'lishi kerak').required('Miqdor kiritilishi shart'),
  unitCost: yup.number().positive('Narx musbat son bo\'lishi kerak'),
  description: yup.string(),
});

interface MaterialFormData {
  name: string;
  unit: string;
  minStock: number;
  description?: string;
}

interface MovementFormData {
  materialId: string;
  type: string;
  quantity: number;
  unitCost?: number;
  description?: string;
}

const MaterialForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MaterialFormData) => void;
  initialData?: any;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, initialData, loading = false }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: yupResolver(materialSchema),
    defaultValues: initialData || {
      name: '',
      unit: '',
      minStock: 0,
      description: '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        unit: '',
        minStock: 0,
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
        {initialData ? 'Materialni tahrirlash' : 'Yangi material qo\'shish'}
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
                    label="Material nomi *"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
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
                    placeholder="kg, litr, dona"
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
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
                    label="Minimal miqdor *"
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
                    placeholder="Material haqida qo'shimcha ma'lumot"
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

const MovementForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MovementFormData) => void;
  materials: any[];
  loading?: boolean;
}> = ({ open, onClose, onSubmit, materials, loading = false }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovementFormData>({
    resolver: yupResolver(movementSchema),
    defaultValues: {
      materialId: '',
      type: 'IN',
      quantity: 0,
      unitCost: 0,
      description: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ombor harakati qo'shish</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="materialId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.materialId}>
                    <InputLabel>Material *</InputLabel>
                    <Select {...field} label="Material *">
                      {materials.map((material) => (
                        <MenuItem key={material.id} value={material.id}>
                          {material.name} ({material.unit})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Harakat turi *</InputLabel>
                    <Select {...field} label="Harakat turi *">
                      <MenuItem value="IN">Kirim</MenuItem>
                      <MenuItem value="OUT">Chiqim</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Miqdor *"
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="unitCost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Birlik narxi"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">so'm</InputAdornment>,
                    }}
                    error={!!errors.unitCost}
                    helperText={errors.unitCost?.message}
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
                    placeholder="Harakat haqida qo'shimcha ma'lumot"
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
            {loading ? 'Saqlanmoqda...' : 'Qo\'shish'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const WarehousePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const canEdit = user?.role === 'admin' || user?.role === 'accountant';

  const {
    data: materialsData,
    isLoading: materialsLoading,
    refetch: refetchMaterials,
    error: materialsError,
  } = useQuery(
    ['materials', page, rowsPerPage],
    () => warehouseApi.getMaterials({
      page: page + 1,
      limit: rowsPerPage,
    }),
    {
      keepPreviousData: true,
    }
  );

  const {
    data: movementsData,
    isLoading: movementsLoading,
    refetch: refetchMovements,
  } = useQuery(
    ['movements', page, rowsPerPage],
    () => warehouseApi.getMovements({
      page: page + 1,
      limit: rowsPerPage,
    }),
    {
      keepPreviousData: true,
      enabled: tabValue === 1,
    }
  );

  const { data: lowStockItems } = useQuery('lowStockItems', warehouseApi.getLowStock);

  const createMaterialMutation = useMutation(warehouseApi.createMaterial, {
    onSuccess: () => {
      queryClient.invalidateQueries('materials');
      toast.success('Material muvaffaqiyatli qo\'shildi');
      setMaterialDialogOpen(false);
    },
    onError: () => {
      toast.error('Material qo\'shishda xatolik yuz berdi');
    },
  });

  const updateMaterialMutation = useMutation(
    ({ id, data }: { id: string; data: MaterialFormData }) => warehouseApi.updateMaterial(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('materials');
        toast.success('Material muvaffaqiyatli tahrirlandi');
        setMaterialDialogOpen(false);
        setSelectedMaterial(null);
      },
      onError: () => {
        toast.error('Materialni tahrirlashda xatolik yuz berdi');
      },
    }
  );

  const deleteMaterialMutation = useMutation(warehouseApi.deleteMaterial, {
    onSuccess: () => {
      queryClient.invalidateQueries('materials');
      toast.success('Material muvaffaqiyatli o\'chirildi');
    },
    onError: () => {
      toast.error('Materialni o\'chirishda xatolik yuz berdi');
    },
  });

  const addMovementMutation = useMutation(warehouseApi.addMovement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['materials', 'movements']);
      toast.success('Harakat muvaffaqiyatli qo\'shildi');
      setMovementDialogOpen(false);
    },
    onError: () => {
      toast.error('Harakat qo\'shishda xatolik yuz berdi');
    },
  });

  const handleMaterialSubmit = (data: MaterialFormData) => {
    if (selectedMaterial) {
      updateMaterialMutation.mutate({ id: selectedMaterial.id, data });
    } else {
      createMaterialMutation.mutate(data);
    }
  };

  const handleMovementSubmit = (data: MovementFormData) => {
    addMovementMutation.mutate(data);
  };

  const handleEdit = (material: any) => {
    setSelectedMaterial(material);
    setMaterialDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Materialni o\'chirishni tasdiqlaysizmi?')) {
      deleteMaterialMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedMaterial(null);
    setMaterialDialogOpen(true);
  };

  const getMovementTypeColor = (type: string) => {
    return type === 'IN' ? 'success' : 'warning';
  };

  const getMovementTypeLabel = (type: string) => {
    return type === 'IN' ? 'Kirim' : 'Chiqim';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Ombor
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => {
            refetchMaterials();
            refetchMovements();
          }} color="primary">
            <Refresh />
          </IconButton>
          {canEdit && (
            <>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setMovementDialogOpen(true)}
              >
                Harakat qo'shish
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNew}
              >
                Yangi material
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarehouseIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {materialsData?.meta?.total || 0}
              </Typography>
              <Typography color="text.secondary">
                Jami materiallar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {lowStockItems?.length || 0}
              </Typography>
              <Typography color="text.secondary">
                Kam qolgan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {materialsData?.data?.filter((m: any) => m.quantity > m.minStock).length || 0}
              </Typography>
              <Typography color="text.secondary">
                Yetarli miqdorda
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Materiallar" />
          <Tab label="Harakatlar" />
        </Tabs>
      </Card>

      {/* Error handling */}
      {materialsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ma'lumotlarni yuklashda xatolik yuz berdi
        </Alert>
      )}

      {/* Loading */}
      {(materialsLoading || movementsLoading) && <LinearProgress sx={{ mb: 2 }} />}

      {/* Materials Table */}
      {tabValue === 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Miqdor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>O'lchov</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Min. miqdor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Holat</TableCell>
                  {canEdit && <TableCell sx={{ fontWeight: 'bold' }}>Amallar</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {materialsData?.data?.map((material: any) => (
                  <TableRow key={material.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {material.name}
                      </Typography>
                      {material.description && (
                        <Typography variant="caption" color="text.secondary">
                          {material.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {material.quantity || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>{material.unit}</TableCell>
                    <TableCell>{material.minStock}</TableCell>
                    <TableCell>
                      {(material.quantity || 0) <= material.minStock ? (
                        <Chip
                          label="Kam"
                          color="warning"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="Yetarli"
                          color="success"
                          size="small"
                        />
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(material)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        {user?.role === 'admin' && (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(material.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!materialsLoading && (!materialsData?.data || materialsData.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 6 : 5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        Materiallar topilmadi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Movements Table */}
      {tabValue === 1 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Turi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Miqdor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Sana</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tavsif</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movementsData?.data?.map((movement: any) => (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {movement.material?.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMovementTypeLabel(movement.type)}
                        color={getMovementTypeColor(movement.type) as any}
                        size="small"
                        icon={movement.type === 'IN' ? <TrendingUp /> : <TrendingDown />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {movement.quantity} {movement.material?.unit}
                      </Typography>
                      {movement.unitCost && (
                        <Typography variant="caption" color="text.secondary">
                          {movement.unitCost.toLocaleString()} so'm/{movement.material?.unit}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(movement.createdAt), 'dd MMM yyyy, HH:mm', { locale: uz })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {movement.description || 'Tavsif yo\'q'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {!movementsLoading && (!movementsData?.data || movementsData.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        Harakatlar topilmadi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <TablePagination
          component="div"
          count={tabValue === 0 ? (materialsData?.meta?.total || 0) : (movementsData?.meta?.total || 0)}
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
      </Box>

      {/* Material Form Dialog */}
      <MaterialForm
        open={materialDialogOpen}
        onClose={() => {
          setMaterialDialogOpen(false);
          setSelectedMaterial(null);
        }}
        onSubmit={handleMaterialSubmit}
        initialData={selectedMaterial}
        loading={createMaterialMutation.isLoading || updateMaterialMutation.isLoading}
      />

      {/* Movement Form Dialog */}
      <MovementForm
        open={movementDialogOpen}
        onClose={() => setMovementDialogOpen(false)}
        onSubmit={handleMovementSubmit}
        materials={materialsData?.data || []}
        loading={addMovementMutation.isLoading}
      />
    </Box>
  );
};

export default WarehousePage;