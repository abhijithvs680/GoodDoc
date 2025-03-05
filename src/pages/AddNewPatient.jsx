import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';

const AddNewPatient = () => {
  const location = useLocation();
  const { phoneNumber, countryCode, networkGDID } = location.state || {};
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !age || !gender) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        '/workflow.trigger/gdqraddnewpatient67c00f700b7fd',
        `countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}&gender=${encodeURIComponent(gender)}&email=${encodeURIComponent(email)}&networkGDID=${encodeURIComponent(networkGDID)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      navigate('/booking', { state: { response: response.data[0] } });
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        bgcolor: '#F5F7FA',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
      }}
    >
      <Box sx={{ mb: 0, textAlign: 'center', p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 500,
            color: '#333',
            fontSize: '1.25rem',
          }}
        >
          Register
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          sx={{ mb: 2 }}
        />

        <TextField
          label="Age"
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          type="tel"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          sx={{ mb: 2 }}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Others">Other</MenuItem>
        </TextField>

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          type="email"
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="outlined"
          disabled={isLoading}
          sx={{
            mt: 2,
            width: '100%',
            borderColor: '#666',
            color: '#333',
            '&:hover': { 
              borderColor: '#333',
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            },
          }}
        >
          Submit
        </Button>
      </Box>
      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress size={60} sx={{ color: '#007bff' }} />
        </Box>
      )}
    </Container>
  );
};

export default AddNewPatient;