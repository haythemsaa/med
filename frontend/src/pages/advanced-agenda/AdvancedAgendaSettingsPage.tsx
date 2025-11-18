import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Timer as TimerIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotifIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useAgendaSettings,
  useCreateOrUpdateSettings,
  useEnableMultipleLocations,
  useEnableParallelConsultations,
  useEnableDelayNotifications,
} from '../../hooks/useAdvancedAgendaSettings';

const AdvancedAgendaSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const practitionerId = user?.id || '';

  const { data: settings, isLoading } = useAgendaSettings(practitionerId);
  const updateMutation = useCreateOrUpdateSettings();
  const multipleLocationsMutation = useEnableMultipleLocations();
  const parallelConsultationsMutation = useEnableParallelConsultations();
  const delayNotificationsMutation = useEnableDelayNotifications();

  const [newLocation, setNewLocation] = useState({ name: '', address: '' });
  const [parallelSlots, setParallelSlots] = useState(2);
  const [delayThreshold, setDelayThreshold] = useState(15);

  const handleEnableMultipleLocations = () => {
    if (!practitionerId || !newLocation.name) return;

    const locations = settings?.multipleLocations || [];
    multipleLocationsMutation.mutate({
      practitionerId,
      locations: [...locations, newLocation],
    });
    setNewLocation({ name: '', address: '' });
  };

  const handleEnableParallelConsultations = () => {
    if (!practitionerId) return;

    parallelConsultationsMutation.mutate({
      practitionerId,
      maxParallelSlots: parallelSlots,
    });
  };

  const handleEnableDelayNotifications = () => {
    if (!practitionerId) return;

    delayNotificationsMutation.mutate({
      practitionerId,
      thresholdMinutes: delayThreshold,
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 40 }} />
          Paramètres Avancés d'Agenda
          <Chip label="Illimité vs 2 lieux chez Doctolib" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Multi-sites, consultations parallèles, gestion avancée des créneaux
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Multiple Locations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <LocationIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Lieux d'exercice multiples</Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Doctolib:</strong> 2 lieux maximum
                <br />
                <strong>MediCare:</strong> ILLIMITÉ! 🎉
              </Alert>

              {settings?.multipleLocations && settings.multipleLocations.length > 0 && (
                <List>
                  {settings.multipleLocations.map((location: any, idx: number) => (
                    <ListItem
                      key={idx}
                      secondaryAction={
                        <IconButton edge="end">
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={location.name} secondary={location.address} />
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                label="Nom du lieu"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                margin="normal"
                size="small"
              />

              <TextField
                fullWidth
                label="Adresse"
                value={newLocation.address}
                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                margin="normal"
                size="small"
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleEnableMultipleLocations}
                fullWidth
                sx={{ mt: 2 }}
                disabled={!newLocation.name}
              >
                Ajouter un lieu
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Parallel Consultations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TimerIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Consultations parallèles</Typography>
              </Box>

              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>Doctolib:</strong> 2 créneaux parallèles max
                <br />
                <strong>MediCare:</strong> Jusqu'à 5! 🎉
              </Alert>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nombre de créneaux simultanés autorisés:
              </Typography>

              <TextField
                fullWidth
                type="number"
                label="Créneaux parallèles"
                value={parallelSlots}
                onChange={(e) => setParallelSlots(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 5 }}
                margin="normal"
                size="small"
              />

              <Button
                variant="contained"
                onClick={handleEnableParallelConsultations}
                fullWidth
                sx={{ mt: 2 }}
              >
                Activer ({parallelSlots} créneaux)
              </Button>

              {settings?.parallelConsultationsEnabled && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Actuellement: {settings.maxParallelSlots} créneaux parallèles actifs
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Slot Types by Act */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CalendarIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Types de créneaux par acte</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Définissez des durées personnalisées selon le type de consultation:
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Consultation standard"
                    secondary="15 minutes"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Consultation longue"
                    secondary="30 minutes"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Téléconsultation"
                    secondary="10 minutes"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>

              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                Configurer les types d'actes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Delay Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <NotifIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Alertes de retard automatiques</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Notifications automatiques aux patients en cas de retard:
              </Typography>

              <TextField
                fullWidth
                type="number"
                label="Seuil de retard (minutes)"
                value={delayThreshold}
                onChange={(e) => setDelayThreshold(parseInt(e.target.value))}
                inputProps={{ min: 5, max: 60 }}
                margin="normal"
                size="small"
                helperText="SMS/Push envoyés automatiquement si retard > seuil"
              />

              <Button
                variant="contained"
                onClick={handleEnableDelayNotifications}
                fullWidth
                sx={{ mt: 2 }}
              >
                Activer les alertes retard
              </Button>

              {settings?.delayNotificationsEnabled && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Alertes activées: notification si retard &gt; {settings.delayThresholdMinutes} min
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Comparaison Doctolib vs MediCare
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📍 Lieux d'exercice
                    </Typography>
                    <Typography variant="body2">
                      Doctolib: 2 max
                      <br />
                      <strong>MediCare: ILLIMITÉ</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ⏱️ Créneaux parallèles
                    </Typography>
                    <Typography variant="body2">
                      Doctolib: 2 max
                      <br />
                      <strong>MediCare: 5 max</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🔔 Alertes retard
                    </Typography>
                    <Typography variant="body2">
                      Doctolib: Payant
                      <br />
                      <strong>MediCare: GRATUIT</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📅 Types d'actes
                    </Typography>
                    <Typography variant="body2">
                      Doctolib: Limité
                      <br />
                      <strong>MediCare: Illimité</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdvancedAgendaSettingsPage;
