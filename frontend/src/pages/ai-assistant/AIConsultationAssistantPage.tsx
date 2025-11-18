import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  AutoAwesome as AIIcon,
  Description as DocumentIcon,
  Summarize as SummarizeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useConsultationRecordings,
  useStartRecording,
  useProcessRecording,
  useConsultationRecordingStatistics,
} from '../../hooks/useConsultationRecordings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AIConsultationAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const cabinetId = user?.cabinetId || '';

  const { data: recordings, isLoading: recordingsLoading } = useConsultationRecordings(cabinetId);
  const startRecordingMutation = useStartRecording();
  const processRecordingMutation = useProcessRecording();

  const { data: stats } = useConsultationRecordingStatistics(
    cabinetId,
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  );

  const handleStartRecording = () => {
    setRecording(true);
    // In production, integrate with actual audio recording API
    console.log('Recording started...');
  };

  const handleStopRecording = () => {
    setRecording(false);
    console.log('Recording stopped...');
    // In production, upload audio and call startRecordingMutation
  };

  const handleProcessRecording = (recordingId: string) => {
    processRecordingMutation.mutate(recordingId);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AIIcon color="primary" sx={{ fontSize: 40 }} />
          Assistant IA de Consultation
          <Chip
            label="Premium Doctolib: 79€/mois - ICI GRATUIT!"
            color="success"
            sx={{ ml: 2 }}
          />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Enregistrez vos consultations, générez automatiquement des synthèses et des courriers médicaux avec l'IA
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Enregistrements
              </Typography>
              <Typography variant="h4">{stats?.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Traités avec succès
              </Typography>
              <Typography variant="h4">{stats?.completed || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Taux de succès
              </Typography>
              <Typography variant="h4">{stats?.successRate || 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Temps moyen (sec)
              </Typography>
              <Typography variant="h4">{stats?.avgProcessingTimeSeconds || 0}s</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recording Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Enregistrement Audio
            </Typography>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                color={recording ? 'error' : 'primary'}
                onClick={recording ? handleStopRecording : handleStartRecording}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 3,
                  border: 3,
                  borderColor: recording ? 'error.main' : 'primary.main',
                }}
              >
                {recording ? <StopIcon sx={{ fontSize: 60 }} /> : <MicIcon sx={{ fontSize: 60 }} />}
              </IconButton>

              <Typography variant="h6" gutterBottom>
                {recording ? 'Enregistrement en cours...' : 'Prêt à enregistrer'}
              </Typography>

              {recording && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress />
                </Box>
              )}

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  L'IA va automatiquement:
                  <br />
                  • Transcrire la consultation
                  <br />
                  • Générer une synthèse
                  <br />
                  • Créer un courrier médical
                  <br />• Extraire les données cliniques
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>

        {/* Recordings List & Results */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '600px' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Enregistrements récents" />
              <Tab label="Fonctionnalités IA" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {recordingsLoading ? (
                <LinearProgress />
              ) : (
                <List>
                  {recordings?.slice(0, 10).map((recording: any) => (
                    <ListItem
                      key={recording.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {recording.status === 'PENDING' && (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AIIcon />}
                              onClick={() => handleProcessRecording(recording.id)}
                            >
                              Traiter
                            </Button>
                          )}
                          {recording.status === 'COMPLETED' && (
                            <>
                              <IconButton size="small">
                                <DocumentIcon />
                              </IconButton>
                              <IconButton size="small">
                                <DownloadIcon />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={`Consultation - ${new Date(recording.createdAt).toLocaleDateString('fr-FR')}`}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip
                              label={recording.status}
                              size="small"
                              color={
                                recording.status === 'COMPLETED'
                                  ? 'success'
                                  : recording.status === 'PROCESSING'
                                  ? 'info'
                                  : recording.status === 'FAILED'
                                  ? 'error'
                                  : 'default'
                              }
                            />
                            {recording.duration && (
                              <Typography variant="caption">{recording.duration}s</Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {(!recordings || recordings.length === 0) && (
                    <Alert severity="info">
                      Aucun enregistrement. Commencez par enregistrer une consultation!
                    </Alert>
                  )}
                </List>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🎙️ Transcription Automatique
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Conversion audio en texte via OpenAI Whisper. Précision médicale optimisée.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📝 Synthèse Intelligente
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Génération automatique de résumés structurés avec GPT-4.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📄 Courrier Médical
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Création automatique de courriers pour confrères.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🔍 Extraction Données
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Identification auto des antécédents, allergies, diagnostics.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="success">
                    <Typography variant="h6" gutterBottom>
                      🎉 Fonctionnalité Premium - GRATUITE
                    </Typography>
                    <Typography variant="body2">
                      Cette fonctionnalité coûte <strong>79€/mois chez Doctolib</strong>.
                      <br />
                      Chez MediCare, elle est <strong>100% GRATUITE</strong> pour tous!
                      <br />
                      <br />
                      Économie: <strong>948€/an</strong> par praticien 💰
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIConsultationAssistantPage;
