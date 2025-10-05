import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  People,
  ShoppingCart,
  Warehouse,
  Receipt,
  Assessment,
  Settings,
  ExitToApp,
  AccountCircle,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Bosh sahifa', path: '/dashboard', icon: Dashboard },
  { text: 'Mahsulotlar', path: '/products', icon: Inventory },
  { text: 'Mijozlar', path: '/customers', icon: People },
  { text: 'Sotuv', path: '/sales', icon: ShoppingCart },
  { text: 'Ombor', path: '/warehouse', icon: Warehouse },
  { text: 'Xarajatlar', path: '/expenses', icon: Receipt },
  { text: 'Hisobotlar', path: '/reports', icon: Assessment },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/login');
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

  const getRoleText = (role: string) => {
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

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: [1],
          py: 2,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          Non va Suv Tizimi
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          // Role-based access control
          if (item.path === '/users' && user?.role !== 'admin' && user?.role !== 'accountant') {
            return null;
          }

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.primary',
                    minWidth: 40,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      {(user?.role === 'admin' || user?.role === 'accountant') && (
        <List sx={{ px: 2, py: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/users')}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                backgroundColor: location.pathname === '/users' ? 'primary.main' : 'transparent',
                color: location.pathname === '/users' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: location.pathname === '/users' ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === '/users' ? 'white' : 'text.primary',
                  minWidth: 40,
                }}
              >
                <Settings />
              </ListItemIcon>
              <ListItemText 
                primary="Foydalanuvchilar"
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === '/users' ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={getRoleText(user?.role || '')}
              color={getRoleColor(user?.role || '')}
              size="small"
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                fontWeight: 500 
              }}
            />
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="subtitle2">{user?.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">
              @{user?.username}
            </Typography>
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Chiqish
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;