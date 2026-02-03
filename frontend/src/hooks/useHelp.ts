import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as helpApi from '../api/help';

export function useSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['help-messages', sessionId],
    queryFn: () => (sessionId ? helpApi.getSessionMessages(sessionId) : []),
    enabled: !!sessionId,
  });
}

export function useSendMessage(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpApi.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-messages', sessionId] });
    },
  });
}

export function useGetContextHelp(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpApi.getContextHelp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-messages', sessionId] });
    },
  });
}

export function useClearSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: helpApi.clearSession,
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['help-messages', sessionId] });
    },
  });
}
