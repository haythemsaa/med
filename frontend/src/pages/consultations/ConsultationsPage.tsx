import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useConsultations } from '../../hooks/useConsultations';
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

const ConsultationsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const { data: allConsultations, isLoading: loadingAll } = useConsultations({
    cabinetId: user?.cabinetId,
    page: 1,
    limit: 20,
  });

  const { data: myConsultations, isLoading: loadingMy } = useConsultations({
    practitionerId: user?.role === 'PRACTITIONER' ? user?.id : undefined,
    page: 1,
    limit: 20,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderConsultationTable = (consultations: any[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Praticien</TableCell>
              <TableCell>Motif</TableCell>
              <TableCell>Diagnostic</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultations?.map((consultation: any) => (
              <TableRow key={consultation.id}>
                <TableCell>
                  {new Date(consultation.date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  {consultation.patient.firstName} {consultation.patient.lastName}
                </TableCell>
                <TableCell>
                  Dr. {consultation.practitioner.firstName} {consultation.practitioner.lastName}
                </TableCell>
                <TableCell>{consultation.reason}</TableCell>
                <TableCell>{consultation.diagnosis || '-'}</TableCell>
                <TableCell>
                  <Button size="small">Voir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Consultations</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nouvelle Consultation
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Toutes les consultations" />
          {user?.role === 'PRACTITIONER' && <Tab label="Mes consultations" />}
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderConsultationTable(allConsultations?.data || [], loadingAll)}
      </TabPanel>

      {user?.role === 'PRACTITIONER' && (
        <TabPanel value={tabValue} index={1}>
          {renderConsultationTable(myConsultations?.data || [], loadingMy)}
        </TabPanel>
      )}
    </Container>
  );
};

export default ConsultationsPage;
