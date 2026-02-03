import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentsApi from '../api/comments';

export function useTaskComments(taskId: string | null) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => (taskId ? commentsApi.getTaskComments(taskId) : []),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentsApi.updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, authorId }: { commentId: string; authorId: string }) =>
      commentsApi.deleteComment(commentId, authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
  });
}
