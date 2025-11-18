import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  Message as MessageIcon,
  Link as LinkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useSendMessageNoAccount,
  useMessagesNoAccount,
} from '../../hooks/usePatientMessagingNoAccount';

const PatientMessagingNoAccountPage: React.FC = () => {
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    patientPhone: '',
    patientEmail: '',
    subject: '',
    message: '',
    deliveryMethod: 'SMS',
  });

  const { data: messages, isLoading } = useMessagesNoAccount(cabinetId);
  const sendMutation = useSendMessageNoAccount();

  const handleSubmit = () => {
    if (!cabinetId) return;

    sendMutation.mutate(
      {
        cabinetId,
        senderId: user?.id || '',
        ...formData,
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            patientPhone: '',
            patientEmail: '',
            subject: '',
            message: '',
            deliveryMethod: 'SMS',
          });
        },
      }
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MessageIcon color="primary" sx={{ fontSize: 40 }} />
          Messagerie Patients Sans Compte
          <Chip label="Communication sécurisée simplifiée" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Envoyez des messages sécurisés aux patients n'ayant pas de compte MediCare
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SendIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">Nouveau message</Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setOpenDialog(true)}
                fullWidth
                size="large"
              >
                Envoyer un message
              </Button>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Fonctionnement:</strong>
                </Typography>
                <Typography variant="body2">
                  1. Envoi SMS/Email au patient
                  <br />
                  2. Lien sécurisé 14 jours
                  <br />
                  3. Accès sans création de compte
                  <br />
                  4. Lecture sécurisée du message
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Messages envoyés ({messages?.length || 0})
            </Typography>

            {isLoading ? (
              <Typography>Chargement...</Typography>
            ) : messages && messages.length > 0 ? (
              <List>
                {messages.map((msg: any) => (
                  <ListItem key={msg.id}>
                    <ListItemText
                      primary={msg.subject}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip label={msg.deliveryMethod} size="small" color="primary" />
                            <Chip
                              label={msg.accessedAt ? 'Lu' : 'Non lu'}
                              size="small"
                              color={msg.accessedAt ? 'success' : 'default'}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Envoyé le {new Date(msg.createdAt).toLocaleString('fr-FR')}
                          </Typography>
                          {msg.accessedAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              Lu le {new Date(msg.accessedAt).toLocaleString('fr-FR')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">Aucun message envoyé pour le moment</Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Avantages de la messagerie sans compte
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      🔐 Sécurité
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lien unique à usage limité, conforme RGPD
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ⏱️ Simplicité
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pas de création de compte requise
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📱 Multi-canal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      SMS, Email ou Notification push
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      📊 Suivi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accusé de lecture automatique
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Send Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envoyer un message sécurisé</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Le patient recevra un lien sécurisé valable 14 jours pour lire le message
          </Alert>

          <TextField
            fullWidth
            margin="normal"
            label="Téléphone du patient"
            value={formData.patientPhone}
            onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
            placeholder="+33612345678"
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email du patient"
            type="email"
            value={formData.patientEmail}
            onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
            placeholder="patient@email.com"
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Sujet"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            placeholder="Ex: Résultats d'analyses, Ordonnance..."
          />

          <TextField
            fullWidth
            margin="normal"
            label="Message"
            multiline
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            placeholder="Votre message sécurisé au patient..."
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon fontSize="small" />
              <Typography variant="body2">
                Un lien d'accès unique sera généré et envoyé au patient
              </Typography>
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!formData.subject || !formData.message || (!formData.patientPhone && !formData.patientEmail)}
          >
            Envoyer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientMessagingNoAccountPage;
