import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';

const ShowExistingPatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { networkGDID, countryCode, phoneNumber } = location.state || {};

  useEffect(() => {
    if (location.state?.state?.response && Array.isArray(location.state.state.response)) {
      const responseObj = location.state.state.response[0];
      if (responseObj.patients) {
        try {
          const parsedPatients = JSON.parse(responseObj.patients);
          if (
            Array.isArray(parsedPatients) &&
            parsedPatients.every(
              (p) => p.Name && p.Gender && p.PatientGDID
            )
          ) {
            setPatients(parsedPatients);
          } else {
            setPatients([]);
          }
        } catch (error) {
          setPatients([]);
        }
      } else {
        setPatients([]);
      }
    } else {
      setPatients([]);
    }
  }, [location.state]);

  const handlePatientClick = async (patient) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://innov-dev.beta.injomo.com/workflow.trigger/gdqrselectpatient67bff515ad723',
        `patientGDID=${encodeURIComponent(patient.PatientGDID)}&networkGDID=${encodeURIComponent(networkGDID)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      navigate('/booking', { state: { response: response.data[0] } });
    } catch (error) {
      alert('Failed to load patient details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewPatient = () => {
    navigate('/add-new-patient', {
      state: { phoneNumber, countryCode, networkGDID }
    });
  };

  // ✅ Updated formatAge logic
  const formatAge = (patient) => {
    const valid = (val) =>
      val !== null && val !== undefined && val !== '' && val !== '0' && val !== 0;

    // Normalize key casing
    const keys = Object.keys(patient || {}).reduce((acc, key) => {
      acc[key.toLowerCase()] = patient[key];
      return acc;
    }, {});

    const age = keys.age;
    const month = keys.month || keys.months;
    const day = keys.day || keys.days;
    const gender = patient?.Gender || '';

    // Priority logic: Age → Month → Day
    let ageString = '';
    if (valid(age)) {
      ageString = `${age}Y`;
    } else if (valid(month)) {
      ageString = `${month}M`;
    } else if (valid(day)) {
      ageString = `${day}D`;
    }

    return ageString ? `${ageString} - ${gender}` : gender;
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        bgcolor: '#F5F7FA',
        display: 'flex',
        flexDirection: 'column',
        p: 0
      }}
    >
      {/* Patient List */}
      <Box sx={{ px: 1, pb: 3, flexGrow: 1, mt: 2 }}>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <Card
              key={patient.PatientGDID}
              sx={{
                mb: 2,
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid #e0e0e0',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#F5F7FA' },
              }}
              onClick={() => handlePatientClick(patient)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  '&:last-child': { pb: 2 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Avatar */}
                  <Box
                    component="div"
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: '#FF8A65',
                      borderRadius: '50%',
                      marginRight: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      minWidth: 48,
                      minHeight: 48,
                    }}
                  >
                    {patient.Name?.charAt(0)?.toUpperCase()}
                  </Box>

                  {/* Patient Details */}
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#333',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {patient.Name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        fontSize: '0.9rem',
                      }}
                    >
                      {formatAge(patient)}
                    </Typography>
                  </Box>
                </Box>

                {/* Forward Arrow */}
                <IconButton
                  aria-label="navigate"
                  sx={{
                    color: '#333',
                    bgcolor: '#E0E0E0',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    '&:hover': { bgcolor: '#D0D0D0' },
                  }}
                >
                  <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{
              color: '#333',
              textAlign: 'center',
              mb: 2,
              fontSize: '1rem',
            }}
          >
            No patients available.
          </Typography>
        )}

        {/* OR Separator */}
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: '#000',
            mb: 2,
            fontSize: '1rem',
          }}
        >
          OR
        </Typography>

        {/* Add New Patient Button */}
        <Button
          variant="outlined"
          onClick={handleAddNewPatient}
          sx={{
            width: '100%',
            borderColor: '#E33610',
            color: '#E33610',
            bgcolor: 'transparent',
            minHeight: '48px',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#C62800',
              color: '#C62800',
              bgcolor: 'transparent',
            },
          }}
        >
          Add New Patient
        </Button>
      </Box>

      {/* Loading Overlay */}
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

export default ShowExistingPatients;
