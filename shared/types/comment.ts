export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  author?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface HelpMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai';
  content: string;
  screenContext: string | null;
  createdAt: string;
}
