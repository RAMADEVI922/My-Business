import React from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart,
  Person,
  CheckCircle,
  AdminPanelSettings,
} from '@mui/icons-material';

function LandingPage({ onSelectCustomerType, onNavigateToAdmin }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Grid container spacing={4} justifyContent="center">
          {/* Shop Owners Card */}
          <Grid item xs={12} md={6}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(194, 120, 53, 0.3)',
                  },
                }}
                onClick={() => onSelectCustomerType('shop-owner')}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #c27835, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(194, 120, 53, 0.3)',
                      }}
                    >
                      <ShoppingCart sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </Box>

                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    align="center"
                    sx={{ fontWeight: 700, color: 'text.primary' }}
                  >
                    Shop Owners
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    Register your shop with proper documentation and get access to bulk ordering
                  </Typography>

                  <List sx={{ mb: 3 }}>
                    {[
                      'Shop photo required',
                      'Shop number/registration',
                      'Shop license document',
                    ].map((text, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCustomerType('shop-owner');
                    }}
                    sx={{ mt: 'auto' }}
                  >
                    Register as Shop Owner
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Regular Customers Card */}
          <Grid item xs={12} md={6}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(194, 120, 53, 0.3)',
                  },
                }}
                onClick={() => onSelectCustomerType('regular')}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #c27835, #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(194, 120, 53, 0.3)',
                      }}
                    >
                      <Person sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                  </Box>

                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    align="center"
                    sx={{ fontWeight: 700, color: 'text.primary' }}
                  >
                    Regular Customers
                  </Typography>

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    sx={{ mb: 3, lineHeight: 1.6 }}
                  >
                    Register with your credentials and documents to start shopping
                  </Typography>

                  <List sx={{ mb: 3 }}>
                    {[
                      'Phone or email registration',
                      'ID proof & photo required',
                      'Quick admin approval',
                    ].map((text, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCustomerType('regular');
                    }}
                    sx={{ mt: 'auto' }}
                  >
                    Register as Customer
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Admin Access Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<AdminPanelSettings />}
              onClick={onNavigateToAdmin}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                '&:hover': {
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(194, 120, 53, 0.1)',
                },
              }}
            >
              Admin Access
            </Button>
          </Box>
        </motion.div>
      </motion.div>
    </Container>
  );
}

export default LandingPage;
