import React from 'react';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { usePatients } from '../../hooks/usePatients';
import { useAuth } from '../../contexts/AuthContext';

const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = usePatients(user?.cabinetId || '', 1, 20);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nouveau Patient
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Date de naissance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data?.map((patient: any) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>{patient.firstName}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.email || '-'}</TableCell>
                <TableCell>
                  {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  <Button size="small">Voir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PatientsPage;
