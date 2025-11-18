import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Patients: undefined;
  Appointments: undefined;
  AIAssistant: undefined;
  More: undefined;
};

// Patient Stack
export type PatientStackParamList = {
  PatientList: undefined;
  PatientDetails: { patientId: string };
  PatientCreate: undefined;
  FamilyHistory: { patientId: string };
  Allergies: { patientId: string };
};

// Appointment Stack
export type AppointmentStackParamList = {
  AppointmentList: undefined;
  AppointmentDetails: { appointmentId: string };
  AppointmentCreate: undefined;
  AppointmentCalendar: undefined;
};

// AI Assistant Stack
export type AIStackParamList = {
  AIConsultation: undefined;
  AIRecordings: undefined;
  AIStatistics: undefined;
};

// More/Settings Stack
export type MoreStackParamList = {
  MoreMenu: undefined;
  Profile: undefined;
  Settings: undefined;
  ProfessionalContacts: undefined;
  PreventionCampaigns: undefined;
  MSPMeetings: undefined;
  CareProtocols: undefined;
  AdvancedAgenda: undefined;
  PatientMessaging: undefined;
  Analytics: undefined;
  About: undefined;
};

// Root Stack (includes Auth + Main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Teleconsultation: { sessionId: string };
  Consultation: { consultationId: string };
  Document: { documentId: string };
};

export type NavigationProps = any; // To be typed properly with navigation hooks
