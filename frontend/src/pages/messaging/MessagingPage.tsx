import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Badge,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  Send as SentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import {
  useInbox,
  useSentMessages,
  useThread,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
} from '../../hooks/useMessaging';

const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'inbox' | 'sent'>('inbox');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Assume cabinetId comes from user context or props
  const cabinetId = user?.cabinetId || '';
  const userId = user?.id || '';

  const { data: inbox, isLoading: inboxLoading } = useInbox(userId, cabinetId);
  const { data: sent, isLoading: sentLoading } = useSentMessages(userId, cabinetId);
  const { data: unreadCount } = useUnreadCount(userId, cabinetId);
  const { data: thread } = useThread(selectedThread || '');

  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  const messages = view === 'inbox' ? inbox : sent;

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedThread) return;

    sendMessage.mutate({
      cabinetId,
      senderId: userId,
      recipientId: 'recipient-id', // Should come from selected thread
      content: messageContent,
      threadId: selectedThread,
    });

    setMessageContent('');
  };

  const handleSelectMessage = (messageId: string, threadId: string) => {
    setSelectedThread(threadId);
    markAsRead.mutate(messageId);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Messagerie Sécurisée
      </Typography>

      <Grid container spacing={3}>
        {/* Messages List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '700px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher des messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>

            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Button
                variant={view === 'inbox' ? 'contained' : 'outlined'}
                startIcon={
                  <Badge badgeContent={unreadCount} color="error">
                    <InboxIcon />
                  </Badge>
                }
                onClick={() => setView('inbox')}
                fullWidth
              >
                Reçus
              </Button>
              <Button
                variant={view === 'sent' ? 'contained' : 'outlined'}
                startIcon={<SentIcon />}
                onClick={() => setView('sent')}
                fullWidth
              >
                Envoyés
              </Button>
            </Box>

            <Divider />

            <List sx={{ flex: 1, overflow: 'auto' }}>
              {messages?.map((message: any) => (
                <ListItem
                  key={message.id}
                  button
                  selected={selectedThread === message.threadId}
                  onClick={() => handleSelectMessage(message.id, message.threadId)}
                >
                  <ListItemAvatar>
                    <Avatar>{message.sender?.firstName?.[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {message.subject || 'Sans objet'}
                        </Typography>
                        {message.isUrgent && (
                          <Chip
                            label="Urgent"
                            color="error"
                            size="small"
                            icon={<WarningIcon />}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" noWrap>
                          {message.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.createdAt).toLocaleString('fr-FR')}
                        </Typography>
                      </>
                    }
                  />
                  {message.status === 'SENT' && (
                    <Badge color="primary" variant="dot" />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Message Thread */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '700px', display: 'flex', flexDirection: 'column' }}>
            {selectedThread ? (
              <>
                <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                  {thread?.map((msg: any) => (
                    <Box
                      key={msg.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        bgcolor:
                          msg.senderId === userId
                            ? 'primary.light'
                            : 'grey.100',
                        ml: msg.senderId === userId ? 'auto' : 0,
                        mr: msg.senderId === userId ? 0 : 'auto',
                        maxWidth: '70%',
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.createdAt).toLocaleString('fr-FR')}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Écrivez votre message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim()}
                  >
                    Envoyer
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Sélectionnez une conversation
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MessagingPage;
