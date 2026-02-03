import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import { Task, TaskStatus } from '../../../shared/types/task';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useTaskComments, useCreateComment, useUpdateComment, useDeleteComment } from '../hooks/useComments';

interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

// Hardcoded users matching seed data
const USERS: User[] = [
  { id: '1', name: 'Sarah Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Alex Chen', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Jordan Lee', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Taylor Kim', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Morgan Patel', avatarUrl: 'https://i.pravatar.cc/150?img=5' },
];

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onAssignTask: (taskId: string, assignedTo: string | null) => void;
}

export default function TaskDetailModal({
  task,
  open,
  onClose,
  onAssignTask,
}: TaskDetailModalProps) {
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    task?.assignedTo || ''
  );

  const currentUserId = localStorage.getItem('currentUserId');
  const currentUserName = localStorage.getItem('currentUserName');

  // Comments hooks
  const { data: comments = [] } = useTaskComments(task?.id || null);
  const createCommentMutation = useCreateComment(task?.id || '');
  const updateCommentMutation = useUpdateComment(task?.id || '');
  const deleteCommentMutation = useDeleteComment(task?.id || '');

  if (!task) return null;

  const handleAssign = () => {
    onAssignTask(task.id, selectedAssignee || null);
    onClose();
  };

  const handleCreateComment = (content: string) => {
    if (currentUserId) {
      createCommentMutation.mutate({
        taskId: task.id,
        authorId: currentUserId,
        content,
      });
    }
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    if (currentUserId) {
      updateCommentMutation.mutate({
        commentId,
        authorId: currentUserId,
        content,
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (currentUserId) {
      deleteCommentMutation.mutate({
        commentId,
        authorId: currentUserId,
      });
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.ToDo:
        return 'default';
      case TaskStatus.InProgress:
        return 'primary';
      case TaskStatus.InReview:
        return 'warning';
      case TaskStatus.Done:
        return 'success';
      default:
        return 'default';
    }
  };

  const assignedUser = USERS.find((u) => u.id === task.assignedTo);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Task Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Task Title */}
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>

          {/* Task Status */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={task.status}
                color={getStatusColor(task.status) as any}
                size="small"
              />
            </Box>
          </Box>

          {/* Task Description */}
          {task.description && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {task.description}
              </Typography>
            </Box>
          )}

          {/* Current Assignee */}
          {assignedUser && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Currently Assigned To
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar
                  src={assignedUser.avatarUrl}
                  alt={assignedUser.name}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="body2">{assignedUser.name}</Typography>
              </Box>
            </Box>
          )}

          {/* Assignment Dropdown */}
          <FormControl fullWidth>
            <InputLabel id="assignee-label">Assign To</InputLabel>
            <Select
              labelId="assignee-label"
              id="assignee-select"
              value={selectedAssignee}
              label="Assign To"
              onChange={(e) => setSelectedAssignee(e.target.value)}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {USERS.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      sx={{ width: 24, height: 24 }}
                    />
                    {user.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Task Metadata */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Last Updated: {new Date(task.updatedAt).toLocaleDateString()}
            </Typography>
          </Box>

          {/* Comments Section */}
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom>
              Comments ({comments.length})
            </Typography>

            <CommentForm
              currentUserName={currentUserName}
              onSubmit={handleCreateComment}
              disabled={createCommentMutation.isPending}
            />

            <Box sx={{ mt: 3 }}>
              <CommentList
                comments={comments}
                currentUserId={currentUserId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} variant="contained">
          Save Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
