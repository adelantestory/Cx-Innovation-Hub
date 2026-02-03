import axios from 'axios';
import { HelpMessage } from '../../../shared/types/comment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getSessionMessages(sessionId: string): Promise<HelpMessage[]> {
  const response = await axios.get(`${API_URL}/api/help/session/${sessionId}`);
  return response.data.messages;
}

export async function sendMessage(data: {
  sessionId: string;
  userId: string;
  content: string;
  screenContext?: string;
}): Promise<{ userMessage: HelpMessage | null; aiMessage: HelpMessage }> {
  const response = await axios.post(
    `${API_URL}/api/help/session/${data.sessionId}/message`,
    {
      userId: data.userId,
      content: data.content,
      screenContext: data.screenContext,
    }
  );
  return response.data;
}

export async function getContextHelp(data: {
  sessionId: string;
  screenContext: string;
}): Promise<HelpMessage> {
  const response = await axios.post(
    `${API_URL}/api/help/session/${data.sessionId}/context`,
    {
      screenContext: data.screenContext,
    }
  );
  return response.data.message;
}

export async function clearSession(sessionId: string): Promise<void> {
  await axios.delete(`${API_URL}/api/help/session/${sessionId}`);
}
