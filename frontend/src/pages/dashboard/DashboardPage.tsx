import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MediCare Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Patients
              </Typography>
              <Typography component="p" variant="h4">
                0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Rendez-vous
              </Typography>
              <Typography component="p" variant="h4">
                0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Praticiens
              </Typography>
              <Typography component="p" variant="h4">
                0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Consultations
              </Typography>
              <Typography component="p" variant="h4">
                0
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bienvenue sur MediCare
            </Typography>
            <Typography>
              Cette plateforme SaaS vous permet de gérer votre cabinet médical de manière
              complète et efficace. Gérez vos rendez-vous, patients, consultations et bien
              plus encore.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default DashboardPage;
