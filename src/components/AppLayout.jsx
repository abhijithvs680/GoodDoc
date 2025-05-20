import React from 'react';
import { AppBar, Toolbar, Box, Container, Typography, Link, } from '@mui/material';

import Logo from '../assets/media/logo-dark.svg';

const AppLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      {/* <AppBar position="fixed" sx={{ bgcolor: '#f4f8fc', elevation: 0 }}> */}
      <Toolbar sx={{ justifyContent: 'flex-start' }}>
        <Box
          component="img"
          src={Logo}
          alt="Good Doc Logo"
          sx={{ height: 30, width: 'auto', marginLeft: 1, marginTop: 3 }}
        />
      </Toolbar>
      {/* </AppBar> */}

      <Container component="main" sx={{ flexGrow: 1, py: 2, mt: 0 }}>
        {children}
      </Container>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            color: '#B0BEC5',
            opacity: 0.5,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          #GOODDOCNETWORK
        </Typography>
        <Link
          href="https://gooddoc.app/download"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textDecoration: 'underline', color: '#000000' }}
        >
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            gooddoc.app/download
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default AppLayout;