import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '../services/tasksApi';
import { Task, TaskStatus } from '../../../shared/types/task';

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      status?: TaskStatus;
      assignedTo?: string | null;
      orderIndex?: number;
      title?: string;
      description?: string | null;
    }) => updateTask(data.taskId, { ...data }),

    onMutate: async (newData) => {
      // 1. Cancel outgoing refetches (prevent overwriting optimistic update)
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });

      // 2. Snapshot current data
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

      // 3. Optimistically update UI
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === newData.taskId
            ? {
                ...task,
                status: newData.status ?? task.status,
                assignedTo: newData.assignedTo !== undefined ? newData.assignedTo : task.assignedTo,
                orderIndex: newData.orderIndex ?? task.orderIndex,
                updatedAt: new Date().toISOString(),
              }
            : task
        );
      });

      return { previousTasks }; // Return context for rollback
    },

    onError: (err, newData, context) => {
      // 4. Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      console.error('Failed to move task:', err);
    },

    onSettled: () => {
      // 5. Refetch to sync with server (WebSocket event will also trigger update)
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });
}
