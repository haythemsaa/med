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
  FamilyRestroom as FamilyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  usePatientFamilyHistory,
  useCreateFamilyHistory,
  useDeleteFamilyHistory,
} from '../../hooks/useFamilyHistory';

const FamilyHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    relationship: 'PARENT',
    condition: '',
    ageAtDiagnosis: '',
    isDeceased: false,
    causeOfDeath: '',
    notes: '',
  });

  const { data: familyHistory, isLoading } = usePatientFamilyHistory(selectedPatientId);
  const createMutation = useCreateFamilyHistory();
  const deleteMutation = useDeleteFamilyHistory();

  const handleSubmit = () => {
    if (!selectedPatientId) return;

    createMutation.mutate(
      {
        patientId: selectedPatientId,
        ...formData,
        ageAtDiagnosis: formData.ageAtDiagnosis ? parseInt(formData.ageAtDiagnosis) : undefined,
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          setFormData({
            relationship: 'PARENT',
            condition: '',
            ageAtDiagnosis: '',
            isDeceased: false,
            causeOfDeath: '',
            notes: '',
          });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer cet antécédent familial ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FamilyIcon color="primary" sx={{ fontSize: 40 }} />
          Antécédents Familiaux Détaillés
          <Chip label="Meilleur que Doctolib" color="success" sx={{ ml: 2 }} />
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Arbre généalogique médical complet avec suivi détaillé des pathologies familiales
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
            <Alert severity="info" sx={{ mt: 2 }}>
              Fonctionnalité Premium Doctolib - Gratuite ici!
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Historique Familial</Typography>
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
            ) : familyHistory && familyHistory.length > 0 ? (
              <List>
                {familyHistory.map((item: any) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.condition}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip label={item.relationship} size="small" color="primary" />
                          {item.ageAtDiagnosis && (
                            <Chip label={`Âge: ${item.ageAtDiagnosis} ans`} size="small" />
                          )}
                          {item.isDeceased && <Chip label="Décédé(e)" size="small" color="error" />}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                {selectedPatientId
                  ? 'Aucun antécédent familial enregistré'
                  : 'Sélectionnez un patient pour voir son historique familial'}
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Avantages de notre système
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Arbre généalogique complet
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Âge au diagnostic
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Cause de décès
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un antécédent familial</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Lien de parenté</InputLabel>
            <Select
              value={formData.relationship}
              label="Lien de parenté"
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            >
              <MenuItem value="PARENT">Parent</MenuItem>
              <MenuItem value="GRANDPARENT">Grand-parent</MenuItem>
              <MenuItem value="SIBLING">Frère/Sœur</MenuItem>
              <MenuItem value="CHILD">Enfant</MenuItem>
              <MenuItem value="AUNT_UNCLE">Oncle/Tante</MenuItem>
              <MenuItem value="COUSIN">Cousin(e)</MenuItem>
              <MenuItem value="OTHER">Autre</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Pathologie"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Âge au diagnostic"
            type="number"
            value={formData.ageAtDiagnosis}
            onChange={(e) => setFormData({ ...formData, ageAtDiagnosis: e.target.value })}
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
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.condition}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FamilyHistoryPage;
