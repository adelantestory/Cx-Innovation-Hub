import { useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { Container, Box, Typography, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import NavigationBar from '../components/NavigationBar';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import HelpButton from '../components/HelpButton';
import { useProjectTasks } from '../hooks/useProjectTasks';
import { useProject } from '../hooks/useProjects';
import { useUpdateTask } from '../hooks/useTasks';
import { useWebSocket } from '../hooks/useWebSocket';
import { TaskStatus, Task } from '../../../shared/types/task';
import { useQueryClient } from '@tanstack/react-query';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.ToDo, label: 'To Do', color: '#E3F2FD' },
  { status: TaskStatus.InProgress, label: 'In Progress', color: '#FFF3E0' },
  { status: TaskStatus.InReview, label: 'In Review', color: '#F3E5F5' },
  { status: TaskStatus.Done, label: 'Done', color: '#E8F5E9' },
];

interface ColumnProps {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  currentUserId: string | null;
  onDrop: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
  onTaskClick: (task: Task) => void;
}

function Column({ status, label, color, tasks, currentUserId, onDrop, onTaskClick }: ColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { taskId: string }, monitor) => {
      if (!monitor.didDrop()) {
        // Calculate drop index (append to end by default)
        const newIndex = tasks.length;
        onDrop(item.taskId, status, newIndex);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <Paper
      ref={drop}
      elevation={2}
      sx={{
        p: 2,
        backgroundColor: isOver ? '#c5e1a5' : color,
        minHeight: '70vh',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        {label}
        <Typography component="span" variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
          ({tasks.length})
        </Typography>
      </Typography>

      <Box sx={{ mt: 2 }}>
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isCurrentUserTask={task.assignedTo === currentUserId}
            index={index}
            onClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No tasks
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function KanbanBoardContent() {
  const { id: projectId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId || '');
  const { data: tasks, isLoading, error } = useProjectTasks(projectId || '');
  const updateTaskMutation = useUpdateTask(projectId || '');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUserId = localStorage.getItem('currentUserId');

  // Handle WebSocket task updates
  const handleTaskUpdated = useCallback(
    (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    [queryClient, projectId]
  );

  useWebSocket(projectId, handleTaskUpdated);

  const handleDrop = useCallback(
    (taskId: string, newStatus: TaskStatus, newIndex: number) => {
      updateTaskMutation.mutate({
        taskId,
        status: newStatus,
        orderIndex: newIndex,
      });
    },
    [updateTaskMutation]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleAssignTask = useCallback(
    (taskId: string, assignedTo: string | null) => {
      updateTaskMutation.mutate({
        taskId,
        assignedTo,
      });
    },
    [updateTaskMutation]
  );

  if (isLoading) {
    return (
      <>
        <NavigationBar title="Loading..." />
        <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavigationBar title="Error" />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Alert severity="error">
            Failed to load tasks. Please make sure the backend server is running.
          </Alert>
        </Container>
      </>
    );
  }

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    [TaskStatus.ToDo]: [],
    [TaskStatus.InProgress]: [],
    [TaskStatus.InReview]: [],
    [TaskStatus.Done]: [],
  };

  tasks?.forEach((task) => {
    tasksByStatus[task.status]?.push(task);
  });

  return (
    <>
      <NavigationBar title={project?.name || 'Kanban Board'} />
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {COLUMNS.map((column) => (
            <Grid item xs={12} sm={6} md={3} key={column.status}>
              <Column
                status={column.status}
                label={column.label}
                color={column.color}
                tasks={tasksByStatus[column.status] || []}
                currentUserId={currentUserId}
                onDrop={handleDrop}
                onTaskClick={handleTaskClick}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      <TaskDetailModal
        task={selectedTask}
        open={isModalOpen}
        onClose={handleCloseModal}
        onAssignTask={handleAssignTask}
      />

      <HelpButton screenContext="kanban_board" />
    </>
  );
}

export default function KanbanBoard() {
  return (
    <DndProvider backend={HTML5Backend}>
      <KanbanBoardContent />
    </DndProvider>
  );
}
