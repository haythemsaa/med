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
  List,
  ListItem,
  ListItemText,
  Alert,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Contacts as ContactsIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useCabinetContacts,
  useCreateContact,
  useShareContact,
  useDeleteContact,
} from '../../hooks/useProfessionalContacts';

const ProfessionalContactsPage: React.FC = () => {
  const { user } = useAuth();
  const cabinetId = user?.cabinetId || '';
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    contactType: 'DOCTOR',
    firstName: '',
    lastName: '',
    specialty: '',
    phone: '',
    email: '',
    address: '',
    rppsNumber: '',
    finess: '',
  });

  const { data: contacts, isLoading } = useCabinetContacts(cabinetId);
  const createMutation = useCreateContact();
  const deleteMutation = useDeleteContact();

  const handleSubmit = () => {
    if (!cabinetId) return;

    createMutation.mutate(
      {
        cabinetId,
        ...formData,
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            contactType: 'DOCTOR',
            firstName: '',
            lastName: '',
            specialty: '',
            phone: '',
            email: '',
            address: '',
            rppsNumber: '',
            finess: '',
          });
        },
      }
    );
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'DOCTOR':
        return '👨‍⚕️';
      case 'NURSE':
        return '👩‍⚕️';
      case 'PHARMACIST':
        return '💊';
      case 'HOSPITAL':
        return '🏥';
      case 'LAB':
        return '🔬';
      case 'SPECIALIST':
        return '🩺';
      default:
        return '📞';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ContactsIcon color="primary" sx={{ fontSize: 40 }} />
          Carnet d'Adresses Professionnel Partagé
          <Chip label="Partagé entre confrères" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Base de données collaborative de contacts professionnels de santé
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Contacts du Cabinet ({contacts?.length || 0})
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Ajouter un contact
              </Button>
            </Box>

            {isLoading ? (
              <Typography>Chargement...</Typography>
            ) : contacts && contacts.length > 0 ? (
              <Grid container spacing={2}>
                {contacts.map((contact: any) => (
                  <Grid item xs={12} md={6} lg={4} key={contact.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                            {getContactIcon(contact.contactType)}
                          </Avatar>
                          <Box>
                            <IconButton size="small">
                              <ShareIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteMutation.mutate(contact.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography variant="h6" gutterBottom>
                          {contact.firstName} {contact.lastName}
                        </Typography>

                        <Chip label={contact.contactType} size="small" color="primary" sx={{ mb: 1 }} />
                        {contact.specialty && (
                          <Chip label={contact.specialty} size="small" sx={{ mb: 1, ml: 1 }} />
                        )}

                        {contact.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{contact.phone}</Typography>
                          </Box>
                        )}

                        {contact.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{contact.email}</Typography>
                          </Box>
                        )}

                        {contact.rppsNumber && (
                          <Box sx={{ mt: 2 }}>
                            <Chip label={`RPPS: ${contact.rppsNumber}`} size="small" variant="outlined" />
                          </Box>
                        )}

                        {contact.isShared && (
                          <Chip label="Partagé" size="small" color="success" sx={{ mt: 1 }} />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                Aucun contact professionnel enregistré. Commencez à créer votre carnet d'adresses!
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Avantages du carnet partagé
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Partagé entre confrères du cabinet
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Numéros RPPS/ADELI/FINESS
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Recherche rapide par spécialité
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Notes collaboratives
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un contact professionnel</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type de contact</InputLabel>
                <Select
                  value={formData.contactType}
                  label="Type de contact"
                  onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                >
                  <MenuItem value="DOCTOR">Médecin</MenuItem>
                  <MenuItem value="NURSE">Infirmier(e)</MenuItem>
                  <MenuItem value="PHARMACIST">Pharmacien(ne)</MenuItem>
                  <MenuItem value="HOSPITAL">Hôpital/Clinique</MenuItem>
                  <MenuItem value="LAB">Laboratoire</MenuItem>
                  <MenuItem value="SPECIALIST">Spécialiste</MenuItem>
                  <MenuItem value="OTHER">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Spécialité"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Numéro RPPS"
                value={formData.rppsNumber}
                onChange={(e) => setFormData({ ...formData, rppsNumber: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="FINESS"
                value={formData.finess}
                onChange={(e) => setFormData({ ...formData, finess: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.firstName || !formData.lastName}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfessionalContactsPage;
