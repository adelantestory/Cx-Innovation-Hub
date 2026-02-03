import { Card, CardContent, Typography, Avatar, Box, Chip } from '@mui/material';
import { useDrag } from 'react-dnd';
import { Task } from '../../../shared/types/task';

interface TaskCardProps {
  task: Task;
  isCurrentUserTask: boolean;
  index: number;
  onClick?: (task: Task) => void;
}

export default function TaskCard({ task, isCurrentUserTask, index, onClick }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { taskId: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (!isDragging && onClick) {
      onClick(task);
    }
  };

  return (
    <Card
      ref={drag}
      onClick={handleClick}
      sx={{
        mb: 2,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isCurrentUserTask ? 'primary.light' : 'background.paper',
        color: isCurrentUserTask ? 'primary.contrastText' : 'text.primary',
        '&:hover': {
          boxShadow: 3,
          transform: isDragging ? 'none' : 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent>
        <Typography
          variant="body1"
          component="div"
          fontWeight={isCurrentUserTask ? 600 : 400}
          gutterBottom
        >
          {task.title}
        </Typography>

        {task.assignee && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Avatar
              src={task.assignee.avatarUrl || undefined}
              alt={task.assignee.name}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="caption" color={isCurrentUserTask ? 'inherit' : 'text.secondary'}>
              {task.assignee.name}
            </Typography>
          </Box>
        )}

        {!task.assignee && (
          <Chip
            label="Unassigned"
            size="small"
            variant="outlined"
            sx={{ mt: 1, opacity: 0.7 }}
          />
        )}
      </CardContent>
    </Card>
  );
}
