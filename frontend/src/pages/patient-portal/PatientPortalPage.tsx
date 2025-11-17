import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CalendarToday,
  Description,
  VideoCall,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const PatientPortalPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Mock data - replace with actual API calls
  const upcomingAppointments = [
    {
      id: '1',
      date: '2025-11-20',
      time: '10:00',
      practitioner: 'Dr. Ahmed Ben Ali',
      type: 'Consultation',
      status: 'CONFIRMED',
    },
    {
      id: '2',
      date: '2025-11-25',
      time: '14:30',
      practitioner: 'Dr. Sarah Trabelsi',
      type: 'Téléconsultation',
      status: 'SCHEDULED',
    },
  ];

  const documents = [
    {
      id: '1',
      name: 'Ordonnance - 15 Nov 2025',
      type: 'PRESCRIPTION',
      date: '2025-11-15',
      size: '245 KB',
    },
    {
      id: '2',
      name: 'Résultats d\'analyse',
      type: 'LAB_RESULT',
      date: '2025-11-10',
      size: '1.2 MB',
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'COMPLETED':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      CONFIRMED: 'Confirmé',
      SCHEDULED: 'Planifié',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={3}>
        Mon Portail Patient
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Mes rendez-vous" icon={<CalendarToday />} iconPosition="start" />
          <Tab label="Mes documents" icon={<Description />} iconPosition="start" />
          <Tab label="Mes informations" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Rendez-vous à venir</Typography>
                  <Button variant="contained" startIcon={<CalendarToday />}>
                    Prendre rendez-vous
                  </Button>
                </Box>

                <List>
                  {upcomingAppointments.map((apt) => (
                    <ListItem
                      key={apt.id}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="subtitle1">
                              {new Date(apt.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}{' '}
                              à {apt.time}
                            </Typography>
                            <Chip
                              label={getStatusLabel(apt.status)}
                              color={getStatusColor(apt.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2">
                              Avec {apt.practitioner}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Type: {apt.type}
                            </Typography>
                          </Box>
                        }
                      />
                      {apt.type === 'Téléconsultation' && (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<VideoCall />}
                          sx={{ ml: 2 }}
                        >
                          Rejoindre
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Historique
                </Typography>
                <Typography color="textSecondary">
                  Aucun rendez-vous passé pour le moment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Mes documents médicaux
            </Typography>

            <List>
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2,
                  }}
                  secondaryAction={
                    <IconButton edge="end">
                      <DownloadIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={doc.name}
                    secondary={
                      <Box display="flex" gap={2} mt={0.5}>
                        <Typography variant="caption">
                          {new Date(doc.date).toLocaleDateString('fr-FR')}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography variant="caption">{doc.size}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Informations personnelles
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Nom" secondary="Patient Test" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Email" secondary="patient@example.com" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Téléphone" secondary="+216 XX XXX XXX" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Date de naissance" secondary="01/01/1990" />
                  </ListItem>
                </List>
                <Button variant="outlined" fullWidth>
                  Modifier mes informations
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Informations médicales
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText primary="Groupe sanguin" secondary="O+" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Allergies" secondary="Aucune connue" />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Maladies chroniques"
                      secondary="Aucune connue"
                    />
                  </ListItem>
                </List>
                <Button variant="outlined" fullWidth>
                  Mettre à jour
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default PatientPortalPage;
