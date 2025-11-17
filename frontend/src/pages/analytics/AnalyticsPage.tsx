import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  People,
  Event,
  AttachMoney,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useDashboardStats,
  useForecastRevenue,
  usePatientEngagement,
  useChurnRiskPatients,
} from '../../hooks/useAnalytics';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats } = useDashboardStats(user?.cabinetId || '');
  const { data: forecast, isLoading: loadingForecast } = useForecastRevenue(user?.cabinetId || '');
  const { data: engagement, isLoading: loadingEngagement } = usePatientEngagement(user?.cabinetId || '');
  const { data: churnRisk, isLoading: loadingChurn } = useChurnRiskPatients(user?.cabinetId || '');

  if (loadingStats || loadingForecast || loadingEngagement) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getTrendIcon = (value: number) => {
    if (value > 5) return <TrendingUp color="success" />;
    if (value < -5) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" mb={4}>
        Analytics & Intelligence Artificielle
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Event color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Rendez-vous ce mois
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.thisMonth?.appointments || 0}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {getTrendIcon(stats?.growth?.appointments || 0)}
                <Typography
                  variant="body2"
                  sx={{ ml: 0.5, color: getTrendColor(stats?.growth?.appointments || 0) }}
                >
                  {stats?.growth?.appointments > 0 ? '+' : ''}
                  {stats?.growth?.appointments?.toFixed(1)}% vs mois dernier
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <People color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Nouveaux patients
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.thisMonth?.newPatients || 0}</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Total: {stats?.totals?.patients || 0} patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoney color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Revenus ce mois
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.thisMonth?.revenue?.toFixed(0) || 0} TND</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {getTrendIcon(stats?.growth?.revenue || 0)}
                <Typography
                  variant="body2"
                  sx={{ ml: 0.5, color: getTrendColor(stats?.growth?.revenue || 0) }}
                >
                  {stats?.growth?.revenue > 0 ? '+' : ''}
                  {stats?.growth?.revenue?.toFixed(1)}% vs mois dernier
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="body2">
                  Taux de no-show
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.thisMonth?.noShowRate?.toFixed(1) || 0}%</Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {stats?.thisMonth?.noShowAppointments || 0} no-shows ce mois
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Predictions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={3}>
                🤖 Prévision de Revenus (IA)
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h3">
                    {forecast?.forecast?.toFixed(0) || 0} TND
                  </Typography>
                  <Chip
                    label={
                      forecast?.trend === 'up'
                        ? 'Tendance haussière'
                        : forecast?.trend === 'down'
                        ? 'Tendance baissière'
                        : 'Stable'
                    }
                    color={
                      forecast?.trend === 'up'
                        ? 'success'
                        : forecast?.trend === 'down'
                        ? 'error'
                        : 'default'
                    }
                  />
                </Box>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  Prévision pour le mois prochain basée sur l'analyse des 6 derniers mois
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Confiance de prédiction</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {((forecast?.confidence || 0) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(forecast?.confidence || 0) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={3}>
                📊 Engagement Patients
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={3}>
                  <Typography variant="h3">{engagement?.engagementScore || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    /100
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5">{engagement?.activePatients || 0}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Patients actifs (30j)
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5">{engagement?.patientsWithUpcoming || 0}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        RDV à venir
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Taux d'activité</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {engagement?.activeRate || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(engagement?.activeRate || '0')}
                    color="success"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Churn Risk Patients */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={3}>
            ⚠️ Patients à Risque de Départ (Churn Risk)
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Patients n'ayant pas eu de rendez-vous depuis plus de 90 jours
          </Typography>

          {!loadingChurn && churnRisk && churnRisk.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Téléphone</TableCell>
                    <TableCell align="right">Dernier RDV</TableCell>
                    <TableCell align="right">Jours écoulés</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {churnRisk.slice(0, 10).map((patient: any) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        {patient.firstName} {patient.lastName}
                      </TableCell>
                      <TableCell>{patient.email || '-'}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell align="right">
                        {patient.lastAppointment
                          ? new Date(patient.lastAppointment).toLocaleDateString('fr-FR')
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${patient.daysSinceLastVisit} jours`}
                          color={
                            patient.daysSinceLastVisit > 180
                              ? 'error'
                              : patient.daysSinceLastVisit > 120
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="textSecondary" textAlign="center" py={3}>
              Aucun patient à risque identifié
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AnalyticsPage;
