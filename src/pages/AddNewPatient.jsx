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
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
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
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // DOB & Age logic
  const [knowExactDob, setKnowExactDob] = useState('yes');
  const [ageType, setAgeType] = useState('year');
  const [ageValue, setAgeValue] = useState('');

  const [errors, setErrors] = useState({
    title: '',
    firstName: '',
    surname: '',
    dob: '',
    age: '',
    gender: '',
    email: '',
  });

  const titles = ['Mr', 'Mrs', 'Miss', 'Mst'];

  const calculateDetailedAge = (dob) => {
    if (!dob || !dob.isValid()) return { years: '', months: '', days: '' };
    const today = dayjs();
    let years = today.diff(dob, 'year');
    dob = dob.add(years, 'year');
    let months = today.diff(dob, 'month');
    dob = dob.add(months, 'month');
    let days = today.diff(dob, 'day');
    return { years, months, days };
  };

  const calculateDobFromAgeType = (value, type) => {
    if (!value) return null;
    return dayjs().subtract(Number(value), type);
  };

  const formatDobForApi = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dob.format('DD/MM/YYYY');
  };

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

    if (!title) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (knowExactDob === 'yes' && !dob) {
      newErrors.dob = 'Date of birth is required';
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
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const name = firstName.trim();
      const secondname = surname.trim();
      const nameTitle = title.trim();

      let finalDob = dob || calculateDobFromAgeType(ageValue, ageType);
      const formattedDob = formatDobForApi(finalDob);
      const detailedAge = calculateDetailedAge(finalDob);

      const response = await axios.post(
        'https://innov-dev.beta.injomo.com/workflow.trigger/gdqraddnewpatient67c00f700b7fd',
        `countryCode=${encodeURIComponent(countryCode)}&phoneNumber=${encodeURIComponent(
          phoneNumber
        )}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(
          secondname
        )}&title=${encodeURIComponent(nameTitle)}&dob=${encodeURIComponent(
          formattedDob
        )}&age=${encodeURIComponent(
          detailedAge.years || 0
        )}&gender=${encodeURIComponent(gender)}&email=${encodeURIComponent(
          email
        )}&networkGDID=${encodeURIComponent(networkGDID)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#333', fontSize: '1rem', mb: 2 }}
        >
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
          <MenuItem value="" disabled>
            Select title
          </MenuItem>
          {titles.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
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

        {/* Do you know DOB */}
        <FormControl component="fieldset" sx={{ mb: 2, mt: 2 }}>
          <FormLabel component="legend" sx={{ fontWeight: 400 }}>
            Do you know the patient's exact Date of Birth?
          </FormLabel>
          <RadioGroup
            row
            value={knowExactDob}
            onChange={(e) => {
              const val = e.target.value;
              setKnowExactDob(val);
              if (val === 'no' && ageValue) {
                setDob(dayjs().subtract(Number(ageValue), ageType));
              }
            }}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>


       {/* ✅ Date of Birth + Age Section — Final Version with ReadOnly Logic */}
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: 'flex-start',
    gap: 2,
    mb: 2,
    width: '100%',
  }}
>
  {/* 📅 Date of Birth */}
  <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '35%' } }}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Date of Birth *"
        value={dob}
        onChange={(newValue) => {
          if (knowExactDob === 'yes') {
            setDob(newValue);
            if (newValue && newValue.isValid()) {
              const today = dayjs();
              const diffYears = today.diff(newValue, 'year');
              const diffMonths = today.diff(newValue, 'month');
              const diffDays = today.diff(newValue, 'day');
              if (diffYears >= 1) {
                setAgeValue(diffYears.toString());
                setAgeType('year');
              } else if (diffMonths >= 1) {
                setAgeValue(diffMonths.toString());
                setAgeType('month');
              } else {
                setAgeValue(diffDays.toString());
                setAgeType('days');
              }
            } else {
              setAgeValue('');
            }
          }
        }}
        format="DD/MM/YYYY"
        readOnly={knowExactDob === 'no'} // 🔒 Make read-only when “No”
        slotProps={{
          textField: {
            fullWidth: true,
            error: !!errors.dob,
            helperText: errors.dob,
          },
        }}
      />
    </LocalizationProvider>
  </Box>

  {/* 👤 Age + Age Type (only visible when "No") */}
  {knowExactDob === 'no' && (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: '60%' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Age Input */}
      <TextField
        type="number"
        label="Age"
        value={ageValue}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '');
          setAgeValue(val);
          if (val) setDob(dayjs().subtract(Number(val), ageType));
          else setDob(null);
        }}
        fullWidth
        error={!!errors.age}
        helperText={errors.age}
      />

      {/* 🧮 Age in (Year/Month/Days) */}
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.9rem', color: '#333' }}>Age in:</Typography>
        <RadioGroup
          row
          value={ageType}
          onChange={(e) => {
            const newType = e.target.value;
            setAgeType(newType);
            if (ageValue) setDob(dayjs().subtract(Number(ageValue), newType));
          }}
        >
          <FormControlLabel value="year" control={<Radio size="small" />} label="Year" />
          <FormControlLabel value="month" control={<Radio size="small" />} label="Month" />
          <FormControlLabel value="days" control={<Radio size="small" />} label="Days" />
        </RadioGroup>
      </Box>
    </Box>
  )}
</Box>


        {/* Gender */}
        <FormControl required error={!!errors.gender} sx={{ mb: 2, mt: 2 }}>
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
            <Typography variant="caption" color="error">
              {errors.gender}
            </Typography>
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

        {/* Submit */}
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
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Continue'
          )}
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
            bgcolor: 'rgba(0,0,0,0.5)',
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
