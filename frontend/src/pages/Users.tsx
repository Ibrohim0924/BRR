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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  AdminPanelSettings,
  AccountBalance,
  ShoppingCart,
  Visibility,
  VisibilityOff,
  Refresh,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';

import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const userSchema = yup.object().shape({
  username: yup.string().required('Foydalanuvchi nomi kiritilishi shart'),
  password: yup.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
  fullName: yup.string().required('To\'liq ism kiritilishi shart'),
  role: yup.string().required('Rol tanlanishi shart'),
});

interface UserFormData {
  username: string;
  password?: string;
  fullName: string;
  role: string;
}

const UserForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: any;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, initialData, loading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userSchema),
    defaultValues: initialData || {
      username: '',
      password: '',
      fullName: '',
      role: 'sales',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        password: '', // Don't pre-fill password for editing
      });
    } else {
      reset({
        username: '',
        password: '',
        fullName: '',
        role: 'sales',
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
        {initialData ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qo\'shish'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="To'liq ism *"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
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
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Foydalanuvchi nomi *"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label={initialData ? 'Yangi parol (ixtiyoriy)' : 'Parol *'}
                    error={!!errors.password}
                    helperText={errors.password?.message || (initialData ? 'Parolni o\'zgartirish uchun yangi parol kiriting' : '')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Rol *</InputLabel>
                    <Select {...field} label="Rol *">
                      <MenuItem value="admin">Administrator</MenuItem>
                      <MenuItem value="accountant">Hisobchi</MenuItem>
                      <MenuItem value="sales">Sotuvchi</MenuItem>
                    </Select>
                  </FormControl>
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

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock users data - In real app, this would come from API
  const mockUsers = [
    {
      id: '1',
      username: 'admin',
      fullName: 'Administrator',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      username: 'accountant',
      fullName: 'Hisobchi',
      role: 'accountant',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      username: 'sales',
      fullName: 'Sotuvchi',
      role: 'sales',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);

  // Since we don't have a real users API endpoint, we'll simulate the operations
  const handleSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      if (selectedUser) {
        // Update user
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUser.id 
              ? { ...user, ...data, updatedAt: new Date().toISOString() }
              : user
          )
        );
        toast.success('Foydalanuvchi muvaffaqiyatli tahrirlandi');
      } else {
        // Create user
        const newUser = {
          id: Date.now().toString(),
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        toast.success('Foydalanuvchi muvaffaqiyatli qo\'shildi');
      }
      setDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      toast.success('Foydalanuvchi muvaffaqiyatli o\'chirildi');
    }
  };

  const handleToggleActive = (id: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id 
          ? { ...user, isActive: !user.isActive }
          : user
      )
    );
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'accountant':
        return 'warning';
      case 'sales':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'accountant':
        return 'Hisobchi';
      case 'sales':
        return 'Sotuvchi';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'accountant':
        return <AccountBalance />;
      case 'sales':
        return <ShoppingCart />;
      default:
        return <People />;
    }
  };

  const canEditUser = (user: any) => {
    return currentUser?.role === 'admin' || 
           (currentUser?.role === 'accountant' && user.role === 'sales');
  };

  const canDeleteUser = (user: any) => {
    return currentUser?.role === 'admin' && user.id !== currentUser?.id;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Foydalanuvchilar
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color="primary">
            <Refresh />
          </IconButton>
          {currentUser?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddNew}
            >
              Yangi foydalanuvchi
            </Button>
          )}
        </Box>
      </Box>

      {/* Access Control Warning */}
      {currentUser?.role !== 'admin' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Sizda faqat o'qish huquqi bor. Foydalanuvchilarni qo'shish va o'chirish uchun administrator huquqi kerak.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {users.length}
              </Typography>
              <Typography color="text.secondary">
                Jami foydalanuvchilar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'admin').length}
              </Typography>
              <Typography color="text.secondary">
                Administratorlar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'accountant').length}
              </Typography>
              <Typography color="text.secondary">
                Hisobchilar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShoppingCart sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'sales').length}
              </Typography>
              <Typography color="text.secondary">
                Sotuvchilar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Foydalanuvchi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Foydalanuvchi nomi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Holat</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Yaratilgan sana</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user: any) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRoleIcon(user.role)}
                      <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                        {user.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleToggleActive(user.id)}
                          disabled={!canEditUser(user)}
                        />
                      }
                      label={user.isActive ? 'Faol' : 'Nofaol'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: uz })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {canEditUser(user) && (
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(user)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {canDeleteUser(user) && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Foydalanuvchilar topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={users.length}
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

      {/* User Form Dialog */}
      <UserForm
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedUser}
        loading={loading}
      />
    </Box>
  );
};

export default UsersPage;