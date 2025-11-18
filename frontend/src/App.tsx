import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import PractitionersPage from './pages/practitioners/PractitionersPage';
import ConsultationsPage from './pages/consultations/ConsultationsPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import SettingsPage from './pages/settings/SettingsPage';
import PatientPortalPage from './pages/patient-portal/PatientPortalPage';
import TeleconsultationRoomPage from './pages/teleconsultation/TeleconsultationRoomPage';
import PublicBookingPage from './pages/public/PublicBookingPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import MessagingPage from './pages/messaging/MessagingPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practitioners"
            element={
              <ProtectedRoute>
                <PractitionersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <ProtectedRoute>
                <ConsultationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_CABINET']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-portal"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientPortalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teleconsultation/room/:sessionId"
            element={
              <ProtectedRoute>
                <TeleconsultationRoomPage />
              </ProtectedRoute>
            }
          />
          <Route path="/book/:slug" element={<PublicBookingPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
