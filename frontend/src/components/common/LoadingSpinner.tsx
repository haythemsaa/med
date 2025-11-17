import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Chargement...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="400px"
      gap={2}
    >
      <CircularProgress />
      {message && (
        <Typography variant="body2" color="textSecondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
