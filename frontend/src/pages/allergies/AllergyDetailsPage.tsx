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
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as AllergyIcon,
  Delete as DeleteIcon,
  Science as TestIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  usePatientAllergies,
  useCreateAllergy,
  useRecordAllergyTest,
  useDeleteAllergy,
} from '../../hooks/useAllergyDetails';

const AllergyDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    allergenType: 'MEDICATION',
    allergenName: '',
    severity: 'MODERATE',
    status: 'ACTIVE',
    reactions: '',
    notes: '',
  });

  const { data: allergies, isLoading } = usePatientAllergies(selectedPatientId);
  const createMutation = useCreateAllergy();
  const deleteMutation = useDeleteAllergy();

  const handleSubmit = () => {
    if (!selectedPatientId) return;

    createMutation.mutate(
      {
        patientId: selectedPatientId,
        ...formData,
        reactions: formData.reactions.split(',').map((r) => r.trim()),
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            allergenType: 'MEDICATION',
            allergenName: '',
            severity: 'MODERATE',
            status: 'ACTIVE',
            reactions: '',
            notes: '',
          });
        },
      }
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'MILD':
        return 'success';
      case 'MODERATE':
        return 'warning';
      case 'SEVERE':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AllergyIcon color="error" sx={{ fontSize: 40 }} />
          Gestion Avancée des Allergies
          <Chip label="6 types vs 3 chez Doctolib" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Suivi détaillé des allergies avec tests cutanés, IgE spécifiques et désensibilisation
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sélection Patient
            </Typography>
            <TextField
              fullWidth
              label="ID Patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              margin="normal"
              placeholder="Entrez l'ID du patient"
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Nouveauté MediCare:</strong>
              <br />
              🔬 Tests cutanés
              <br />
              🧪 IgE spécifiques
              <br />
              💉 Suivi désensibilisation
              <br />
              📊 6 types d'allergènes
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Allergies Enregistrées</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                disabled={!selectedPatientId}
              >
                Ajouter
              </Button>
            </Box>

            {isLoading ? (
              <Typography>Chargement...</Typography>
            ) : allergies && allergies.length > 0 ? (
              <List>
                {allergies.map((allergy: any) => (
                  <ListItem
                    key={allergy.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => deleteMutation.mutate(allergy.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">{allergy.allergenName}</Typography>
                          {allergy.crossReactivity && <TestIcon fontSize="small" color="primary" />}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip label={allergy.allergenType} size="small" color="primary" />
                          <Chip
                            label={allergy.severity}
                            size="small"
                            color={getSeverityColor(allergy.severity) as any}
                          />
                          <Chip label={allergy.status} size="small" />
                          {allergy.desensitizationProtocol && (
                            <Chip label="Désensibilisation" size="small" color="info" />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                {selectedPatientId
                  ? 'Aucune allergie enregistrée'
                  : 'Sélectionnez un patient pour voir ses allergies'}
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Types d'allergènes supportés
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                  <Chip label="💊 Médicaments" color="primary" />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Chip label="🍴 Aliments" color="primary" />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Chip label="🌿 Environnement" color="primary" />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Chip label="🐝 Venins" color="primary" />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Chip label="🧪 Latex" color="primary" />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Chip label="❓ Autres" color="primary" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une allergie</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type d'allergène</InputLabel>
            <Select
              value={formData.allergenType}
              label="Type d'allergène"
              onChange={(e) => setFormData({ ...formData, allergenType: e.target.value })}
            >
              <MenuItem value="MEDICATION">Médicament</MenuItem>
              <MenuItem value="FOOD">Aliment</MenuItem>
              <MenuItem value="ENVIRONMENTAL">Environnemental</MenuItem>
              <MenuItem value="VENOM">Venin</MenuItem>
              <MenuItem value="LATEX">Latex</MenuItem>
              <MenuItem value="OTHER">Autre</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Nom de l'allergène"
            value={formData.allergenName}
            onChange={(e) => setFormData({ ...formData, allergenName: e.target.value })}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Sévérité</InputLabel>
            <Select
              value={formData.severity}
              label="Sévérité"
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            >
              <MenuItem value="MILD">Légère</MenuItem>
              <MenuItem value="MODERATE">Modérée</MenuItem>
              <MenuItem value="SEVERE">Sévère</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Réactions (séparées par virgule)"
            value={formData.reactions}
            onChange={(e) => setFormData({ ...formData, reactions: e.target.value })}
            placeholder="Ex: urticaire, œdème, dyspnée"
          />

          <TextField
            fullWidth
            margin="normal"
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.allergenName}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AllergyDetailsPage;
