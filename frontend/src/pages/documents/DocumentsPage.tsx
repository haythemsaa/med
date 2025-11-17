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
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useDocuments, useDownloadDocument } from '../../hooks/useDocuments';
import { useAuth } from '../../contexts/AuthContext';

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useDocuments({
    cabinetId: user?.cabinetId,
    page: 1,
    limit: 20,
  });
  const downloadDocument = useDownloadDocument();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, docId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(docId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handleDownload = (docId: string) => {
    downloadDocument.mutate(docId);
    handleMenuClose();
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: any = {
      MEDICAL_REPORT: 'Compte-rendu',
      PRESCRIPTION: 'Ordonnance',
      LAB_RESULT: 'R\u00e9sultat de labo',
      IMAGING: 'Imagerie',
      INVOICE: 'Facture',
      CONSENT_FORM: 'Consentement',
      OTHER: 'Autre',
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string): any => {
    const colors: any = {
      MEDICAL_REPORT: 'primary',
      PRESCRIPTION: 'success',
      LAB_RESULT: 'info',
      IMAGING: 'warning',
      INVOICE: 'error',
      CONSENT_FORM: 'secondary',
      OTHER: 'default',
    };
    return colors[type] || 'default';
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Documents</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          T\u00e9l\u00e9verser un document
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Taille</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.data?.map((document: any) => (
              <TableRow key={document.id}>
                <TableCell>{document.name}</TableCell>
                <TableCell>
                  <Chip
                    label={getDocumentTypeLabel(document.type)}
                    color={getDocumentTypeColor(document.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {document.patient.firstName} {document.patient.lastName}
                </TableCell>
                <TableCell>
                  {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>
                  {(document.fileSize / 1024).toFixed(2)} KB
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(document.id)}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, document.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedDoc && handleDownload(selectedDoc)}>
          T\u00e9l\u00e9charger
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>Voir</MenuItem>
        <MenuItem onClick={handleMenuClose}>Modifier</MenuItem>
        <MenuItem onClick={handleMenuClose}>Supprimer</MenuItem>
      </Menu>
    </Container>
  );
};

export default DocumentsPage;
