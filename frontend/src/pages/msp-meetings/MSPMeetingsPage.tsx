import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  People as MeetingIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  PersonAdd as AddPersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useCabinetMeetings,
  useCreateMeeting,
  useStartMeeting,
  useCompleteMeeting,
  useDeleteMeeting,
} from '../../hooks/useMSPMeetings';

const MSPMeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    meetingType: 'MSP_COORDINATION',
    scheduledDate: '',
    location: '',
    agenda: '',
  });

  const { data: meetings, isLoading } = useCabinetMeetings(cabinetId);
  const createMutation = useCreateMeeting();
  const startMutation = useStartMeeting();
  const completeMutation = useCompleteMeeting();
  const deleteMutation = useDeleteMeeting();

  const handleSubmit = () => {
    if (!cabinetId) return;

    createMutation.mutate(
      {
        cabinetId,
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            title: '',
            meetingType: 'MSP_COORDINATION',
            scheduledDate: '',
            location: '',
            agenda: '',
          });
        },
      }
    );
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'info';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      MSP_COORDINATION: 'Réunion MSP',
      RCP: 'RCP (Réunion de Concertation Pluridisciplinaire)',
      CLINICAL_CASE: 'Cas clinique',
      STAFF_MEETING: 'Réunion équipe',
      TRAINING: 'Formation',
    };
    return labels[type] || type;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MeetingIcon color="primary" sx={{ fontSize: 40 }} />
          Réunions MSP & RCP
          <Chip label="Coordination pluridisciplinaire" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Organisation et suivi des réunions de coordination, RCP et cas cliniques
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Réunions planifiées ({meetings?.length || 0})</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Nouvelle réunion
              </Button>
            </Box>

            {isLoading ? (
              <Typography>Chargement...</Typography>
            ) : meetings && meetings.length > 0 ? (
              <Grid container spacing={2}>
                {meetings.map((meeting: any) => (
                  <Grid item xs={12} md={6} key={meeting.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">{meeting.title}</Typography>
                          <IconButton size="small" onClick={() => deleteMutation.mutate(meeting.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={getMeetingTypeLabel(meeting.meetingType)}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={meeting.status}
                            size="small"
                            color={getMeetingStatusColor(meeting.status) as any}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📅 {new Date(meeting.scheduledDate).toLocaleString('fr-FR')}
                        </Typography>

                        {meeting.location && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            📍 {meeting.location}
                          </Typography>
                        )}

                        {meeting.participants && meeting.participants.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Participants:
                            </Typography>
                            <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', mt: 1 }}>
                              {meeting.participants.map((p: any, idx: number) => (
                                <Avatar key={idx} sx={{ width: 32, height: 32 }}>
                                  {p.user?.firstName?.[0]}
                                  {p.user?.lastName?.[0]}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          {meeting.status === 'SCHEDULED' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddPersonIcon />}
                                fullWidth
                              >
                                Participants
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<StartIcon />}
                                onClick={() => startMutation.mutate(meeting.id)}
                                fullWidth
                              >
                                Démarrer
                              </Button>
                            </>
                          )}

                          {meeting.status === 'IN_PROGRESS' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CompleteIcon />}
                              onClick={() =>
                                completeMutation.mutate({
                                  id: meeting.id,
                                  data: { minutes: '', decisions: [] },
                                })
                              }
                              fullWidth
                            >
                              Terminer
                            </Button>
                          )}

                          {meeting.status === 'COMPLETED' && (
                            <Alert severity="success" sx={{ width: '100%' }}>
                              Réunion terminée - Compte-rendu disponible
                            </Alert>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                Aucune réunion planifiée. Créez votre première réunion MSP ou RCP!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Types de réunions supportés
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🏥 MSP Coordination
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Coordination entre professionnels de santé
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      👥 RCP
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Réunion de Concertation Pluridisciplinaire
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📚 Formation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sessions de formation continue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer une nouvelle réunion</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Titre de la réunion"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type de réunion</InputLabel>
            <Select
              value={formData.meetingType}
              label="Type de réunion"
              onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
            >
              <MenuItem value="MSP_COORDINATION">Réunion MSP</MenuItem>
              <MenuItem value="RCP">RCP</MenuItem>
              <MenuItem value="CLINICAL_CASE">Cas clinique</MenuItem>
              <MenuItem value="STAFF_MEETING">Réunion équipe</MenuItem>
              <MenuItem value="TRAINING">Formation</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Date et heure"
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Lieu"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Ordre du jour"
            multiline
            rows={4}
            value={formData.agenda}
            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Vous pourrez ajouter les participants après la création de la réunion.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.scheduledDate}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MSPMeetingsPage;
