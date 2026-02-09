import { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Close, Send, AutoAwesome, Delete } from '@mui/icons-material';
import { useSessionMessages, useSendMessage, useGetContextHelp, useClearSession } from '../hooks/useHelp';
import { HelpMessage } from '../../../shared/types/comment';

interface HelpPanelProps {
  open: boolean;
  onClose: () => void;
  screenContext?: string;
}

export default function HelpPanel({ open, onClose, screenContext }: HelpPanelProps) {
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = localStorage.getItem('currentUserId');

  const { data: messages = [], isLoading } = useSessionMessages(open ? sessionId : null);
  const sendMessageMutation = useSendMessage(sessionId);
  const getContextHelpMutation = useGetContextHelp(sessionId);
  const clearSessionMutation = useClearSession();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentUserId) return;

    sendMessageMutation.mutate({
      sessionId,
      userId: currentUserId,
      content: inputMessage,
      screenContext,
    });

    setInputMessage('');
  };

  const handleGetContextHelp = () => {
    if (!screenContext) return;

    getContextHelpMutation.mutate({
      sessionId,
      screenContext,
    });
  };

  const handleClearChat = () => {
    clearSessionMutation.mutate(sessionId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <AutoAwesome fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6">AI Assistant</Typography>
              <Typography variant="caption" color="text.secondary">
                Ask me anything about Taskify
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Context Actions */}
        {screenContext && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Button
              size="small"
              startIcon={<AutoAwesome />}
              onClick={handleGetContextHelp}
              disabled={getContextHelpMutation.isPending}
              fullWidth
            >
              Get help with this page
            </Button>
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && messages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AutoAwesome sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Hi! I&apos;m your AI assistant. Ask me anything about managing your tasks and projects.
              </Typography>
            </Box>
          )}

          {messages.map((message: HelpMessage) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 0.5 }}>
                  {formatTime(message.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))}

          {(sendMessageMutation.isPending || getContextHelpMutation.isPending) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                AI is thinking...
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {messages.length > 0 && (
            <Button
              size="small"
              startIcon={<Delete />}
              onClick={handleClearChat}
              sx={{ mb: 1 }}
              fullWidth
              variant="outlined"
            >
              Clear Chat
            </Button>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              size="small"
              multiline
              maxRows={3}
              fullWidth
              disabled={sendMessageMutation.isPending}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              sx={{ minWidth: 48 }}
            >
              <Send />
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
