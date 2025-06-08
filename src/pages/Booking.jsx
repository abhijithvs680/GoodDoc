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
  Card,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedIcon from '@mui/icons-material/Verified';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const response = location.state?.response || {};
  const {
    name = '',
    age = '',
    gender = '',
    networkname = '',
    networkspecialization = '',
    organisation = '',
    region = '',
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);

  const handleBookAppointment = () => {
    setShowAppointmentForm(true);
    setShowSuccessMessage(false);
    setError('');
  };

  const handleMedicalHistoryChange = (event) => {
    setMedicalHistoryDetails(event.target.value);
    if (error) setError('');
  };

  const handleShareMedicalHistoryChange = (event) => {
    setShareMedicalHistory(event.target.checked);
  };

  const validateInput = (text) => {
    return text.trim().length > 0;
  };

  const handleRequestAppointment = async () => {
    if (!validateInput(medicalHistoryDetails)) {
      setError('Please describe your health condition');
      return;
    }

    setIsLoading(true);

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
        appreqid: apiData.appreqid,
      };
      setAppointmentData(updatedData);

      setShowSuccessMessage(true);
      setShowAppointmentForm(false);
      setMedicalHistoryDetails('');
      setShareMedicalHistory(false);
    } catch (error) {
      alert('Failed to request appointment. Please try again.');
    } finally {
      setIsLoading(false);
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

      if (response.data && response.data[0] && 'sharedFlag' in response.data[0]) {
        setSharedFlag(response.data[0].sharedFlag);
      } else {
        setSharedFlag('true');
      }
      alert('Medical history shared successfully!');
    } catch (error) {
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

      if (response.data && response.data[0] && 'sharedFlag' in response.data[0]) {
        setSharedFlag(response.data[0].sharedFlag);
      } else {
        setSharedFlag('false');
      }
      alert('Medical history unshared successfully!');
    } catch (error) {
      alert('Failed to unshare medical history. Please try again.');
    }
  };

  // Open confirmation dialog for Share/Unshare actions
  const handleOpenDialog = (action) => {
    setDialogAction(action);
    setOpenDialog(true);
  };

  // Close dialog without confirming
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogAction(null);
  };

  // Confirm the action and call the appropriate API
  const handleConfirmDialog = async () => {
    setOpenDialog(false);
    if (dialogAction === 'share') {
      await handleShareMedicalHistory();
    } else if (dialogAction === 'unshare') {
      await handleUnshareMedicalHistory();
    }
    setDialogAction(null);
  };

  const handleAddNewPatient = () => {
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
        display: 'flex',
        flexDirection: 'column',
        p: 1,
        mt: 0,
        position: 'relative',
      }}
    >
      {!showAppointmentForm && !showSuccessMessage && (
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
                {networkname}
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
              {networkspecialization}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#000',
                fontSize: '0.9rem',
              }}
            >
              {organisation} | {region}
            </Typography>
          </Box>
        </Card>
      )}

      <Box sx={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        paddingTop: '30px',
        paddingBottom: '30px',
      }}>
        {!showAppointmentForm && !showSuccessMessage && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Circular Avatar with Initial */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: '#FF8A65', // Coral color for the avatar background
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                }}
              >
                {name.charAt(0).toUpperCase()}
              </Box>
              {/* Name, Age, and Gender */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {name} {/* Replace with dynamic name */}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {age}Y - {gender} {/* Replace with dynamic age and gender */}
                </Typography>
              </Box>
            </Box>

            {/* Buttons Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sharedFlag === 'false' && (
                <Button
                  variant="outlined"
                  onClick={() => handleOpenDialog('share')} // Modified to open dialog
                  sx={{
                    width: '100%',
                    borderColor: '#E33610',
                    color: '#E33610',
                    minHeight: '48px', // Adjusted height to match the image
                    bgcolor: 'transparent',
                    textTransform: 'none', // Match the case as in the image
                    fontWeight: 'bold',
                    borderRadius: '8px', // Slightly rounded corners
                    '&:hover': {
                      borderColor: '#C62800',
                      color: '#C62800',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  Share History {/* Updated text to match the image */}
                </Button>
              )}

              {sharedFlag === 'true' && (
                <Button
                  variant="outlined"
                  onClick={() => handleOpenDialog('unshare')} // Modified to open dialog
                  sx={{
                    width: '100%',
                    borderColor: '#E33610',
                    color: '#E33610',
                    minHeight: '48px',
                    bgcolor: 'transparent',
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
                  Unshare History {/* Updated text to be consistent */}
                </Button>
              )}

              <Button
                variant="contained" // Changed to contained to match the filled style in the image
                onClick={handleBookAppointment}
                sx={{
                  width: '100%',
                  bgcolor: '#E33610', // Red background to match the image
                  borderColor: '#E33610',
                  color: 'white',
                  minHeight: '48px', // Adjusted height to match the image
                  textTransform: 'none', // Match the case as in the image
                  fontWeight: 'bold',
                  borderRadius: '8px', // Slightly rounded corners
                  '&:hover': {
                    bgcolor: '#C62800', // Slightly darker red on hover
                    borderColor: '#C62800',
                  },
                }}
              >
                Request for Appointment
              </Button>
            </Box>
          </Box>
        )}

        {showAppointmentForm && (
          <Box sx={{ position: 'relative' }}>
            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                color: '#333',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              Describe your issue
            </Typography>

            {/* TextField with Guidelines Overlay */}
            <Box sx={{ mb: 2, position: 'relative' }}>
              {/* TextField */}
              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#333', fontSize: '1rem' }}>
                      health condition
                    </Typography>
                    <Typography sx={{ color: 'red', ml: 0.5 }}>*</Typography>
                  </Box>
                }
                placeholder="" // Empty placeholder since we're using a custom overlay
                multiline
                rows={12}
                variant="outlined"
                value={medicalHistoryDetails}
                onChange={handleMedicalHistoryChange}
                required
                error={!!error}
                helperText={error}
                InputLabelProps={{
                  shrink: true, // Forces the label to always stay in the "shrunk" state (on the border)
                  disableAnimation: true, // Disables label animation
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderColor: error ? 'red' : '#666',
                    '&:hover': {
                      borderColor: error ? 'red' : '#333',
                    },
                    '&.Mui-focused': {
                      borderColor: error ? 'red' : '#333',
                    },
                    minHeight: '250px', // Adjusted height to match the image
                  },
                  '& .MuiInputLabel-outlined': {
                    color: '#333', // Label color
                    fontSize: '1rem',
                    transform: 'translate(14px, -6px) scale(0.75)', // Fixed position on the border
                    backgroundColor: 'white', // Background to overlap the border
                    padding: '0 4px', // Small padding to match the border overlap
                  },
                  '& .MuiInputLabel-outlined.Mui-focused': {
                    color: error ? 'red' : '#333', // Label color when focused
                    transform: 'translate(14px, -6px) scale(0.75)', // Ensure it doesn't move
                  },
                  '& .MuiInputLabel-outlined.MuiFormLabel-filled': {
                    transform: 'translate(14px, -6px) scale(0.75)', // Ensure it doesn't move when filled
                  },
                  '& .MuiFormLabel-asterisk': {
                    display: 'none', // Hide the default asterisk
                  },
                }}
              />

              {/* Custom Guidelines Overlay (Visible when TextField is empty) */}
              {medicalHistoryDetails === '' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 40, // Adjust based on the label height and padding
                    left: 14, // Align with TextField padding
                    right: 14,
                    color: '#666', // Gray color for placeholder-like text
                    pointerEvents: 'none', // Prevent interaction with the overlay
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5, color: '#800000' }}>
                    Try to include
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box component="span" sx={{ mr: 1, color: '#000' }}>
                      💊 {/* Black emoji */}
                    </Box>
                    <Typography variant="body2">Your Symptoms</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box component="span" sx={{ mr: 1, color: '#000' }}>
                      😷
                    </Box>
                    <Typography variant="body2">Problem Summary</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box component="span" sx={{ mr: 1, color: '#000' }}>
                      📅
                    </Box>
                    <Typography variant="body2">Date of appointment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="span" sx={{ mr: 1, color: '#000' }}>
                      📜
                    </Box>
                    <Typography variant="body2">Relevant History, if any</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Share Medical History Checkbox */}
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
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Share your medical history
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.7rem' }}>
                        By clicking here, your GoodDoc health info and files will be shared with the provider
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}

            {/* Continue Button */}
            <Box>
              <Button
                variant="contained"
                onClick={handleRequestAppointment}
                sx={{
                  width: '100%',
                  bgcolor: '#E33610',
                  borderColor: '#E33610',
                  color: 'white',
                  minHeight: '48px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: '#C62800',
                    borderColor: '#C62800',
                  },
                }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {showSuccessMessage && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {/* Checkmark Icon */}
            <VerifiedIcon
              sx={{
                fontSize: 40,
                color: '#1976D2', // Blue color to match the image
                mb: 1,
              }}
            />

            {/* Success Message */}
            <Typography
              variant="h5"
              sx={{
                color: '#333',
                fontWeight: 'bold',
                mb: 1,
                fontSize: '1.2rem',
              }}
            >
              Your appointment request is on its way!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#000',
                mb: 3,
              }}
            >
              The care provider received your appointment request. You’ll hear from them soon.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 1,
                borderTop: '3px dashed #e0e0e0',
                pb: 2,
                pt: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'left' }}>
                  Name
                </Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'left', fontSize: '1rem' }}>
                  {name}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'left' }}>
                  Age
                </Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
                  {age}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'left' }}>
                  Gender
                </Typography>
                <Typography variant="body1" sx={{ color: '#333', fontWeight: 'bold', textAlign: 'left' }}>
                  {gender}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 3,
                borderBottom: '3px dashed #e0e0e0',
                pb: 2,
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'left' }}>
                  Care Provider
                </Typography>
                <Typography variant="body1" sx={{ color: '#800000', fontWeight: 'bold', textAlign: 'left' }}>
                  {networkname}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold', textAlign: 'left' }}>
                  #{appointmentData.appreqid || 'N/A'} {/* Updated to use appointmentData.appreqid */}
                </Typography>
              </Box>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: '#333',
                fontWeight: 'bold',
                mb: '1rem',
                fontSize: '0.9rem',
              }}
            >
              Thanks for using GoodDoc!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#000',
                mb: 2,
              }}
            >
              Get the app to track your health and book appointments easily
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {/* App Store Button */}
              <Link
                href="https://gooddoc.app/download"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'center', ml: 1.5 }}
              >
                <Box
                  component="img"
                  src="https://developer.apple.com/assets/elements/icons/download-on-the-app-store/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  sx={{ height: 40 }}
                />
              </Link>

              {/* Google Play Button */}
              <Link
                href="https://gooddoc.app/download"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <Box
                  component="img"
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  sx={{ height: 60 }}
                />
              </Link>
            </Box>
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          {dialogAction === 'share' ? 'Share Medical History' : 'Unshare Medical History'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            Are you sure you want to {dialogAction === 'share' ? 'share' : 'unshare'} your medical history with the care provider?
            {dialogAction === 'share' && (
              <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                By sharing, your GoodDoc health info and files will be shared with the provider.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDialog} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

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