import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Yuklanmoqda...
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;