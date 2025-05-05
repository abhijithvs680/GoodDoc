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

  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ 
    title: '', 
    firstName: '', 
    surname: '', 
    dob: '', 
    age: '', 
    gender: '', 
    email: '' 
  });
  
  const titles = ["Mr", "Mrs", "Miss", "Mst"];

  const calculateAge = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dayjs().diff(dob, 'year');
  };

  const formatDobForApi = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dob.format('DD/MM/YYYY');
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
      setAge('');
      setErrors((prev) => ({ ...prev, dob: '' }));
    }
  };

  const handleAgeChange = (e) => {
    if (!dob) {
      const newAge = e.target.value.replace(/\D/g, '');
      setAge(newAge);
      setErrors((prev) => ({ ...prev, age: newAge ? '' : 'Age is required if date of birth is not provided' }));
    }
  };

  const validateForm = () => {
    const newErrors = { 
      title: '', 
      firstName: '', 
      surname: '', 
      dob: '', 
      age: '', 
      gender: '', 
      email: '' 
    };
    let isValid = true;

    if (!title) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!surname.trim()) {
      newErrors.surname = 'Surname is required';
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
      const name = firstName.trim();
      const secondname = surname.trim();
      const nameTitle = title.trim();
      const finalAge = dob && dob.isValid() ? calculateAge(dob) : age;
      const formattedDob = formatDobForApi(dob);
      
      const response = await axios.post(
        '/workflow.trigger/gdqraddnewpatient67c00f700b7fd',
        `countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(secondname)}&title=${encodeURIComponent(nameTitle)}&dob=${encodeURIComponent(formattedDob)}&age=${encodeURIComponent(finalAge)}&gender=${encodeURIComponent(gender)}&email=${encodeURIComponent(email)}&networkGDID=${encodeURIComponent(networkGDID)}`,
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
          select
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.title}
          helperText={errors.title}
          sx={{ mb: 0 }}
        >
          {titles.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
        
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(inputValue)) {
              setFirstName(inputValue);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
            } else {
              setErrors((prev) => ({ ...prev, firstName: "Please enter only alphabetical characters." }));
            }
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.firstName}
          helperText={errors.firstName}
          sx={{ mb: 0 }}
        />
        
        <TextField
          label="Surname"
          value={surname}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(inputValue)) {
              setSurname(inputValue);
              if (errors.surname) setErrors((prev) => ({ ...prev, surname: "" }));
            } else {
              setErrors((prev) => ({ ...prev, surname: "Please enter only alphabetical characters." }));
            }
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.surname}
          helperText={errors.surname}
          sx={{ mb: 0 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField
            label="Date of Birth"
            value={dob}
            onChange={handleDobChange}
            format="DD/MM/YYYY"
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!errors.dob}
            helperText={errors.dob}
            sx={{ mb: 0 }}
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
          sx={{ mb: 0 }}
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
          sx={{ mb: 0 }}
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
            if (inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
              setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
            } else {
              setErrors((prev) => ({ ...prev, email: "" }));
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
            minHeight: '56px',
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