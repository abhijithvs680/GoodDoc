import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Checkbox,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifiedIcon = () => (
  <Box
    component="span"
    sx={{
      display: 'inline-block',
      width: 16,
      height: 16,
      bgcolor: '#D4A017',
      borderRadius: '50%',
      position: 'relative',
      marginBottom: '4px',
      marginLeft: 0.5,
      top: 2,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 4,
        height: 8,
        border: 'solid white',
        borderWidth: '0 2px 2px 0',
        transform: 'translate(-50%, -60%) rotate(45deg)',
      },
    }}
  />
);

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const response = location.state?.response || {};
  const {
    name = '',
    networkname = '',
    networkspecialization = '',
    organisation = '',
    sharedFlag: initialSharedFlag = 'false',
    patientGDID = '',
    networkGDID = '',
  } = response;

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [medicalHistoryDetails, setMedicalHistoryDetails] = useState('');
  const [shareMedicalHistory, setShareMedicalHistory] = useState(false);
  const [sharedFlag, setSharedFlag] = useState(initialSharedFlag);
  const [appointmentData, setAppointmentData] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const handleBookAppointment = () => {
    setShowAppointmentForm(true);
    setShowSuccessMessage(false);
  };

  const handleMedicalHistoryChange = (event) => {
    setMedicalHistoryDetails(event.target.value);
  };

  const handleShareMedicalHistoryChange = (event) => {
    setShareMedicalHistory(event.target.checked);
  };

  const handleRequestAppointment = async () => {
    if (!medicalHistoryDetails) {
      alert('Enter appointment details to proceed.');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(
        '/workflow.trigger/gdqrappoinmentrequestreciver67b6d8cb139ad',
        `patientGDID=${encodeURIComponent(patientGDID || '')}&networkGDID=${encodeURIComponent(networkGDID || '')}&details=${encodeURIComponent(medicalHistoryDetails)}&historyShare=${encodeURIComponent(shareMedicalHistory.toString())}&btnText=RequestAppointment`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const apiData = response.data[0];
      const updatedData = {
        countryCode: apiData.countryCode,
        phoneNumber: apiData.phoneNumber,
        networkGDID: apiData.networkGDID,
      };
      setAppointmentData(updatedData);
      console.log('Appointment Data Set:', updatedData);

      setShowSuccessMessage(true);
      setShowAppointmentForm(false);
      setMedicalHistoryDetails('');
      setShareMedicalHistory(false);
    } catch (error) {
      console.error('Error requesting appointment:', error);
      alert('Failed to request appointment. Please try again.');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleShareMedicalHistory = async () => {
    try {
      const response = await axios.post(
        '/workflow.trigger/gdqrappoinmentrequestreciver67b6d8cb139ad',
        `patientGDID=${encodeURIComponent(patientGDID || '')}&networkGDID=${encodeURIComponent(networkGDID || '')}&btnText=ShareMedicalHistory`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('Share Medical History API Response:', response.data);
      if (response.data && response.data[0] && 'sharedFlag' in response.data[0]) {
        setSharedFlag(response.data[0].sharedFlag);
      } else {
        setSharedFlag('true');
      }
      alert('Medical history shared successfully!');
    } catch (error) {
      console.error('Error sharing medical history:', error);
      alert('Failed to share medical history. Please try again.');
    }
  };

  const handleUnshareMedicalHistory = async () => {
    try {
      const response = await axios.post(
        '/workflow.trigger/gdqrappoinmentrequestreciver67b6d8cb139ad',
        `patientGDID=${encodeURIComponent(patientGDID || '')}&networkGDID=${encodeURIComponent(networkGDID || '')}&btnText=UnshareMedicalHistory`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('Unshare Medical History API Response:', response.data);
      if (response.data && response.data[0] && 'sharedFlag' in response.data[0]) {
        setSharedFlag(response.data[0].sharedFlag);
      } else {
        setSharedFlag('false');
      }
      alert('Medical history unshared successfully!');
    } catch (error) {
      console.error('Error unsharing medical history:', error);
      alert('Failed to unshare medical history. Please try again.');
    }
  };

  const handleAddNewPatient = () => {
    console.log('Navigating with Appointment Data:', appointmentData);
    navigate('/add-new-patient', { 
      state: { 
        countryCode: appointmentData.countryCode,
        phoneNumber: appointmentData.phoneNumber,
        networkGDID: appointmentData.networkGDID,
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
        p: 0,
        mt: 0,
        position: 'relative', // Ensure Container can contain the fixed loader
      }}
    >
      <Box sx={{ mb: 0, textAlign: 'center', p: 3 }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 500, 
            color: '#333', 
            fontSize: '1.5rem', 
            mb: 2,
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          Welcome {name || ''}
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#D4A017',
            fontSize: '1rem', 
            mb: 2 
          }}
        >
          You’re now connected with,
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#333', 
              fontSize: '1rem', 
            }}
          >
            {networkname || ''} 
          </Typography>
          <VerifiedIcon />
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#333', 
            fontSize: '1rem', 
          }}
        >
          {networkspecialization || ''} 
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#333', 
            fontSize: '1rem', 
          }}
        >
          {organisation || ''} 
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#D4A017', 
            fontSize: '1rem', 
            mb: 2 
          }}
        >
          Find your desired health solutions,
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {!showAppointmentForm && !showSuccessMessage && (
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<Box component="span" sx={{ fontSize: '1rem', marginRight: 1 }}>📅</Box>}
              onClick={handleBookAppointment}
              sx={{ 
                width: '100%', 
                borderColor: '#666', 
                color: '#333', 
                '&:hover': { borderColor: '#333', bgcolor: 'rgba(0, 0, 0, 0.04)' },
                mb: 2 
              }}
            >
              Request Appointment
            </Button>

            {sharedFlag === 'false' && (
              <Button 
                variant="outlined" 
                onClick={handleShareMedicalHistory}
                sx={{ 
                  width: '100%', 
                  borderColor: '#666', 
                  color: '#333', 
                  '&:hover': { borderColor: '#333', bgcolor: 'rgba(0, 0, 0, 0.04)' },
                  mb: 2 
                }}
              >
                Share Medical History
              </Button>
            )}

            {sharedFlag === 'true' && (
              <Button 
                variant="outlined" 
                onClick={handleUnshareMedicalHistory}
                sx={{ 
                  width: '100%', 
                  borderColor: '#666', 
                  color: '#333', 
                  '&:hover': { borderColor: '#333', bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                Unshare Medical History
              </Button>
            )}
          </Box>
        )}

        {showAppointmentForm && (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Enter appointment details here..."
                multiline
                rows={4}
                variant="outlined"
                value={medicalHistoryDetails}
                onChange={handleMedicalHistoryChange}
                sx={{ 
                  mb: 2, 
                  '& .MuiOutlinedInput-root': { 
                    borderColor: '#666', 
                    '&:hover': { borderColor: '#333' },
                    '&.Mui-focused': { borderColor: '#333' }
                  }
                }}
              />
            </Box>

            {sharedFlag === 'false' && (
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shareMedicalHistory}
                      onChange={handleShareMedicalHistoryChange}
                      color="primary"
                    />
                  }
                  label="Share Medical History"
                />
              </Box>
            )}

            <Box>
              <Button 
                variant="outlined" 
                startIcon={<Box component="span" sx={{ fontSize: '1rem', marginRight: 1 }}>📅</Box>}
                onClick={handleRequestAppointment}
                sx={{ 
                  width: '100%', 
                  borderColor: '#666', 
                  color: '#333', 
                  '&:hover': { borderColor: '#333', bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                Request Appointment 
              </Button>
            </Box>
          </Box>
        )}

        {showSuccessMessage && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333', 
                mb: 2,
                fontWeight: 500
              }}
            >
              Appointment request submitted successfully!
            </Typography>
            <Button 
              variant="outlined"
              onClick={handleAddNewPatient}
              sx={{ 
                width: '100%', 
                borderColor: '#666',
                color: '#333',
                '&:hover': {
                  borderColor: '#333',
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              ADD NEW PATIENT
            </Button>
          </Box>
        )}
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

export default Booking;