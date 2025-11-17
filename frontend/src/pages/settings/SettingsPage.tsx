import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useCabinet, useUpdateCabinet } from '../../hooks/useCabinets';
import { useAuth } from '../../contexts/AuthContext';

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

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: cabinet, isLoading } = useCabinet(user?.cabinetId || '');
  const updateCabinet = useUpdateCabinet();

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
  });

  React.useEffect(() => {
    if (cabinet) {
      setFormData({
        name: cabinet.name || '',
        type: cabinet.type || '',
        address: cabinet.address || '',
        city: cabinet.city || '',
        postalCode: cabinet.postalCode || '',
        country: cabinet.country || '',
        phone: cabinet.phone || '',
        email: cabinet.email || '',
      });
    }
  }, [cabinet]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async () => {
    if (user?.cabinetId) {
      await updateCabinet.mutateAsync({
        id: user.cabinetId,
        data: formData,
      });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={3}>
        Param\u00e8tres
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Informations du cabinet" />
          <Tab label="Utilisateurs" />
          <Tab label="Salles" />
          <Tab label="Facturation" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Informations g\u00e9n\u00e9rales
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom du cabinet"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Type"
                  value={formData.type}
                  onChange={handleInputChange('type')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  value={formData.address}
                  onChange={handleInputChange('address')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Ville"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Code postal"
                  value={formData.postalCode}
                  onChange={handleInputChange('postalCode')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pays"
                  value={formData.country}
                  onChange={handleInputChange('country')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="T\u00e9l\u00e9phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={updateCabinet.isPending}
                >
                  {updateCabinet.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Gestion des utilisateurs
            </Typography>
            <Typography color="textSecondary">
              Fonctionnalit\u00e9 \u00e0 venir...
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Gestion des salles
            </Typography>
            <Typography color="textSecondary">
              Fonctionnalit\u00e9 \u00e0 venir...
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={3}>
              Configuration de la facturation
            </Typography>
            <Typography color="textSecondary">
              Fonctionnalit\u00e9 \u00e0 venir...
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Container>
  );
};

export default SettingsPage;
