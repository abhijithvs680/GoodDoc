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
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAgeManuallySet, setIsAgeManuallySet] = useState(false); // Track if age was manually set
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

  const calculateDobFromAge = (age) => {
    if (!age) return null;
    const currentYear = dayjs().year();
    const birthYear = currentYear - parseInt(age, 10);
    return dayjs(`${birthYear}-01-01`, 'YYYY-MM-DD'); // Set DOB to January 1st of the calculated birth year
  };

  const formatDobForApi = (dob) => {
    if (!dob || !dob.isValid()) return '';
    return dob.format('DD/MM/YYYY');
  };

  const handleDobChange = (newValue) => {
    setDob(newValue);
    setIsAgeManuallySet(false); // DOB was manually set, so age is derived
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
    const newAge = e.target.value.replace(/\D/g, '');
    setAge(newAge);
    setIsAgeManuallySet(true); // Age was manually set

    if (newAge) {
      const calculatedDob = calculateDobFromAge(newAge);
      setDob(calculatedDob);
      setErrors((prev) => ({ ...prev, age: '', dob: '' }));
    } else {
      setDob(null);
      setErrors((prev) => ({ ...prev, age: 'Age or date of birth is required' }));
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
        {/* Title */}
        <Box sx={{ mb: 2, textAlign: 'left' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              fontSize: '1rem',
            }}
          >
            Add new patient
          </Typography>
        </Box>

        {/* Title Field */}
        <TextField
          select
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography sx={{ color: '#333', fontSize: '1rem', fontWeight: 'bold', borderRadius: '20px' }}>
                Title
              </Typography>
              <Typography sx={{ color: 'red', ml: 0.5 }}>*</Typography>
            </Box>
          }
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.title}
          helperText={errors.title}
          displayEmpty
          InputLabelProps={{
            shrink: true,
            disableAnimation: true,
          }}
          InputProps={{
            endAdornment: !title && (
              <Typography
                sx={{
                  color: '#666',
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  opacity: 0.7,
                }}
              >
                Select title
              </Typography>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderColor: errors.title ? 'red' : '#666',
              '&:hover': { borderColor: errors.title ? 'red' : '#333' },
              '&.Mui-focused': { borderColor: errors.title ? 'red' : '#333' },
            },
            '& .MuiInputLabel-outlined': {
              color: '#333',
              fontSize: '1rem',
              transform: 'translate(14px, -6px) scale(0.75)',
              backgroundColor: 'white',
              padding: '0 4px',
            },
            '& .MuiInputLabel-outlined.Mui-focused': {
              color: errors.title ? 'red' : '#333',
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiFormLabel-asterisk': {
              display: 'none',
            },
          }}
        >
          <MenuItem value="" disabled>
            Select title
          </MenuItem>
          {titles.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {/* First Name Field */}
        <TextField
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography sx={{ color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                First Name
              </Typography>
              <Typography sx={{ color: 'red', ml: 0.5 }}>*</Typography>
            </Box>
          }
          value={firstName}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(inputValue)) {
              setFirstName(inputValue);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
            } else {
              setErrors((prev) => ({ ...prev, firstName: 'Please enter only alphabetical characters.' }));
            }
          }}
          placeholder="Enter first name"
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.firstName}
          helperText={errors.firstName}
          InputLabelProps={{
            shrink: true,
            disableAnimation: true,
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderColor: errors.firstName ? 'red' : '#666',
              '&:hover': { borderColor: errors.firstName ? 'red' : '#333' },
              '&.Mui-focused': { borderColor: errors.firstName ? 'red' : '#333' },
            },
            '& .MuiInputLabel-outlined': {
              color: '#333',
              fontSize: '1rem',
              transform: 'translate(14px, -6px) scale(0.75)',
              backgroundColor: 'white',
              padding: '0 4px',
            },
            '& .MuiInputLabel-outlined.Mui-focused': {
              color: errors.firstName ? 'red' : '#333',
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiFormLabel-asterisk': {
              display: 'none',
            },
          }}
        />

        {/* Surname Field */}
        <TextField
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography sx={{ color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                Surname
              </Typography>
            </Box>
          }
          value={surname}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(inputValue)) {
              setSurname(inputValue);
              if (errors.surname) setErrors((prev) => ({ ...prev, surname: '' }));
            } else {
              setErrors((prev) => ({ ...prev, surname: 'Please enter only alphabetical characters.' }));
            }
          }}
          placeholder="Enter surname"
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!errors.surname}
          helperText={errors.surname}
          InputLabelProps={{
            shrink: true,
            disableAnimation: true,
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderColor: errors.surname ? 'red' : '#666',
              '&:hover': { borderColor: errors.surname ? 'red' : '#333' },
              '&.Mui-focused': { borderColor: errors.surname ? 'red' : '#333' },
            },
            '& .MuiInputLabel-outlined': {
              color: '#333',
              fontSize: '1rem',
              transform: 'translate(14px, -6px) scale(0.75)',
              backgroundColor: 'white',
              padding: '0 4px',
            },
            '& .MuiInputLabel-outlined.Mui-focused': {
              color: errors.surname ? 'red' : '#333',
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiFormLabel-asterisk': {
              display: 'none',
            },
          }}
        />
        {/* Date of Birth Field */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateField
            label={
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography sx={{ color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                  Date of Birth
                </Typography>
                <Typography sx={{ color: 'red', ml: 0.5 }}>*</Typography>
              </Box>
            }
            value={dob}
            onChange={handleDobChange}
            format="DD/MM/YYYY"
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!errors.dob}
            helperText={errors.dob}
            InputLabelProps={{
              shrink: true,
              disableAnimation: true,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderColor: errors.dob ? 'red' : '#666',
                '&:hover': { borderColor: errors.dob ? 'red' : '#333' },
                '&.Mui-focused': { borderColor: errors.dob ? 'red' : '#333' },
              },
              '& .MuiInputLabel-outlined': {
                color: '#333',
                fontSize: '1rem',
                transform: 'translate(14px, -6px) scale(0.75)',
                backgroundColor: 'white',
                padding: '0 4px',
              },
              '& .MuiInputLabel-outlined.Mui-focused': {
                color: errors.dob ? 'red' : '#333',
                transform: 'translate(14px, -6px) scale(0.75)',
              },
              '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
                transform: 'translate(14px, -6px) scale(0.75)',
              },
              '& .MuiFormLabel-asterisk': {
                display: 'none',
              },
            }}
          />
        </LocalizationProvider>

        {/* Age Field */}
        <TextField
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography sx={{ color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                Age
              </Typography>
              <Typography sx={{ color: 'red', ml: 0.5 }}>*</Typography>
            </Box>
          }
          value={age}
          onChange={handleAgeChange}
          placeholder="YY"
          fullWidth
          margin="normal"
          variant="outlined"
          required={!dob}
          type="tel"
          inputProps={{ 
            inputMode: 'numeric', 
            pattern: '[0-9]*', 
            readOnly: dob && dob.isValid() && !errors.dob && !isAgeManuallySet // Make read-only only if DOB was manually set
          }}
          error={!!errors.age}
          helperText={errors.age}
          InputLabelProps={{
            shrink: true,
            disableAnimation: true,
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderColor: errors.age ? 'red' : '#666',
              '&:hover': { borderColor: errors.age ? 'red' : '#333' },
              '&.Mui-focused': { borderColor: errors.age ? 'red' : '#333' },
            },
            '& .MuiInputLabel-outlined': {
              color: '#333',
              fontSize: '1rem',
              transform: 'translate(14px, -6px) scale(0.75)',
              backgroundColor: 'white',
              padding: '0 4px',
            },
            '& .MuiInputLabel-outlined.Mui-focused': {
              color: errors.age ? 'red' : '#333',
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiFormLabel-asterisk': {
              display: 'none',
            },
          }}
        />

        {/* Gender Field (Radio Buttons) */}
        <FormControl
          component="fieldset"
          required
          error={!!errors.gender}
          sx={{
            mb: 2,
            width: '100%',
            '& .MuiFormLabel-asterisk': {
              display: 'none',
            },
          }}
        >
          <FormLabel
            component="legend"
            sx={{
              color: errors.gender ? 'red' : '#333',
              fontSize: '1rem',
              fontWeight: 'normal',
              backgroundColor: 'white',
              padding: '0 4px',
              transform: 'translate(0, -6px) scale(0.75)',
              transformOrigin: 'top left',
              '&.Mui-focused': {
                color: errors.gender ? 'red' : '#333',
              },
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography sx={{ color: 'inherit', fontSize: '1rem', mt: 1, fontWeight: 'bold' }}>
                Gender
              </Typography>
              <Typography sx={{ color: 'red', ml: 0.5, mt: 1 }}>*</Typography>
            </Box>
          </FormLabel>
          <RadioGroup
            row
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }));
            }}
            sx={{ pl: 2 }}
          >
            <FormControlLabel
              value="Male"
              control={<Radio sx={{ color: errors.gender ? 'red' : '#666', '&.Mui-checked': { color: '#E33610' } }} />}
              label="Male"
            />
            <FormControlLabel
              value="Female"
              control={<Radio sx={{ color: errors.gender ? 'red' : '#666', '&.Mui-checked': { color: '#E33610' } }} />}
              label="Female"
            />
            <FormControlLabel
              value="Others"
              control={<Radio sx={{ color: errors.gender ? 'red' : '#666', '&.Mui-checked': { color: '#E33610' } }} />}
              label="Other"
            />
          </RadioGroup>
          {errors.gender && (
            <Typography variant="caption" color="error" sx={{ pl: 2 }}>
              {errors.gender}
            </Typography>
          )}
        </FormControl>

        {/* Email Field */}
        <TextField
          label={
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography sx={{ color: '#333', fontSize: '1rem', fontWeight: 'bold' }}>
                Email
              </Typography>
            </Box>
          }
          value={email}
          onChange={(e) => {
            const inputValue = e.target.value;
            setEmail(inputValue);
            if (inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
              setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
            } else {
              setErrors((prev) => ({ ...prev, email: '' }));
            }
          }}
          placeholder="example@gmail.com"
          fullWidth
          margin="normal"
          variant="outlined"
          type="email"
          error={!!errors.email}
          helperText={errors.email}
          InputLabelProps={{
            shrink: true,
            disableAnimation: true,
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderColor: errors.email ? 'red' : '#666',
              '&:hover': { borderColor: errors.email ? 'red' : '#333' },
              '&.Mui-focused': { borderColor: errors.email ? 'red' : '#333' },
            },
            '& .MuiInputLabel-outlined': {
              color: '#333',
              fontSize: '1rem',
              transform: 'translate(14px, -6px) scale(0.75)',
              backgroundColor: 'white',
              padding: '0 4px',
            },
            '& .MuiInputLabel-outlined.Mui-focused': {
              color: errors.email ? 'red' : '#333',
              transform: 'translate(14px, -6px) scale(0.75)',
            },
            '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
              transform: 'translate(14px, -6px) scale(0.75)',
            },
          }}
        />

        {/* Continue Button */}
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
            '&:hover': {
              bgcolor: '#C62800',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Continue'}
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