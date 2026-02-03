import axios from 'axios';
import { Comment } from '../../../shared/types/comment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getTaskComments(taskId: string): Promise<Comment[]> {
  const response = await axios.get(`${API_URL}/api/comments/task/${taskId}`);
  return response.data.comments;
}

export async function createComment(data: {
  taskId: string;
  authorId: string;
  content: string;
}): Promise<Comment> {
  const response = await axios.post(
    `${API_URL}/api/comments/task/${data.taskId}`,
    {
      authorId: data.authorId,
      content: data.content,
    }
  );
  return response.data.comment;
}

export async function updateComment(data: {
  commentId: string;
  authorId: string;
  content: string;
}): Promise<Comment> {
  const response = await axios.patch(
    `${API_URL}/api/comments/${data.commentId}`,
    {
      authorId: data.authorId,
      content: data.content,
    }
  );
  return response.data.comment;
}

export async function deleteComment(
  commentId: string,
  authorId: string
): Promise<void> {
  await axios.delete(`${API_URL}/api/comments/${commentId}`, {
    data: { authorId },
  });
}
