import api from './api';
import { Task, TaskStatus } from '../../../shared/types/task';

export async function getTask(taskId: string): Promise<Task> {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data.task;
}

export async function updateTask(
  taskId: string,
  data: {
    status?: TaskStatus;
    assignedTo?: string | null;
    orderIndex?: number;
    title?: string;
    description?: string | null;
  }
): Promise<Task> {
  const response = await api.patch(`/tasks/${taskId}`, data);
  return response.data.task;
}
