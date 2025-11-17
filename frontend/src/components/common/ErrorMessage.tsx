import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Erreur',
  message,
  severity = 'error',
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
