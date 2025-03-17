import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Typography,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { parsePhoneNumberFromString, getCountryCallingCode, getCountries } from 'libphonenumber-js';
import ReactCountryFlag from 'react-country-flag';

const Form1 = () => {
  const [countryCode, setCountryCode] = useState('ZW');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const networkGDID = searchParams.get('gdid');
  const logrowId = searchParams.get('rowid');

  useEffect(() => {
    const countryList = getCountries().map((code) => {
      const callingCode = getCountryCallingCode(code);
      return {
        code,
        name: new Intl.DisplayNames(['en'], { type: 'region' }).of(code),
        callingCode: `+${callingCode}`,
      };
    });
    setCountries(countryList);
    setFilteredCountries(countryList);
  }, []);

  const handleCountryChange = (event) => {
    setCountryCode(event.target.value);
    setPhoneNumber('');
    setIsValidPhone(true);
    // Reset search when an item is selected
    setSearchQuery('');
    setFilteredCountries(countries);
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
    const phoneNumberWithCountryCode = `+${getCountryCallingCode(countryCode)}${value}`;
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumberWithCountryCode);
    setIsValidPhone(phoneNumberObj?.isValid() || false);
  };

  const handleSearchChange = (event) => {
    event.stopPropagation();
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = countries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.callingCode.toLowerCase().includes(query)
    );
    setFilteredCountries(filtered);
  };

  const handleSearchClick = (event) => {
    // Prevent the select dropdown from closing when clicking in search field
    event.stopPropagation();
  };

  const handleValidate = async () => {
    const phoneNumberWithCountryCode = `+${getCountryCallingCode(countryCode)}${phoneNumber}`;
    const phoneNumberObj = parsePhoneNumberFromString(phoneNumberWithCountryCode);
    if (!phoneNumberObj?.isValid()) {
      alert('Please enter a valid phone number.');
      return;
    }
    setIsLoading(true);
    try {
      const numericPhoneNumber = phoneNumber.replace(/\D/g, '');
      const response = await axios.post(
        '/workflow.trigger/generateotpforanynumber67bfffa9eefd4',
        `phone=${encodeURIComponent(numericPhoneNumber)}&action=generate&countryCode=${encodeURIComponent(getCountryCallingCode(countryCode))}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (Array.isArray(response.data) && response.data.length > 0) {
        const apiResponse = response.data[0];
        if (apiResponse.error === "False") {
          setShowOTP(true);
        } else if (apiResponse.error === "True") {
          alert('Failed to send OTP. Please check your phone number and try again.');
        } else {
          alert('Unexpected API response. Please try again.');
        }
      } else {
        alert('Invalid API response format. Please try again.');
      }
    } catch (error) {
      alert('Failed to generate OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    setOtp(value);
  };

  const handleSubmit = async () => {
    const numericPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (!otp) {
      alert('Please enter the OTP.');
      return;
    }
    setIsLoading(true);
    try {
      const otpResponse = await axios.post(
        '/workflow.trigger/checkotpforallnumbers67c186f9b4a64',
        `OTP=${encodeURIComponent(otp)}&phone=${encodeURIComponent(numericPhoneNumber)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      if (otpResponse.data[0].error === "false") {
        const networkGDIDValue = networkGDID;
        const logrowIdValue = logrowId;
        const submissionResponse = await axios.post(
          '/workflow.trigger/gdrecieveqrcodeformsubmit67b3210bc2752',
          `phoneNumber=${encodeURIComponent(numericPhoneNumber)}&networkGDID=${encodeURIComponent(networkGDIDValue)}&logRowID=${encodeURIComponent(logrowIdValue)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        const numericCountryCode = getCountryCallingCode(countryCode);

        if (submissionResponse.data[0].PatientExistFlag === "true") {
          navigate(`/showexistingpatients`, {
            state: {
              state: { response: submissionResponse.data },
              networkGDID: networkGDIDValue,
              phoneNumber: numericPhoneNumber,
              countryCode: numericCountryCode,
            },
          });
        } else {
          navigate(`/add-new-patient`, {
            state: {
              phoneNumber: numericPhoneNumber,
              networkGDID: networkGDIDValue,
              countryCode: numericCountryCode,
            },
          });
        }
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (error) {
      alert('Failed to verify OTP or submit. Please try again.');
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
        position: 'relative',
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
          Delivering Faster, Smarter, and Affordable Medical Care for all.
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {!showOTP ? (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleValidate(); }}>
            <TextField
              select
              label="Country Code"
              value={countryCode}
              onChange={handleCountryChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              sx={{ mb: 0 }}
              ref={inputRef}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                    sx: {
                      // This ensures the menu width matches the input field
                      '& .MuiMenu-list': {
                        width: '100%',
                      },
                      '& .MuiMenu-paper': {
                        width: 'auto',
                      },
                      // Match the width of the input field
                      width: inputRef?.current?.clientWidth,
                    }
                  },
                  // Ensure dropdown closes when item is selected
                  autoClose: true,
                  disableAutoFocus: false,
                  disableEnforceFocus: false,
                  // Match the width of the trigger element
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                },
                renderValue: (selected) => {
                  const country = countries.find((c) => c.code === selected);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ReactCountryFlag countryCode={selected} svg style={{ marginRight: '10px' }} />
                      {country ? `${country.name} (${country.callingCode})` : selected}
                    </Box>
                  );
                },
              }}
            >
              {/* Fixed Search Box */}
              <Box 
                sx={{ 
                  p: 1, 
                  position: 'sticky', 
                  top: 0, 
                  bgcolor: 'white', 
                  zIndex: 1,
                  borderBottom: '1px solid #e0e0e0',
                  width: 'auto',
                }}
                
                onClick={handleSearchClick}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search country..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onClick={handleSearchClick}
                  onKeyDown={(e) => e.stopPropagation()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: { 
                      height: '40px',
                      fontSize: '0.875rem'
                    }
                  }}
                  size="small"
                />
              </Box>
              
              {/* Filtered Countries */}
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <MenuItem key={country.code} value={country.code} sx={{ width: '100%' }}>
                    <ReactCountryFlag countryCode={country.code} svg style={{ marginRight: '10px' }} />
                    {country.name} ({country.callingCode})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled sx={{ width: '100%' }}>No countries match your search</MenuItem>
              )}
            </TextField>
            <TextField
              label="Phone Number"
              value={phoneNumber}
              onChange={handlePhoneChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              type="tel"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              error={!isValidPhone && phoneNumber.length > 0}
              helperText={
                !isValidPhone && phoneNumber.length > 0
                  ? `Invalid phone number for ${countryCode}`
                  : ''
              }
              sx={{ mb: 0 }}
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={isLoading}
              sx={{
                mt: 2,
                width: '100%',
                bgcolor: '#E33610',
                borderColor: '#E33610',
                color: 'white',
                minHeight: '56px', // Aligns with TextField height
                '&:hover': {
                  borderColor: '#E33610',
                  bgcolor: '#E33610',
                },
              }}
            >
              Validate
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <TextField
              label="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              type="tel"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={{ mb: 0 }}
            />
            <Button
              type="submit"
              variant="outlined"
              disabled={isLoading}
              sx={{
                mt: 2,
                width: '100%',
                bgcolor: '#E33610',
                borderColor: '#E33610',
                color: 'white',
                minHeight: '56px', // Aligns with TextField height
                '&:hover': {
                  borderColor: '#E33610',
                  bgcolor: '#E33610',
                },
              }}
            >
              Verify
            </Button>
          </Box>
        )}
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

export default Form1;