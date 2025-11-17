import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  ScreenShare,
  Chat,
} from '@mui/icons-material';

const TeleconsultationRoomPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'medium' | 'poor'>('good');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Initialize WebRTC connection
    // This is a placeholder - integrate with actual video service (Twilio, Agora, Jitsi, etc.)
    initializeVideoCall();

    // Start duration timer
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Cleanup WebRTC connection
    };
  }, [sessionId]);

  const initializeVideoCall = async () => {
    // Placeholder for WebRTC initialization
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // Toggle video track
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // Toggle audio track
  };

  const endCall = () => {
    // End the call and redirect
    window.location.href = '/patient-portal';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good':
        return 'success';
      case 'medium':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Box display="flex" flexDirection="column" height="100%">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5">Téléconsultation</Typography>
            <Typography variant="body2" color="textSecondary">
              Session: {sessionId}
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Typography variant="h6">{formatDuration(duration)}</Typography>
            <Chip
              label={connectionQuality === 'good' ? 'Excellente qualité' : connectionQuality === 'medium' ? 'Qualité moyenne' : 'Mauvaise qualité'}
              color={getQualityColor(connectionQuality) as any}
              size="small"
            />
          </Box>
        </Box>

        {/* Video Grid */}
        <Grid container spacing={2} sx={{ flexGrow: 1, mb: 2 }}>
          {/* Remote video (practitioner) */}
          <Grid item xs={12} md={9}>
            <Paper
              sx={{
                height: '100%',
                bgcolor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {isConnected ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* This would be the remote video element */}
                  <Typography color="white">Vidéo du praticien</Typography>
                </Box>
              ) : (
                <Typography color="white">Connexion en cours...</Typography>
              )}

              {/* Remote user name overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                <Typography color="white">Dr. Praticien</Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Local video (patient) */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                height: '100%',
                bgcolor: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: 200,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: '#2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* This would be the local video element */}
                {isVideoOn ? (
                  <Typography color="white">Votre vidéo</Typography>
                ) : (
                  <Typography color="white">Caméra désactivée</Typography>
                )}
              </Box>

              {/* Local user name overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="white">
                  Vous
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Controls */}
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="center" gap={2}>
            <IconButton
              color={isVideoOn ? 'primary' : 'default'}
              onClick={toggleVideo}
              sx={{
                bgcolor: isVideoOn ? 'primary.main' : 'grey.700',
                color: 'white',
                '&:hover': {
                  bgcolor: isVideoOn ? 'primary.dark' : 'grey.800',
                },
              }}
            >
              {isVideoOn ? <Videocam /> : <VideocamOff />}
            </IconButton>

            <IconButton
              color={isAudioOn ? 'primary' : 'default'}
              onClick={toggleAudio}
              sx={{
                bgcolor: isAudioOn ? 'primary.main' : 'grey.700',
                color: 'white',
                '&:hover': {
                  bgcolor: isAudioOn ? 'primary.dark' : 'grey.800',
                },
              }}
            >
              {isAudioOn ? <Mic /> : <MicOff />}
            </IconButton>

            <IconButton
              sx={{
                bgcolor: 'grey.700',
                color: 'white',
                '&:hover': { bgcolor: 'grey.800' },
              }}
            >
              <ScreenShare />
            </IconButton>

            <IconButton
              sx={{
                bgcolor: 'grey.700',
                color: 'white',
                '&:hover': { bgcolor: 'grey.800' },
              }}
            >
              <Chat />
            </IconButton>

            <IconButton
              onClick={endCall}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                ml: 4,
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <CallEnd />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TeleconsultationRoomPage;
