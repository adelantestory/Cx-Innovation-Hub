import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Button,
  Chip,
} from '@mui/material';
import { Edit, Delete, Check, Close } from '@mui/icons-material';
import { Comment } from '../../../shared/types/comment';

interface CommentListProps {
  comments: Comment[];
  currentUserId: string | null;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}

export default function CommentList({
  comments,
  currentUserId,
  onUpdate,
  onDelete,
}: CommentListProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      onUpdate(commentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  if (comments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
        No comments yet. Be the first to comment!
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {comments.map((comment) => {
        const isOwner = comment.authorId === currentUserId;
        const isEditing = editingCommentId === comment.id;

        return (
          <Box
            key={comment.id}
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'grey.50',
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            <Avatar
              src={comment.author?.avatarUrl || undefined}
              alt={comment.author?.name}
              sx={{ width: 32, height: 32, mt: 0.5 }}
            />
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {comment.author?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(comment.createdAt)}
                  </Typography>
                  {comment.editedAt && (
                    <Chip label="Edited" size="small" sx={{ height: 18, fontSize: '0.7rem' }} />
                  )}
                </Box>
                {isOwner && !isEditing && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(comment)}
                      sx={{ p: 0.5 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(comment.id)}
                      sx={{ p: 0.5 }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {isEditing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    autoFocus
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Check />}
                      onClick={() => handleSaveEdit(comment.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Close />}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
