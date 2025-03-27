import React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getMenuItems = () => {
    const commonItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Profile', icon: <PeopleIcon />, path: '/profile' },
    ];

    const roleSpecificItems = {
      admin: [
        { text: 'Users', icon: <PeopleIcon />, path: '/users' },
        { text: 'Departments', icon: <BookIcon />, path: '/departments' },
        { text: 'Courses', icon: <BookIcon />, path: '/courses' },
        { text: 'Attendance', icon: <AssignmentIcon />, path: '/attendance' },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
      ],
      teacher: [
        { text: 'My Courses', icon: <BookIcon />, path: '/courses' },
        { text: 'Attendance', icon: <AssignmentIcon />, path: '/attendance' },
        { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
      ],
      student: [
        { text: 'My Courses', icon: <BookIcon />, path: '/courses' },
        { text: 'Attendance', icon: <AssignmentIcon />, path: '/attendance' },
        { text: 'Grades', icon: <AssessmentIcon />, path: '/grades' },
      ],
    };

    return [
      ...commonItems,
      ...(roleSpecificItems[user?.role] || []),
      { text: 'Logout', icon: <LogoutIcon />, path: '/logout', onClick: handleLogout },
    ];
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          College Attendance
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else {
                navigate(item.path);
              }
            }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {getMenuItems().find(item => item.path === location.pathname)?.text || 'College Attendance'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Navigation; 