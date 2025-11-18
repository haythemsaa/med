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
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as ProtocolIcon,
  Delete as DeleteIcon,
  CheckCircle as ValidateIcon,
  Pause as SuspendIcon,
  Done as CompleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useCabinetProtocols,
  useCreateProtocol,
  useValidateProtocol,
  useCompleteProtocol,
  useSuspendProtocol,
  useDeleteProtocol,
  useProtocolStatistics,
} from '../../hooks/useCareProtocols';

const CareProtocolsPage: React.FC = () => {
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    name: '',
    description: '',
    objectives: '',
    steps: '',
  });

  const { data: protocols, isLoading } = useCabinetProtocols(cabinetId);
  const { data: stats } = useProtocolStatistics(cabinetId);
  const createMutation = useCreateProtocol();
  const validateMutation = useValidateProtocol();
  const completeMutation = useCompleteProtocol();
  const suspendMutation = useSuspendProtocol();
  const deleteMutation = useDeleteProtocol();

  const handleSubmit = () => {
    if (!cabinetId) return;

    createMutation.mutate(
      {
        cabinetId,
        patientId: formData.patientId,
        name: formData.name,
        description: formData.description,
        objectives: formData.objectives.split('\n').filter((o) => o.trim()),
        steps: formData.steps.split('\n').map((s, idx) => ({
          order: idx + 1,
          description: s.trim(),
          completed: false,
        })),
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            patientId: '',
            name: '',
            description: '',
            objectives: '',
            steps: '',
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'primary';
      case 'SUSPENDED':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ProtocolIcon color="primary" sx={{ fontSize: 40 }} />
          Protocoles de Soins Partagés
          <Chip label="Coordination équipe médicale" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Protocoles de soins collaboratifs pour patients chroniques et complexes
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Protocoles actifs
              </Typography>
              <Typography variant="h4">{stats?.activeProtocols || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Taux de complétion
              </Typography>
              <Typography variant="h4">{stats?.completionRate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Patients suivis
              </Typography>
              <Typography variant="h4">{stats?.totalPatients || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Protocoles terminés
              </Typography>
              <Typography variant="h4">{stats?.completedProtocols || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Protocoles ({protocols?.length || 0})</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Nouveau protocole
              </Button>
            </Box>

            {isLoading ? (
              <LinearProgress />
            ) : protocols && protocols.length > 0 ? (
              <Grid container spacing={2}>
                {protocols.map((protocol: any) => (
                  <Grid item xs={12} md={6} key={protocol.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">{protocol.name}</Typography>
                          <IconButton size="small" onClick={() => deleteMutation.mutate(protocol.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Chip
                          label={protocol.status}
                          size="small"
                          color={getStatusColor(protocol.status) as any}
                          sx={{ mb: 2 }}
                        />

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {protocol.description}
                        </Typography>

                        {protocol.steps && protocol.steps.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Progression:
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (protocol.steps.filter((s: any) => s.completed).length /
                                  protocol.steps.length) *
                                100
                              }
                              sx={{ mt: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {protocol.steps.filter((s: any) => s.completed).length} /{' '}
                              {protocol.steps.length} étapes
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          {protocol.status === 'DRAFT' && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ValidateIcon />}
                              onClick={() =>
                                validateMutation.mutate({
                                  id: protocol.id,
                                  validatorId: user?.id || '',
                                })
                              }
                              fullWidth
                            >
                              Valider
                            </Button>
                          )}

                          {protocol.status === 'ACTIVE' && (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<SuspendIcon />}
                                onClick={() => suspendMutation.mutate(protocol.id)}
                                fullWidth
                              >
                                Suspendre
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CompleteIcon />}
                                onClick={() => completeMutation.mutate(protocol.id)}
                                fullWidth
                              >
                                Terminer
                              </Button>
                            </>
                          )}

                          {protocol.status === 'COMPLETED' && (
                            <Alert severity="success" sx={{ width: '100%' }}>
                              Protocole terminé avec succès
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
                Aucun protocole créé. Créez votre premier protocole de soins partagé!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Avantages des protocoles partagés
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Coordination équipe médicale
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Suivi structuré étape par étape
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Validation multi-praticiens
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Traçabilité complète
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer un protocole de soins</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="ID Patient"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Nom du protocole"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Suivi diabète type 2"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Objectifs (un par ligne)"
            multiline
            rows={3}
            value={formData.objectives}
            onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
            placeholder="HbA1c < 7%&#10;Perte de poids 5kg&#10;Activité physique 3x/semaine"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Étapes du protocole (une par ligne)"
            multiline
            rows={4}
            value={formData.steps}
            onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
            placeholder="Bilan initial complet&#10;Mise en place régime&#10;Consultation diététique&#10;Contrôle à 3 mois"
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Le protocole sera créé en brouillon. Vous pourrez le valider et activer après révision.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.patientId || !formData.name}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CareProtocolsPage;
