import { useState } from 'react';
import { Box, TextField, Button, Avatar } from '@mui/material';
import { Send } from '@mui/icons-material';

interface CommentFormProps {
  currentUserName: string | null;
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export default function CommentForm({
  currentUserName,
  onSubmit,
  disabled = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  // Get user avatar URL from localStorage or use a placeholder
  const currentUserId = localStorage.getItem('currentUserId');
  const avatarUrl = currentUserId
    ? `https://i.pravatar.cc/150?img=${currentUserId}`
    : undefined;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
      <Avatar
        src={avatarUrl}
        alt={currentUserName || 'User'}
        sx={{ width: 32, height: 32, mt: 1 }}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add a comment... (Ctrl+Enter to submit)"
          multiline
          rows={2}
          fullWidth
          size="small"
          disabled={disabled}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="small"
            endIcon={<Send />}
            onClick={handleSubmit}
            disabled={!content.trim() || disabled}
          >
            Comment
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
