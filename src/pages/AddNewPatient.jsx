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
import { LocalizationProvider, DateField } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';
import dayjs from 'dayjs';

const AddNewPatient = () => {
  const location = useLocation();
  const { phoneNumber, countryCode, networkGDID } = location.state || {};
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [dob, setDob] = useState(null); // Date of birth using Dayjs
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', dob: '', age: '', gender: '', email: '' });

  const calculateAge = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dayjs().diff(dob, 'year');
  };

  const formatDobForApi = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dob.format('DD/MM/YYYY'); // Format to 29/01/2002
  };

  const handleDobChange = (newValue) => {
    setDob(newValue);
    if (newValue && newValue.isValid()) {
      if (newValue.isAfter(dayjs())) {
        setErrors((prev) => ({ ...prev, dob: 'The date of birth cannot exceed the current date' }));
        setAge('');
      } else {
        setAge(calculateAge(newValue));
        setErrors((prev) => ({ ...prev, dob: '', age: '' }));
      }
    } else {
      setAge(''); // Clear age if DOB is invalid
      setErrors((prev) => ({ ...prev, dob: '' })); // No validation message unless after today
    }
  };

  const handleAgeChange = (e) => {
    if (!dob) { // Only allow age change if no DOB is set
      const newAge = e.target.value.replace(/\D/g, '');
      setAge(newAge);
      setErrors((prev) => ({ ...prev, age: newAge ? '' : 'Age is required if date of birth is not provided' }));
    }
  };

  const validateForm = () => {
    const newErrors = { name: '', dob: '', age: '', gender: '', email: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    if (!age && !dob) {
      newErrors.age = 'Age or date of birth is required';
      isValid = false;
    }
    if (dob && dob.isAfter(dayjs())) {
      newErrors.dob = 'The date of birth cannot exceed the current date';
      isValid = false;
    }
    if (!gender) {
      newErrors.gender = 'Gender is required';
      isValid = false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const finalAge = dob && dob.isValid() ? calculateAge(dob) : age; // Use calculated age from DOB if provided, otherwise use entered age
      const formattedDob = formatDobForApi(dob); // Format DOB to DD/MM/YYYY
      const response = await axios.post(
        '/workflow.trigger/gdqraddnewpatient67c00f700b7fd',
        `countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(name)}&dob=${encodeURIComponent(formattedDob)}&age=${encodeURIComponent(finalAge)}&gender=${encodeURIComponent(gender)}&email=${encodeURIComponent(email)}&networkGDID=${encodeURIComponent(networkGDID)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      navigate('/booking', { state: { response: response.data[0] } });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit. Please try again.';
      alert(errorMessage);
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
      <Box sx={{ mb: -2, textAlign: 'center', p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 500,
            color: '#333',
            fontSize: '1.25rem',
          }}
        >
          Create your health profile
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(inputValue)) {
              setName(inputValue);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            } else {
              setErrors((prev) => ({ ...prev, name: "Please enter only alphabetical characters." }));
            }
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 0 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField
            label="Date of Birth"
            value={dob}
            onChange={handleDobChange}
            format="DD/MM/YYYY" // Display and input as 29/01/2002
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!errors.dob}
            helperText={errors.dob}
            sx={{ mb: 0 }} // Reduced from mb: 2 to mb: 1
          />
        </LocalizationProvider>
        <TextField
          label="Age"
          value={age}
          onChange={handleAgeChange}
          fullWidth
          margin="normal"
          variant="outlined"
          required={!dob}
          type="tel"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', readOnly: dob && dob.isValid() }}
          error={!!errors.age}
          helperText={errors.age}
          sx={{ mb: 0 }} // Reduced from mb: 2 to mb: 1
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
          error={!!errors.gender}
          helperText={errors.gender}
          sx={{ mb: 0 }} // Reduced from mb: 2 to mb: 1
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Others">Others</MenuItem>
        </TextField>
        <TextField
          label="Email (Optional)"
          value={email}
          onChange={(e) => {
            const inputValue = e.target.value;
            setEmail(inputValue);

            // Validate email format if not empty
            if (inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
              setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
            } else {
              setErrors((prev) => ({ ...prev, email: "" })); // Clear error when valid
            }
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          type="email"
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mb: 0 }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 2,
            width: '100%',
            bgcolor: '#E33610',
            minHeight: '56px', // Aligns with TextField height
            '&:hover': { bgcolor: '#D32F0E' },
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Submit'}
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