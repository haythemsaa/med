import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useAppointments({
    cabinetId: user?.cabinetId,
    page: 1,
    limit: 20,
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      SCHEDULED: 'info',
      CONFIRMED: 'success',
      ARRIVED: 'primary',
      IN_CONSULTATION: 'warning',
      COMPLETED: 'success',
      CANCELLED: 'error',
      NO_SHOW: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Rendez-vous</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nouveau RDV
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data?.data?.map((appointment: any) => (
          <Grid item xs={12} md={6} lg={4} key={appointment.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {new Date(appointment.startTime).toLocaleDateString('fr-FR')}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
                <Typography>
                  Patient: {appointment.patient.firstName} {appointment.patient.lastName}
                </Typography>
                <Typography>
                  Praticien: Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Type: {appointment.type}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AppointmentsPage;
