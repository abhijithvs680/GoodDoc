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
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        p: 0 
      }}
    >
      <Box sx={{ mb: -2, textAlign: 'center', p: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 500, 
            color: '#333', 
            fontSize: '1.5rem', 
            mb: 2 
          }}
        >
          Select a Patient
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <Card 
              key={patient.PatientGDID} 
              sx={{ 
                mb: 2, 
                bgcolor: '#FFFFFF', 
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#c8c8c8' }
              }}
              onClick={() => handlePatientClick(patient)}
            >
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="div" 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: '#909191',
                      borderRadius: '50%',
                      marginRight: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontSize: '1rem',
                      minWidth: 40,
                      minHeight: 40,
                    }}
                  >
                    {patient.Name.charAt(0)}
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#333', 
                      fontSize: '1rem' 
                    }}
                  >
                    {patient.Name} - {patient.Age} Years - {patient.Gender}
                  </Typography>
                </Box>
                <IconButton aria-label="navigate" sx={{ color: 'rgb(0, 0, 0)' }}>
                  <ArrowForwardIcon />
                </IconButton>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: '#333', textAlign: 'center', mb: 2 }}>
            No patients available.
          </Typography>
        )}

        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center', 
            color: '#333', 
            mb: 2, 
            fontSize: '1rem' 
          }}
        >
          OR
        </Typography>

        <Button 
          variant="outlined"
          onClick={handleAddNewPatient}
          sx={{ 
            width: '100%', 
            borderColor: '#E33610',
            bgcolor: '#E33610',
            color: 'white',
            minHeight: '56px', // Aligns with TextField height
            '&:hover': {
              borderColor: '#E33610',
              bgcolor: '#E33610',
            },
          }}
        >
          Add New Patient
        </Button>
      </Box>

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