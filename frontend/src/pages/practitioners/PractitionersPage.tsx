import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { usePractitioners } from '../../hooks/usePractitioners';
import { useAuth } from '../../contexts/AuthContext';

const PractitionersPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = usePractitioners(user?.cabinetId || '', 1, 20);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getPractitionerTypeLabel = (type: string) => {
    const labels: any = {
      DOCTOR: 'M\u00e9decin',
      NURSE: 'Infirmier(e)',
      PHYSIOTHERAPIST: 'Kin\u00e9sith\u00e9rapeute',
      RADIOLOGIST: 'Radiologue',
      LABORATORY_TECHNICIAN: 'Technicien de laboratoire',
      PSYCHOLOGIST: 'Psychologue',
      DENTIST: 'Dentiste',
      PHARMACIST: 'Pharmacien',
      OTHER: 'Autre',
    };
    return labels[type] || type;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Praticiens</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nouveau Praticien
        </Button>
      </Box>

      <Grid container spacing={3}>
        {data?.data?.map((practitioner: any) => (
          <Grid item xs={12} md={6} lg={4} key={practitioner.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Dr. {practitioner.firstName} {practitioner.lastName}
                  </Typography>
                  <Chip
                    label={practitioner.isActive ? 'Actif' : 'Inactif'}
                    color={practitioner.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {getPractitionerTypeLabel(practitioner.type)}
                </Typography>
                <Typography variant="body2">
                  Sp\u00e9cialit\u00e9: {practitioner.specialization || '-'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  T\u00e9l: {practitioner.phone}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Email: {practitioner.email}
                </Typography>
                {practitioner.licenseNumber && (
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    N\u00b0 Licence: {practitioner.licenseNumber}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small">Voir</Button>
                <Button size="small">Horaires</Button>
                <Button size="small">Absences</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PractitionersPage;
