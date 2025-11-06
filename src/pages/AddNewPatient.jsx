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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
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
  const [age, setAge] = useState({ years: '', month: '', days: '' });
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    firstName: '',
    surname: '',
    dob: '',
    age: '',
    month: '',
    day: '',
    gender: '',
    email: '',
  });

  const titles = ["Mr", "Mrs", "Miss", "Mst"];

  // 🔹 Calculate Years/month/Days from DOB
  const calculateDetailedAge = (dob) => {
    if (!dob || !dob.isValid()) return { years: '', month: '', days: '' };

    const today = dayjs();
    let years = today.diff(dob, 'year');
    dob = dob.add(years, 'year');
    let month = today.diff(dob, 'month');
    dob = dob.add(month, 'month');
    let days = today.diff(dob, 'day');

    return { years, month, days };
  };

  // 🔹 Calculate DOB from Years/month/Days
  const calculateDobFromDetailedAge = (ageObj) => {
    const { years, month, days } = ageObj;
    if (!years && !month && !days) return null;
    return dayjs().subtract(years || 0, 'year').subtract(month || 0, 'month').subtract(days || 0, 'day');
  };

  const formatDobForApi = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dob.format('DD/MM/YYYY');
  };

  // 🔹 When user selects DOB
  const handleDobChange = (newValue) => {
    setDob(newValue);
    if (newValue && newValue.isValid()) {
      if (newValue.isAfter(dayjs())) {
        setErrors((prev) => ({ ...prev, dob: 'The date of birth cannot exceed the current date' }));
        setAge({ years: '', month: '', days: '' });
      } else {
        const detailedAge = calculateDetailedAge(newValue);
        setAge(detailedAge);
        setErrors((prev) => ({ ...prev, dob: '', age: '' }));
      }
    } else {
      setAge({ years: '', month: '', days: '' });
      setErrors((prev) => ({ ...prev, dob: '' }));
    }
  };

  // 🔹 Validation
  const validateForm = () => {
    const newErrors = {
      title: '',
      firstName: '',
      surname: '',
      dob: '',
      age: '',
      gender: '',
      email: '',
    };
    let isValid = true;

    const isAgeEmpty = !age.years && !age.month && !age.days;

    if (!title) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (isAgeEmpty && !dob) {
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

  // 🔹 Submit Handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const name = firstName.trim();
      const secondname = surname.trim();
      const nameTitle = title.trim();
      const finalAge =
        dob && dob.isValid()
          ? calculateDetailedAge(dob).years
          : age.years || 0;
      const formattedDob = formatDobForApi(dob);

      const response = await axios.post(
        'https://innov-dev.beta.injomo.com/workflow.trigger/gdqraddnewpatient67c00f700b7fd',
        `countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(
          phoneNumber
        )}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(
          secondname
        )}&title=${encodeURIComponent(nameTitle)}&dob=${encodeURIComponent(
          formattedDob
        )}&age=${encodeURIComponent(finalAge)}&gender=${encodeURIComponent(
          gender
        )}&email=${encodeURIComponent(email)}&networkGDID=${encodeURIComponent(networkGDID)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      navigate('/booking', { state: { response: response.data[0] } });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit. Please try again.';
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
        p: 1,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '10px',
        }}
      >
        {/* Title Header */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', fontSize: '1rem', mb: 2 }}>
          Add new patient
        </Typography>

        {/* Title */}
        <TextField
          select
          label="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.title}
          helperText={errors.title}
        >
          <MenuItem value="" disabled>Select title</MenuItem>
          {titles.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>

        {/* First Name */}
        <TextField
          label="First Name *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
          fullWidth
          margin="normal"
          error={!!errors.firstName}
          helperText={errors.firstName}
        />

        {/* Surname */}
        <TextField
          label="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          placeholder="Enter surname"
          fullWidth
          margin="normal"
          error={!!errors.surname}
          helperText={errors.surname}
        />

        {/* DOB */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField
            label="Date of Birth *"
            value={dob}
            onChange={handleDobChange}
            format="DD/MM/YYYY"
            fullWidth
            margin="normal"
            error={!!errors.dob}
            helperText={errors.dob}
          />
        </LocalizationProvider>

        {/* Age Section */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Age *</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['years', 'month', 'days'].map((key) => (
              <TextField
                key={key}
                type="number"
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={age[key] || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  const updated = { ...age, [key]: val };
                  setAge(updated);
                  const newDob = calculateDobFromDetailedAge(updated);
                  setDob(newDob);
                }}
                inputProps={{
                  min: 0,
                  ...(key === 'month' && { max: 11 }),
                  ...(key === 'days' && { max: 31 }),
                }}
                fullWidth
                error={!!errors.age}
              />
            ))}
          </Box>
          {errors.age && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {errors.age}
            </Typography>
          )}
        </Box>

        {/* Gender */}
        <FormControl required error={!!errors.gender} sx={{ mb: 2 }}>
          <FormLabel>Gender</FormLabel>
          <RadioGroup
            row
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel value="Female" control={<Radio />} label="Female" />
            <FormControlLabel value="Others" control={<Radio />} label="Other" />
          </RadioGroup>
          {errors.gender && (
            <Typography variant="caption" color="error">{errors.gender}</Typography>
          )}
        </FormControl>

        {/* Email */}
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@gmail.com"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            width: '100%',
            bgcolor: '#E33610',
            color: 'white',
            minHeight: '48px',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '8px',
            '&:hover': { bgcolor: '#C62800' },
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
        </Button>
      </Box>

      {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
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
