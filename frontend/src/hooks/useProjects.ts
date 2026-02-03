import { useQuery } from '@tanstack/react-query';
import { getProjects, getProject } from '../services/projectsApi';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}
