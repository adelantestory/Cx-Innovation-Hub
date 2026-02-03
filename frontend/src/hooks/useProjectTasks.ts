import { useQuery } from '@tanstack/react-query';
import { getProjectTasks } from '../services/projectsApi';

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute for tasks (more dynamic)
  });
}
