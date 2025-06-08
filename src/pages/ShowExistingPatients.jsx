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
          if (Array.isArray(parsedPatients) && parsedPatients.every(p => p.Name && p.Age !== undefined && p.Gender && p.PatientGDID)) {
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
        '/workflow.trigger/gdqrselectpatient67bff515ad723',
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
      state: { 
        phoneNumber, 
        countryCode, 
        networkGDID 
      } 
    });
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
      {/* Title */}
      <Box sx={{ mb: 1, textAlign: 'left', mt: 2, px: 1 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#333', 
            fontSize: '0.8rem',
          }}
        >
          Select Patient
        </Typography>
      </Box>

      <Box sx={{ px: 1, pb: 3, flexGrow: 1 }}>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <Card 
              key={patient.PatientGDID} 
              sx={{ 
                mb: 2, 
                bgcolor: '#FFFFFF', 
                borderRadius: '12px', // Rounded corners to match the image
                cursor: 'pointer',
                border: '1px solid #e0e0e0', // Light gray border
                boxShadow: 'none', // Remove default shadow
                '&:hover': { bgcolor: '#F5F7FA' } // Lighter gray on hover
              }}
              onClick={() => handlePatientClick(patient)}
            >
              <CardContent 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  p: 2,
                  '&:last-child': { pb: 2 }, // Ensure consistent padding
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Avatar */}
                  <Box 
                    component="div" 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: '#FF8A65', // Coral color for the avatar
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
                    {patient.Name.charAt(0).toUpperCase()}
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
                      {patient.Age}Y - {patient.Gender}
                    </Typography>
                  </Box>
                </Box>
                {/* Forward Arrow */}
                <IconButton 
                  aria-label="navigate" 
                  sx={{ 
                    color: '#333',
                    bgcolor: '#E0E0E0', // Light gray background for the icon
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
            bgcolor: 'transparent', // Transparent background for outlined button
            minHeight: '48px', // Adjusted height to match the image
            textTransform: 'none', // Match the case in the image
            fontWeight: 'bold',
            borderRadius: '8px', // Rounded corners
            '&:hover': {
              borderColor: '#C62800', // Darker red on hover
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
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000 
        }}>
          <CircularProgress size={60} sx={{ color: '#007bff' }} />
        </Box>
      )}
    </Container>
  );
};

export default ShowExistingPatients;