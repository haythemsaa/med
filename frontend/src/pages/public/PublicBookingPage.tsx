import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { CalendarToday, VideoCall, Person } from '@mui/icons-material';

const steps = ['Choisir un praticien', 'Sélectionner un créneau', 'Vos informations', 'Confirmation'];

const PublicBookingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cabinetData, setCabinetData] = useState<any>(null);

  // Form state
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'CONSULTATION' | 'TELECONSULTATION'>('CONSULTATION');
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    reason: '',
  });

  useEffect(() => {
    // Load cabinet data
    loadCabinetData();
  }, [slug]);

  const loadCabinetData = async () => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setCabinetData({
        name: 'Cabinet Médical Tunis',
        description: 'Votre santé, notre priorité',
        address: '123 Avenue Habib Bourguiba, Tunis',
        phone: '+216 71 123 456',
        practitioners: [
          {
            id: '1',
            firstName: 'Ahmed',
            lastName: 'Ben Ali',
            speciality: 'Médecin généraliste',
            photo: null,
            consultationFee: 50,
            allowTeleconsultation: true,
          },
          {
            id: '2',
            firstName: 'Sarah',
            lastName: 'Trabelsi',
            speciality: 'Pédiatre',
            photo: null,
            consultationFee: 60,
            allowTeleconsultation: true,
          },
        ],
      });
      setLoading(false);
    }, 1000);
  };

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleBooking = () => {
    // Submit booking
    console.log('Booking submitted', {
      practitionerId: selectedPractitioner,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      patient: patientInfo,
    });

    // Show success and redirect
    alert('Rendez-vous confirmé! Vous recevrez un email de confirmation.');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            {cabinetData?.name}
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {cabinetData?.description}
          </Typography>
          <Typography variant="body1">
            {cabinetData?.address} • {cabinetData?.phone}
          </Typography>
        </Paper>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Paper sx={{ p: 4 }}>
          {/* Step 1: Choose Practitioner */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h5" mb={3}>
                Choisissez votre praticien
              </Typography>
              <Grid container spacing={3}>
                {cabinetData?.practitioners.map((pract: any) => (
                  <Grid item xs={12} md={6} key={pract.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: 2,
                        borderColor: selectedPractitioner === pract.id ? 'primary.main' : 'transparent',
                      }}
                      onClick={() => setSelectedPractitioner(pract.id)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ width: 64, height: 64 }}>
                            <Person sx={{ fontSize: 40 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">
                              Dr. {pract.firstName} {pract.lastName}
                            </Typography>
                            <Typography color="textSecondary">
                              {pract.speciality}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip
                            icon={<CalendarToday />}
                            label={`${pract.consultationFee} TND`}
                            size="small"
                          />
                          {pract.allowTeleconsultation && (
                            <Chip
                              icon={<VideoCall />}
                              label="Téléconsultation disponible"
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Step 2: Select Date & Time */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="h5" mb={3}>
                Sélectionnez la date et l'heure
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type de consultation</InputLabel>
                <Select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value as any)}
                  label="Type de consultation"
                >
                  <MenuItem value="CONSULTATION">Consultation au cabinet</MenuItem>
                  <MenuItem value="TELECONSULTATION">Téléconsultation</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle1" mb={2}>
                Créneaux disponibles
              </Typography>
              <Grid container spacing={2}>
                {availableSlots.map((slot) => (
                  <Grid item xs={6} sm={4} md={3} key={slot}>
                    <Button
                      fullWidth
                      variant={selectedTime === slot ? 'contained' : 'outlined'}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Step 3: Patient Information */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h5" mb={3}>
                Vos informations
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={patientInfo.firstName}
                    onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={patientInfo.lastName}
                    onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={patientInfo.email}
                    onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={patientInfo.phone}
                    onChange={(e) => setPatientInfo({ ...patientInfo, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de naissance"
                    value={patientInfo.dateOfBirth}
                    onChange={(e) => setPatientInfo({ ...patientInfo, dateOfBirth: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Genre</InputLabel>
                    <Select
                      value={patientInfo.gender}
                      onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                      label="Genre"
                    >
                      <MenuItem value="MALE">Homme</MenuItem>
                      <MenuItem value="FEMALE">Femme</MenuItem>
                      <MenuItem value="OTHER">Autre</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Motif de la consultation"
                    value={patientInfo.reason}
                    onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 4: Confirmation */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h5" mb={3}>
                Confirmation
              </Typography>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Récapitulatif de votre rendez-vous
                  </Typography>
                  <Box mt={2}>
                    <Typography><strong>Date:</strong> {selectedDate}</Typography>
                    <Typography><strong>Heure:</strong> {selectedTime}</Typography>
                    <Typography><strong>Type:</strong> {consultationType === 'TELECONSULTATION' ? 'Téléconsultation' : 'Consultation au cabinet'}</Typography>
                    <Typography><strong>Praticien:</strong> Dr. {cabinetData?.practitioners.find((p: any) => p.id === selectedPractitioner)?.firstName} {cabinetData?.practitioners.find((p: any) => p.id === selectedPractitioner)?.lastName}</Typography>
                    <Typography><strong>Patient:</strong> {patientInfo.firstName} {patientInfo.lastName}</Typography>
                    <Typography><strong>Email:</strong> {patientInfo.email}</Typography>
                    <Typography><strong>Téléphone:</strong> {patientInfo.phone}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Retour
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleBooking : handleNext}
              disabled={
                (activeStep === 0 && !selectedPractitioner) ||
                (activeStep === 1 && (!selectedDate || !selectedTime))
              }
            >
              {activeStep === steps.length - 1 ? 'Confirmer le rendez-vous' : 'Suivant'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicBookingPage;
