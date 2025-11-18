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
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Campaign as CampaignIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  BarChart as StatsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useCabinetCampaigns,
  useCreateCampaign,
  useSendCampaign,
  useDeleteCampaign,
} from '../../hooks/usePreventionCampaigns';

const PreventionCampaignsPage: React.FC = () => {
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    campaignType: 'VACCINATION',
    message: '',
    targetCriteria: '',
  });

  const { data: campaigns, isLoading } = useCabinetCampaigns(cabinetId);
  const createMutation = useCreateCampaign();
  const sendMutation = useSendCampaign();
  const deleteMutation = useDeleteCampaign();

  const handleSubmit = () => {
    if (!cabinetId) return;

    createMutation.mutate(
      {
        cabinetId,
        ...formData,
        targetCriteria: formData.targetCriteria ? JSON.parse(formData.targetCriteria) : {},
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            name: '',
            campaignType: 'VACCINATION',
            message: '',
            targetCriteria: '',
          });
        },
      }
    );
  };

  const getCampaignColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'SCHEDULED':
        return 'info';
      case 'SENDING':
        return 'warning';
      case 'SENT':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CampaignIcon color="primary" sx={{ fontSize: 40 }} />
          Campagnes de Prévention
          <Chip label="Communication ciblée automatique" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Envoi automatisé de rappels de vaccination, dépistages et prévention santé
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Campagnes ({campaigns?.length || 0})</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Nouvelle campagne
              </Button>
            </Box>

            {isLoading ? (
              <LinearProgress />
            ) : campaigns && campaigns.length > 0 ? (
              <Grid container spacing={2}>
                {campaigns.map((campaign: any) => (
                  <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">{campaign.name}</Typography>
                          <IconButton size="small" onClick={() => deleteMutation.mutate(campaign.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={campaign.campaignType}
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={getCampaignColor(campaign.status) as any}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {campaign.message.substring(0, 100)}
                          {campaign.message.length > 100 && '...'}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {campaign.status === 'DRAFT' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ScheduleIcon />}
                                fullWidth
                              >
                                Planifier
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<SendIcon />}
                                onClick={() => sendMutation.mutate(campaign.id)}
                                fullWidth
                              >
                                Envoyer
                              </Button>
                            </>
                          )}

                          {campaign.status === 'SENT' && (
                            <Button size="small" variant="outlined" startIcon={<StatsIcon />} fullWidth>
                              Statistiques
                            </Button>
                          )}
                        </Box>

                        {campaign.recipientCount > 0 && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            {campaign.recipientCount} destinataires ciblés
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                Aucune campagne créée. Créez votre première campagne de prévention!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Types de campagnes disponibles
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      💉 Vaccination
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rappels grippe, COVID, vaccins obligatoires
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🔬 Dépistage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cancer sein, colon, prostate, diabète
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📅 Suivi chronique
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Diabète, HTA, asthme, renouvellement
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
        <DialogTitle>Créer une campagne de prévention</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Nom de la campagne"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type de campagne</InputLabel>
            <Select
              value={formData.campaignType}
              label="Type de campagne"
              onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
            >
              <MenuItem value="VACCINATION">Vaccination</MenuItem>
              <MenuItem value="SCREENING">Dépistage</MenuItem>
              <MenuItem value="CHRONIC_FOLLOWUP">Suivi chronique</MenuItem>
              <MenuItem value="PREVENTION">Prévention générale</MenuItem>
              <MenuItem value="RECALL">Rappel consultation</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Message"
            multiline
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            helperText="Message envoyé par SMS/Email/Notification"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Critères de ciblage (JSON)"
            multiline
            rows={3}
            value={formData.targetCriteria}
            onChange={(e) => setFormData({ ...formData, targetCriteria: e.target.value })}
            placeholder='{"ageMin": 50, "ageMax": 75, "gender": "F"}'
            helperText="Définissez les critères de sélection des patients"
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Les destinataires seront automatiquement sélectionnés selon vos critères. Vous pourrez
            valider la liste avant envoi.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.message}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PreventionCampaignsPage;
