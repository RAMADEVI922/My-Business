import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Box,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Home,
  ListAlt,
  ContactMail,
  Close,
} from '@mui/icons-material';
import { UserButton, useUser } from '@clerk/react';

export default function Navbar({ currentUser, cartCount, onNavigate }) {
  const { isSignedIn, user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, action: () => onNavigate(isAdmin ? 'dashboard' : 'customer-products') },
    ...(isAdmin ? [] : [
      { text: 'My Orders', icon: <ListAlt />, action: () => onNavigate('my-orders') },
    ]),
    { text: 'Contact Us', icon: <ContactMail />, action: () => onNavigate('contact') },
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          MyBusiness
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.primary' }}>
          <Close />
        </IconButton>
      </Box>
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                item.action();
                setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(194, 120, 53, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {!isAdmin && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                onNavigate('cart');
                setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(194, 120, 53, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCart sx={{ color: 'primary.main' }} />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      {isSignedIn && user && (
        <Box sx={{ px: 2, mt: 'auto', pb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            p: 1.5,
            backgroundColor: 'rgba(194, 120, 53, 0.1)',
            borderRadius: 2,
          }}>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonPopoverActionButton__signOut: {
                    '&:hover': {
                      backgroundColor: '#fee2e2'
                    }
                  }
                }
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                Welcome,
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {user.firstName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  if (!isSignedIn) {
    return (
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate('landing')}>
              <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                MyBusiness
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                onClick={() => onNavigate('contact')}
                sx={{ color: 'text.primary' }}
              >
                Contact Us
              </Button>
              <Button 
                variant="contained" 
                onClick={() => onNavigate('customer-login')}
              >
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: 'primary.main' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                flexGrow: isMobile ? 1 : 0 
              }} 
              onClick={() => onNavigate(isAdmin ? 'dashboard' : 'customer-products')}
            >
              <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                MyBusiness
              </Typography>
            </Box>

            {!isMobile && (
              <>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {menuItems.map((item) => (
                    <Button
                      key={item.text}
                      color="inherit"
                      onClick={item.action}
                      startIcon={item.icon}
                      sx={{ 
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'rgba(194, 120, 53, 0.1)',
                        }
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                  
                  {!isAdmin && (
                    <Button
                      color="inherit"
                      onClick={() => onNavigate('cart')}
                      startIcon={
                        <Badge badgeContent={cartCount} color="primary">
                          <ShoppingCart />
                        </Badge>
                      }
                      sx={{ 
                        color: 'text.primary',
                        '&:hover': {
                          backgroundColor: 'rgba(194, 120, 53, 0.1)',
                        }
                      }}
                    >
                      Cart
                    </Button>
                  )}
                </Box>

                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        Welcome,
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {user.firstName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                      </Typography>
                    </Box>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          userButtonPopoverActionButton__signOut: {
                            '&:hover': {
                              backgroundColor: '#fee2e2'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
