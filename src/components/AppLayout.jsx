import React from 'react';
import { AppBar, Toolbar, Box, Container } from '@mui/material';
import Logo from '../assets/media/logo-dark.svg';

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <AppBar position="fixed" sx={{ bgcolor: '#f4f8fc', elevation: 0 }}>
        <Toolbar sx={{ justifyContent: 'flex-start' }}>
          <Box
            component="img"
            src={Logo}
            alt="Good Doc Logo"
            sx={{ height: 30, width: 'auto' }}
          />
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4, mt: 8 }}> 
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;