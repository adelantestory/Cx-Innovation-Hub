import api from './api';
import { Project } from '../../../shared/types/project';
import { Task } from '../../../shared/types/task';

export async function getProjects(): Promise<Project[]> {
  const response = await api.get('/projects');
  return response.data.projects;
}

export async function getProject(projectId: string): Promise<Project> {
  const response = await api.get(`/projects/${projectId}`);
  return response.data.project;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data.tasks;
}
