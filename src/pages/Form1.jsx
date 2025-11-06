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
  Card,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { parsePhoneNumberFromString, getCountryCallingCode, getCountries } from 'libphonenumber-js';
import ReactCountryFlag from 'react-country-flag';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckIcon from '@mui/icons-material/Check';

const Form1 = () => {
  // New state to manage the initial page load
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [countryCode, setCountryCode] = useState('ZW');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorInfo, setDoctorInfo] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const networkGDID = searchParams.get('gdid');
  const logrowId = searchParams.get('rowid');

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      // If there's no networkGDID, don't bother fetching and just load the page.
      if (!networkGDID) {
        setIsPageLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          'https://innov-dev.beta.injomo.com/workflow.trigger/gdgetnetworkinfobygdidqr6828543b975ac',
          `networkGDID=${encodeURIComponent(networkGDID)}`,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        if (response.data && response.data.length > 0) {
          setDoctorInfo(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching doctor info:', error);
        // Handle the error as needed, e.g., show an error message.
      } finally {
        // Set page loading to false once the API call is complete (either success or error)
        setIsPageLoading(false);
      }
    };

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
    fetchDoctorInfo();
  }, [networkGDID]);


    // Handlers remain the same
    const handleCountryChange = (event) => {
        setCountryCode(event.target.value);
        setPhoneNumber('');
        setIsValidPhone(true);
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
                'https://innov-dev.beta.injomo.com/workflow.trigger/generateotpforanynumber67bfffa9eefd4',
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
                'https://innov-dev.beta.injomo.com/workflow.trigger/checkotpforallnumbers67c186f9b4a64',
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
                    'https://innov-dev.beta.injomo.com/workflow.trigger/gdrecieveqrcodeformsubmit67b3210bc2752',
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


  // Render a loading spinner while the page is loading
  if (isPageLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render the form once the data is fetched
  return (
    <Container
      maxWidth="sm"
      sx={{
        bgcolor: '#F5F7FA',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
        position: 'relative',
      }}
    >
      <Box sx={{ p: 1, textAlign: 'center' }}>

        {doctorInfo && (
          <Card
          sx={{
            mb: 1.5,
            borderRadius: '15px',
            boxShadow: 'none',
            border: 'none',
            background: 'linear-gradient(90deg, rgba(255, 175, 146, 1) 0%, rgba(255, 204, 146, 1) 100%)', // Gradient background
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            height: '85px',
            position: 'relative', // For the pseudo-element positioning
            overflow: 'hidden', // Match overflow-hidden
            '&::before': { // Replicate the circle-bg div using ::before pseudo-element
              content: '""',
              position: 'absolute',
              zIndex: 10,
              right: '-37px',
              top: 0,
              opacity: 0.1,
              backgroundImage: `url('https://static.vizru.com/good-doc/images/circle.svg')`,
              width: '100%',
              height: '100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right',
              backgroundSize: '41%',
            },
          }}
        >
          {/* Doctor Icon */}
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '25px',
              backgroundColor: '#E6F0FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            <img
              src="https://static.vizru.com/good-doc/images/doctor.png"
              alt="Doctor Icon"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'contain',
              }}
            />
          </Box>
          {/* Text Content */}
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: '' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: '#000',
                }}
              >
                {doctorInfo.Title} {doctorInfo.Name} {doctorInfo.Surname}
              </Typography>
              <Box sx={{ marginLeft: 0.3, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <VerifiedIcon
                  sx={{
                    fontSize: 17,
                    color: '#F44336',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #F44336 0%, transparent 70%)',
                  }}
                />
                <CheckIcon
                  sx={{
                    position: 'absolute',
                    fontSize: 10,
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: '#000',
                fontSize: '0.9rem',
              }}
            >
              {doctorInfo.Specialization}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#000',
                fontSize: '0.9rem',
              }}
            >
              {doctorInfo.Organisation} | {doctorInfo.Region}
            </Typography>
          </Box>
        </Card>
        )}




        {!showOTP ? (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleValidate();
            }}
            sx={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '10px',
              paddingTop: '30px',
              paddingBottom: '40px',
            }}
          >
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 1, fontWeight: 'medium', fontSize: '1.7rem', }}>
              Sign in to <br></br> get started
            </Typography>

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
                      '& .MuiMenu-list': {
                        width: '100%',
                      },
                      '& .MuiMenu-paper': {
                        width: 'auto',
                      },
                      width: inputRef?.current?.clientWidth,
                    }
                  },
                  autoClose: true,
                  disableAutoFocus: false,
                  disableEnforceFocus: false,
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
              label="Whatsapp Number"
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
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                width: '100%',
                bgcolor: '#E33610',
                color: 'white',
                py: 1.5,
                '&:hover': {
                  bgcolor: '#C02E0D',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Typography variant="body1" sx={{ textAlign: 'left', mb: 1, fontWeight: 'medium' }}>
              Enter OTP
            </Typography>
            <TextField
              value={otp}
              onChange={handleOtpChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              type="tel"
              placeholder="OTP"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                width: '100%',
                bgcolor: '#E33610',
                color: 'white',
                py: 1.5,
                mb: 2,
                '&:hover': {
                  bgcolor: '#C02E0D',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
            </Button>

            <Button
              variant="text"
              disabled={isLoading}
              sx={{
                width: '100%',
                color: '#E33610',
                py: 1.5,
                '&:hover': {
                  bgcolor: 'transparent',
                },
              }}
              onClick={handleValidate}
            >
              Resend OTP
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